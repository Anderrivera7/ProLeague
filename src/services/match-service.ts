import { prisma } from "@/lib/prisma";
import { getMatchPointUpdates } from "@/utils/points";
import { isBetterWin } from "@/utils/match-stats";
import { buildMatchResultMessage } from "@/utils/match-result-message";
import { AchievementService } from "@/services/achievement-service";
import type { MatchResultInput } from "@/types";

function aggregateUserEvents(
  playerStats: MatchResultInput["playerStats"],
  userId: string
) {
  return playerStats
    .filter((p) => p.userId === userId)
    .reduce(
      (acc, p) => ({
        goals: acc.goals + p.goals,
        yellowCards: acc.yellowCards + p.yellowCards,
        redCards: acc.redCards + p.redCards,
        ownGoals: acc.ownGoals + p.ownGoals,
      }),
      { goals: 0, yellowCards: 0, redCards: 0, ownGoals: 0 }
    );
}

export class MatchService {
  static async recordResult(input: MatchResultInput) {
    const match = await prisma.match.findUnique({
      where: { id: input.matchId },
      include: {
        tournament: true,
        homeParticipant: { include: { user: true, fcTeam: true } },
        awayParticipant: { include: { user: true, fcTeam: true } },
      },
    });

    if (!match) throw new Error("Partido no encontrado");
    if (match.status === "COMPLETED") throw new Error("Partido ya registrado");

    const homeUser = match.homeParticipant.user;
    const awayUser = match.awayParticipant.user;
    const { homeNewPoints, awayNewPoints } = getMatchPointUpdates(
      homeUser.elo,
      awayUser.elo,
      input.homeScore,
      input.awayScore,
      input.mvpUserId,
      homeUser.id,
      awayUser.id
    );

    const homeWon = input.homeScore > input.awayScore;
    const awayWon = input.awayScore > input.homeScore;
    const isDraw = input.homeScore === input.awayScore;

    const homeEvents = aggregateUserEvents(input.playerStats, homeUser.id);
    const awayEvents = aggregateUserEvents(input.playerStats, awayUser.id);

    await prisma.$transaction(
      async (tx) => {
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

        if (input.playerStats.length > 0) {
          await tx.matchPlayerStat.createMany({
            data: input.playerStats.map((p) => ({
              matchId: input.matchId,
              fcPlayerId: p.fcPlayerId,
              userId: p.userId,
              goals: p.goals,
              yellowCards: p.yellowCards,
              redCards: p.redCards,
              ownGoals: p.ownGoals,
            })),
          });
        }

        await tx.matchEvent.createMany({
          data: [
            {
              matchId: input.matchId,
              userId: homeUser.id,
              goals: homeEvents.goals,
              assists: 0,
              yellowCards: homeEvents.yellowCards,
              redCards: homeEvents.redCards,
              ownGoals: homeEvents.ownGoals,
              isMvp: input.mvpUserId === homeUser.id,
            },
            {
              matchId: input.matchId,
              userId: awayUser.id,
              goals: awayEvents.goals,
              assists: 0,
              yellowCards: awayEvents.yellowCards,
              redCards: awayEvents.redCards,
              ownGoals: awayEvents.ownGoals,
              isMvp: input.mvpUserId === awayUser.id,
            },
          ],
        });

        await this.updatePlayerStats(tx, homeUser.id, {
          won: homeWon,
          drawn: isDraw,
          lost: awayWon,
          gf: input.homeScore,
          ga: input.awayScore,
          newPoints: homeNewPoints,
          mvp: input.mvpUserId === homeUser.id,
          opponentId: awayUser.id,
          events: homeEvents,
        });

        await this.updatePlayerStats(tx, awayUser.id, {
          won: awayWon,
          drawn: isDraw,
          lost: homeWon,
          gf: input.awayScore,
          ga: input.homeScore,
          newPoints: awayNewPoints,
          mvp: input.mvpUserId === awayUser.id,
          opponentId: homeUser.id,
          events: awayEvents,
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
              metadata: {
                matchId: input.matchId,
                score: `${input.homeScore}-${input.awayScore}`,
              },
            },
            {
              userId: awayUser.id,
              type: awayWon ? "MATCH_WON" : isDraw ? "MATCH_DRAWN" : "MATCH_LOST",
              title: `${awayWon ? "Victoria" : isDraw ? "Empate" : "Derrota"} vs ${homeUser.nickname}`,
              metadata: {
                matchId: input.matchId,
                score: `${input.awayScore}-${input.homeScore}`,
              },
            },
          ],
        });

        if (match.tournamentId) {
          const chatContent = buildMatchResultMessage({
            homeScore: input.homeScore,
            awayScore: input.awayScore,
            homeParticipant: match.homeParticipant,
            awayParticipant: match.awayParticipant,
          });

          if (chatContent) {
            await tx.tournamentMessage.create({
              data: {
                tournamentId: match.tournamentId,
                type: "MATCH_RESULT",
                content: chatContent,
                matchId: input.matchId,
              },
            });
          }
        }
      },
      { timeout: 15000 }
    );

    await AchievementService.syncForUser(homeUser.id, prisma);
    await AchievementService.syncForUser(awayUser.id, prisma);

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
      newPoints: number;
      mvp: boolean;
      opponentId: string;
      events: {
        goals: number;
        yellowCards: number;
        redCards: number;
        ownGoals: number;
      };
    }
  ) {
    const stats = await tx.playerStats.findUnique({ where: { userId } });
    if (!stats) return;

    const streak = data.won ? stats.currentStreak + 1 : 0;

    const margin = data.gf - data.ga;
    const isNewBestWin =
      data.won &&
      isBetterWin(margin, data.gf, stats.biggestWin, stats.biggestWinFor);

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
        biggestWin: isNewBestWin ? margin : undefined,
        biggestWinFor: isNewBestWin ? data.gf : undefined,
        biggestWinAgainst: isNewBestWin ? data.ga : undefined,
        biggestWinOpponentId: isNewBestWin ? data.opponentId : undefined,
        biggestLoss:
          data.lost && margin < stats.biggestLoss ? margin : undefined,
        currentStreak: streak,
        bestStreak: Math.max(stats.bestStreak, streak),
        cleanSheets: data.ga === 0 ? { increment: 1 } : undefined,
        totalMvp: data.mvp ? { increment: 1 } : undefined,
        yellowCards: data.events.yellowCards
          ? { increment: data.events.yellowCards }
          : undefined,
        redCards: data.events.redCards
          ? { increment: data.events.redCards }
          : undefined,
        ownGoals: data.events.ownGoals
          ? { increment: data.events.ownGoals }
          : undefined,
      },
    });

    await tx.user.update({
      where: { id: userId },
      data: {
        elo: data.newPoints,
        level: Math.floor(data.newPoints / 100) + 1,
      },
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

      const streak = won ? (existing?.currentStreak ?? 0) + 1 : 0;

      const margin = gf - ga;
      const oldMargin = existing?.biggestWin ?? 0;
      const oldGf = existing?.biggestWinFor ?? 0;
      const isNewBestWin = won && isBetterWin(margin, gf, oldMargin, oldGf);

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
          biggestWinFor: won ? gf : 0,
          biggestWinAgainst: won ? ga : 0,
          currentStreak: streak,
          bestStreak: streak,
        },
        update: {
          matchesPlayed: { increment: 1 },
          wins: won ? { increment: 1 } : undefined,
          draws: drawn ? { increment: 1 } : undefined,
          losses: lost ? { increment: 1 } : undefined,
          goalsFor: { increment: gf },
          goalsAgainst: { increment: ga },
          biggestWin: isNewBestWin ? margin : undefined,
          biggestWinFor: isNewBestWin ? gf : undefined,
          biggestWinAgainst: isNewBestWin ? ga : undefined,
          currentStreak: streak,
          bestStreak: Math.max(existing?.bestStreak ?? 0, streak),
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
    const awayPoints =
      !homeWon && !isDraw
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
