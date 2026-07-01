import { prisma } from "@/lib/prisma";
import { getMatchEloScores } from "@/utils/elo";
import type { MatchResultInput } from "@/types";

export class MatchService {
  static async recordResult(input: MatchResultInput) {
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      include: {
        tournament: true,
        homeParticipant: { include: { user: true } },
        awayParticipant: { include: { user: true } },
      },
    });

    if (!match) throw new Error("Partido no encontrado");
    if (match.status === "COMPLETED") throw new Error("Partido ya registrado");

    const homeUser = match.homeParticipant.user;
    const awayUser = match.awayParticipant.user;
    const { homeNewElo, awayNewElo } = getMatchEloScores(
      homeUser.elo,
      awayUser.elo,
      input.homeScore,
      input.awayScore
    );

    const homeWon = input.homeScore > input.awayScore;
    const awayWon = input.awayScore > input.homeScore;
    const isDraw = input.homeScore === input.awayScore;

    await prisma.$transaction(async (tx) => {
      await tx.match.update({
        where: { id: input.matchId },
        data: {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          penaltiesHome: input.penaltiesHome,
          penaltiesAway: input.penaltiesAway,
          mvpUserId: input.mvpUserId,
          status: "COMPLETED",
          playedAt: new Date(),
        },
      });

      if (input.events.length > 0) {
        await tx.matchEvent.createMany({
          data: input.events.map((e) => ({
            matchId: input.matchId,
            userId: e.userId,
            goals: e.goals ?? 0,
            assists: e.assists ?? 0,
            yellowCards: e.yellowCards ?? 0,
            redCards: e.redCards ?? 0,
            ownGoals: e.ownGoals ?? 0,
            isMvp: e.userId === input.mvpUserId,
          })),
        });
      }

      await this.updatePlayerStats(tx, homeUser.id, {
        won: homeWon,
        drawn: isDraw,
        lost: awayWon,
        gf: input.homeScore,
        ga: input.awayScore,
        newElo: homeNewElo,
        mvp: input.mvpUserId === homeUser.id,
        events: input.events.find((e) => e.userId === homeUser.id),
      });

      await this.updatePlayerStats(tx, awayUser.id, {
        won: awayWon,
        drawn: isDraw,
        lost: homeWon,
        gf: input.awayScore,
        ga: input.homeScore,
        newElo: awayNewElo,
        mvp: input.mvpUserId === awayUser.id,
        events: input.events.find((e) => e.userId === awayUser.id),
      });

      await this.updateHeadToHead(tx, homeUser.id, awayUser.id, {
        homeWon,
        awayWon,
        isDraw,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
      });

      await this.updateStandings(
        tx,
        match.tournamentId,
        match.homeParticipantId,
        match.awayParticipantId,
        input.homeScore,
        input.awayScore,
        match.groupName,
        match.tournament
      );

      await tx.activity.createMany({
        data: [
          {
            userId: homeUser.id,
            type: homeWon ? "MATCH_WON" : isDraw ? "MATCH_DRAWN" : "MATCH_LOST",
            title: `${homeWon ? "Victoria" : isDraw ? "Empate" : "Derrota"} vs ${awayUser.nickname}`,
            metadata: { matchId: input.matchId, score: `${input.homeScore}-${input.awayScore}` },
          },
          {
            userId: awayUser.id,
            type: awayWon ? "MATCH_WON" : isDraw ? "MATCH_DRAWN" : "MATCH_LOST",
            title: `${awayWon ? "Victoria" : isDraw ? "Empate" : "Derrota"} vs ${homeUser.nickname}`,
            metadata: { matchId: input.matchId, score: `${input.awayScore}-${input.homeScore}` },
          },
        ],
      });
    });

    return { success: true };
  }

  private static async updatePlayerStats(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    userId: string,
    data: {
      won: boolean;
      drawn: boolean;
      lost: boolean;
      gf: number;
      ga: number;
      newElo: number;
      mvp: boolean;
      events?: { goals?: number; assists?: number; yellowCards?: number; redCards?: number; ownGoals?: number };
    }
  ) {
    const stats = await tx.playerStats.findUnique({ where: { userId } });
    if (!stats) return;

    const streak = data.won
      ? stats.currentStreak >= 0
        ? stats.currentStreak + 1
        : 1
      : data.lost
        ? stats.currentStreak <= 0
          ? stats.currentStreak - 1
          : -1
        : 0;

    const margin = data.gf - data.ga;

    await tx.playerStats.update({
      where: { userId },
      data: {
        matchesPlayed: { increment: 1 },
        wins: data.won ? { increment: 1 } : undefined,
        draws: data.drawn ? { increment: 1 } : undefined,
        losses: data.lost ? { increment: 1 } : undefined,
        goalsFor: { increment: data.gf },
        goalsAgainst: { increment: data.ga },
        goalDifference: { increment: margin },
        avgGoalsPerGame:
          (stats.goalsFor + data.gf) / (stats.matchesPlayed + 1),
        biggestWin: data.won && margin > stats.biggestWin ? margin : undefined,
        biggestLoss: data.lost && margin < stats.biggestLoss ? margin : undefined,
        currentStreak: streak,
        bestStreak: Math.max(stats.bestStreak, Math.abs(streak)),
        cleanSheets: data.ga === 0 ? { increment: 1 } : undefined,
        totalAssists: data.events?.assists
          ? { increment: data.events.assists }
          : undefined,
        totalMvp: data.mvp ? { increment: 1 } : undefined,
        yellowCards: data.events?.yellowCards
          ? { increment: data.events.yellowCards }
          : undefined,
        redCards: data.events?.redCards
          ? { increment: data.events.redCards }
          : undefined,
        ownGoals: data.events?.ownGoals
          ? { increment: data.events.ownGoals }
          : undefined,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: { elo: data.newElo, level: Math.floor(data.newElo / 100) + 1 },
    });
  }

  private static async updateHeadToHead(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    userId: string,
    opponentId: string,
    data: {
      homeWon: boolean;
      awayWon: boolean;
      isDraw: boolean;
      homeScore: number;
      awayScore: number;
    }
  ) {
    const upsertH2H = async (
      uid: string,
      oid: string,
      won: boolean,
      drawn: boolean,
      lost: boolean,
      gf: number,
      ga: number
    ) => {
      const existing = await tx.headToHead.findUnique({
        where: { userId_opponentId: { userId: uid, opponentId: oid } },
      });

      const streak = won
        ? (existing?.currentStreak ?? 0) >= 0
          ? (existing?.currentStreak ?? 0) + 1
          : 1
        : lost
          ? (existing?.currentStreak ?? 0) <= 0
            ? (existing?.currentStreak ?? 0) - 1
            : -1
          : 0;

      const margin = gf - ga;

      await tx.headToHead.upsert({
        where: { userId_opponentId: { userId: uid, opponentId: oid } },
        create: {
          userId: uid,
          opponentId: oid,
          matchesPlayed: 1,
          wins: won ? 1 : 0,
          draws: drawn ? 1 : 0,
          losses: lost ? 1 : 0,
          goalsFor: gf,
          goalsAgainst: ga,
          biggestWin: won ? margin : 0,
          currentStreak: streak,
          bestStreak: Math.abs(streak),
        },
        update: {
          matchesPlayed: { increment: 1 },
          wins: won ? { increment: 1 } : undefined,
          draws: drawn ? { increment: 1 } : undefined,
          losses: lost ? { increment: 1 } : undefined,
          goalsFor: { increment: gf },
          goalsAgainst: { increment: ga },
          biggestWin: won && margin > (existing?.biggestWin ?? 0) ? margin : undefined,
          currentStreak: streak,
          bestStreak: Math.max(existing?.bestStreak ?? 0, Math.abs(streak)),
        },
      });
    };

    await upsertH2H(
      userId,
      opponentId,
      data.homeWon,
      data.isDraw,
      data.awayWon,
      data.homeScore,
      data.awayScore
    );
    await upsertH2H(
      opponentId,
      userId,
      data.awayWon,
      data.isDraw,
      data.homeWon,
      data.awayScore,
      data.homeScore
    );
  }

  private static async updateStandings(
    tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
    tournamentId: string,
    homeParticipantId: string,
    awayParticipantId: string,
    homeScore: number,
    awayScore: number,
    groupName: string | null,
    tournament: { pointsWin: number; pointsDraw: number; pointsLoss: number }
  ) {
    const homeStanding = await tx.standing.findFirst({
      where: { tournamentId, participantId: homeParticipantId, groupName },
    });
    const awayStanding = await tx.standing.findFirst({
      where: { tournamentId, participantId: awayParticipantId, groupName },
    });

    if (!homeStanding || !awayStanding) return;

    const homeWon = homeScore > awayScore;
    const isDraw = homeScore === awayScore;

    const homePoints = homeWon
      ? tournament.pointsWin
      : isDraw
        ? tournament.pointsDraw
        : tournament.pointsLoss;
    const awayPoints = !homeWon && !isDraw
      ? tournament.pointsWin
      : isDraw
        ? tournament.pointsDraw
        : tournament.pointsLoss;

    await tx.standing.update({
      where: { id: homeStanding.id },
      data: {
        played: { increment: 1 },
        won: homeWon ? { increment: 1 } : undefined,
        drawn: isDraw ? { increment: 1 } : undefined,
        lost: !homeWon && !isDraw ? { increment: 1 } : undefined,
        gf: { increment: homeScore },
        ga: { increment: awayScore },
        gd: { increment: homeScore - awayScore },
        points: { increment: homePoints },
      },
    });

    await tx.standing.update({
      where: { id: awayStanding.id },
      data: {
        played: { increment: 1 },
        won: !homeWon && !isDraw ? { increment: 1 } : undefined,
        drawn: isDraw ? { increment: 1 } : undefined,
        lost: homeWon ? { increment: 1 } : undefined,
        gf: { increment: awayScore },
        ga: { increment: homeScore },
        gd: { increment: awayScore - homeScore },
        points: { increment: awayPoints },
      },
    });
  }
}
