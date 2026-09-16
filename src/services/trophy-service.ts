import type { Prisma, TournamentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCompetitionTitleLabel } from "@/lib/fc-data/league-trophies";
import { calculateLevel } from "@/utils/points";

type Db = typeof prisma | Prisma.TransactionClient;

type AwardMatch = Prisma.MatchGetPayload<{
  include: {
    tournament: { include: { fcLeague: true; season: true } };
    homeParticipant: { include: { user: true; fcTeam: true } };
    awayParticipant: { include: { user: true; fcTeam: true } };
  };
}>;

export class TrophyService {
  /** Otorga el título al campeón cuando el torneo queda decidido. */
  static async maybeAwardFromCompletedMatch(
    db: Db,
    matchId: string
  ): Promise<boolean> {
    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          include: {
            fcLeague: true,
            season: true,
          },
        },
        homeParticipant: { include: { user: true, fcTeam: true } },
        awayParticipant: { include: { user: true, fcTeam: true } },
      },
    });

    if (!match || match.status !== "COMPLETED") return false;

    const existing = await db.trophy.findFirst({
      where: {
        tournamentId: match.tournamentId,
        placement: 1,
      },
    });
    if (existing) return false;

    const type = match.tournament.type as TournamentType;

    if (type === "LEAGUE" || type === "GROUPS") {
      return this.maybeAwardFromStandings(db, match);
    }

    return this.maybeAwardFromKnockoutFinal(db, match);
  }

  /** Liga / grupos: campeón = 1º de la tabla cuando todos los partidos terminaron. */
  private static async maybeAwardFromStandings(
    db: Db,
    match: AwardMatch
  ): Promise<boolean> {
    const pending = await db.match.count({
      where: {
        tournamentId: match.tournamentId,
        status: { not: "COMPLETED" },
      },
    });
    if (pending > 0) return false;

    const top = await db.standing.findFirst({
      where: {
        tournamentId: match.tournamentId,
        ...(match.tournament.type === "LEAGUE"
          ? { groupName: null }
          : {}),
      },
      orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
      include: {
        participant: true,
      },
    });

    if (!top?.participant) return false;

    return this.awardChampion(db, {
      userId: top.participant.userId,
      participantId: top.participant.id,
      tournamentId: match.tournamentId,
      tournamentName: match.tournament.name,
      leagueName: match.tournament.fcLeague?.name,
      leagueId: match.tournament.fcLeague?.fifaIndexId,
      seasonName: match.tournament.season?.name ?? null,
      wonAt: match.playedAt ?? new Date(),
    });
  }

  /** Eliminación / ida-vuelta: campeón = ganador de la última ronda. */
  private static async maybeAwardFromKnockoutFinal(
    db: Db,
    match: AwardMatch
  ): Promise<boolean> {
    if (match.groupName) return false;
    if (match.homeScore == null || match.awayScore == null) return false;
    if (match.homeScore === match.awayScore) {
      if (match.penaltiesHome == null || match.penaltiesAway == null) return false;
      if (match.penaltiesHome === match.penaltiesAway) return false;
    }

    const maxRound = await db.match.aggregate({
      where: {
        tournamentId: match.tournamentId,
        groupName: null,
      },
      _max: { round: true },
    });

    if (match.round !== maxRound._max.round) return false;

    const pendingFinals = await db.match.count({
      where: {
        tournamentId: match.tournamentId,
        groupName: null,
        round: match.round,
        status: { not: "COMPLETED" },
      },
    });
    if (pendingFinals > 0) return false;

    const homeWins =
      match.homeScore > match.awayScore ||
      (match.homeScore === match.awayScore &&
        (match.penaltiesHome ?? 0) > (match.penaltiesAway ?? 0));

    const winner = homeWins ? match.homeParticipant : match.awayParticipant;

    return this.awardChampion(db, {
      userId: winner.userId,
      participantId: winner.id,
      tournamentId: match.tournamentId,
      tournamentName: match.tournament.name,
      leagueName: match.tournament.fcLeague?.name,
      leagueId: match.tournament.fcLeague?.fifaIndexId,
      seasonName: match.tournament.season?.name ?? null,
      wonAt: match.playedAt ?? new Date(),
    });
  }

  private static async awardChampion(
    db: Db,
    input: {
      userId: string;
      participantId: string;
      tournamentId: string;
      tournamentName: string;
      leagueName?: string | null;
      leagueId?: string | null;
      seasonName: string | null;
      wonAt: Date;
    }
  ): Promise<boolean> {
    const title = getCompetitionTitleLabel(
      input.leagueName,
      input.tournamentName
    );

    await db.trophy.create({
      data: {
        userId: input.userId,
        tournamentId: input.tournamentId,
        title,
        placement: 1,
        seasonName: input.seasonName,
        wonAt: input.wonAt,
      },
    });

    await db.playerStats.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        titlesWon: 1,
      },
      update: { titlesWon: { increment: 1 } },
    });

    await db.tournament.update({
      where: { id: input.tournamentId },
      data: { status: "COMPLETED" },
    });

    await db.tournamentParticipant.update({
      where: { id: input.participantId },
      data: { placement: 1 },
    });

    await db.activity.create({
      data: {
        userId: input.userId,
        type: "TOURNAMENT_WON",
        title: `Campeón de ${input.tournamentName}`,
        metadata: {
          tournamentId: input.tournamentId,
          leagueId: input.leagueId,
          leagueName: input.leagueName ?? input.tournamentName,
        },
      },
    });

    return true;
  }

  static async listForUser(userId: string) {
    return prisma.trophy.findMany({
      where: { userId },
      orderBy: { wonAt: "desc" },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            type: true,
            fcLeague: {
              select: {
                id: true,
                name: true,
                fifaIndexId: true,
                logoUrl: true,
                country: true,
              },
            },
          },
        },
      },
    });
  }
}

/** Recalcula puntos desde partidos + XP de logros (sin base 1000/ELO viejo). */
export async function recalculateUserPoints(userId: string) {
  const { MATCH_POINTS } = await import("@/utils/points");

  const matches = await prisma.match.findMany({
    where: {
      status: "COMPLETED",
      OR: [
        { homeParticipant: { userId } },
        { awayParticipant: { userId } },
      ],
    },
    include: {
      homeParticipant: true,
      awayParticipant: true,
    },
    orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }],
  });

  let matchPoints = 0;

  for (const match of matches) {
    const isHome = match.homeParticipant.userId === userId;
    const myScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    const oppScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
    const won = myScore > oppScore;
    const drawn = myScore === oppScore;

    matchPoints += won
      ? MATCH_POINTS.win
      : drawn
        ? MATCH_POINTS.draw
        : MATCH_POINTS.loss;

    if (match.mvpUserId === userId) matchPoints += MATCH_POINTS.mvpBonus;
  }

  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: { select: { type: true, xpReward: true } } },
  });

  const thresholds: Record<string, number> = {
    POINTS_100: 100,
    POINTS_500: 500,
    POINTS_1000: 1000,
    LEGEND: 2000,
    POINTS_2500: 2500,
    POINTS_5000: 5000,
  };

  let achievementXp = 0;
  const toRevoke: string[] = [];

  for (const ua of achievements) {
    const type = ua.achievement.type;
    const need = thresholds[type];
    if (need != null && matchPoints < need) {
      toRevoke.push(ua.id);
      continue;
    }
    achievementXp += ua.achievement.xpReward;
  }

  if (toRevoke.length > 0) {
    await prisma.userAchievement.deleteMany({
      where: { id: { in: toRevoke } },
    });
  }

  const newPoints = matchPoints + achievementXp;

  await prisma.user.update({
    where: { id: userId },
    data: {
      elo: newPoints,
      level: calculateLevel(newPoints),
    },
  });

  return {
    matchPoints,
    achievementXp,
    total: newPoints,
    revoked: toRevoke.length,
  };
}

export async function recalculateAllUserPoints() {
  const users = await prisma.user.findMany({ select: { id: true, nickname: true } });
  const results = [];
  for (const user of users) {
    const result = await recalculateUserPoints(user.id);
    results.push({ nickname: user.nickname, ...result });
  }
  return results;
}
