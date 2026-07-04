import { prisma } from "@/lib/prisma";

export class StatsRepository {
  static async getTopScorers(limit = 10) {
    const results = await prisma.matchEvent.groupBy({
      by: ["userId"],
      _sum: { goals: true },
      orderBy: { _sum: { goals: "desc" } },
      take: limit,
    });

    const users = await prisma.user.findMany({
      where: { id: { in: results.map((r) => r.userId) } },
    });

    return results.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      nickname: users.find((u) => u.id === r.userId)?.nickname ?? "",
      avatarUrl: users.find((u) => u.id === r.userId)?.avatarUrl ?? null,
      value: r._sum.goals ?? 0,
    }));
  }

  static async getTopAssists(limit = 10) {
    const results = await prisma.matchEvent.groupBy({
      by: ["userId"],
      _sum: { assists: true },
      orderBy: { _sum: { assists: "desc" } },
      take: limit,
    });

    const users = await prisma.user.findMany({
      where: { id: { in: results.map((r) => r.userId) } },
    });

    return results.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      nickname: users.find((u) => u.id === r.userId)?.nickname ?? "",
      avatarUrl: users.find((u) => u.id === r.userId)?.avatarUrl ?? null,
      value: r._sum.assists ?? 0,
    }));
  }

  static async getMostWins(limit = 10) {
    return prisma.playerStats.findMany({
      orderBy: { wins: "desc" },
      take: limit,
      include: { user: true },
    });
  }

  static async getEloRanking(limit = 50) {
    return prisma.user.findMany({
      orderBy: { elo: "desc" },
      take: limit,
      include: { stats: true },
    });
  }

  static async getHeadToHead(userId: string, opponentId: string) {
    return prisma.headToHead.findUnique({
      where: { userId_opponentId: { userId, opponentId } },
    });
  }

  static async getHeadToHeadMatches(userId: string, opponentId: string, limit = 10) {
    return prisma.match.findMany({
      where: {
        status: "COMPLETED",
        OR: [
          {
            homeParticipant: { userId },
            awayParticipant: { userId: opponentId },
          },
          {
            homeParticipant: { userId: opponentId },
            awayParticipant: { userId },
          },
        ],
      },
      include: {
        homeParticipant: { include: { user: true } },
        awayParticipant: { include: { user: true } },
        tournament: true,
      },
      orderBy: { playedAt: "desc" },
      take: limit,
    });
  }

  static async getTournamentPlayerStats(tournamentId: string, userId: string) {
    const aggregated = await prisma.matchPlayerStat.groupBy({
      by: ["fcPlayerId"],
      where: {
        userId,
        match: { tournamentId, status: "COMPLETED" },
      },
      _sum: {
        goals: true,
        yellowCards: true,
        redCards: true,
        ownGoals: true,
      },
    });

    if (aggregated.length === 0) return [];

    const players = await prisma.fcPlayer.findMany({
      where: { id: { in: aggregated.map((s) => s.fcPlayerId) } },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        jerseyNumber: true,
      },
    });

    return aggregated.map((s) => ({
      fcPlayerId: s.fcPlayerId,
      goals: s._sum.goals ?? 0,
      yellowCards: s._sum.yellowCards ?? 0,
      redCards: s._sum.redCards ?? 0,
      ownGoals: s._sum.ownGoals ?? 0,
      fcPlayer: players.find((p) => p.id === s.fcPlayerId) ?? null,
    }));
  }

  static async getTournamentScorerRanking(tournamentId: string) {
    const aggregated = await prisma.matchPlayerStat.groupBy({
      by: ["fcPlayerId", "userId"],
      where: {
        goals: { gt: 0 },
        match: { tournamentId, status: "COMPLETED" },
      },
      _sum: { goals: true },
    });

    if (aggregated.length === 0) return [];

    const sorted = [...aggregated].sort(
      (a, b) => (b._sum.goals ?? 0) - (a._sum.goals ?? 0)
    );

    const [players, users] = await Promise.all([
      prisma.fcPlayer.findMany({
        where: { id: { in: sorted.map((s) => s.fcPlayerId) } },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: { id: { in: sorted.map((s) => s.userId) } },
        select: { id: true, nickname: true },
      }),
    ]);

    return sorted.map((s, i) => ({
      rank: i + 1,
      goals: s._sum.goals ?? 0,
      playerName: players.find((p) => p.id === s.fcPlayerId)?.name ?? "—",
      nickname: users.find((u) => u.id === s.userId)?.nickname ?? "",
    }));
  }

  static async getTournamentCardRanking(tournamentId: string) {
    const aggregated = await prisma.matchPlayerStat.groupBy({
      by: ["fcPlayerId", "userId"],
      where: {
        match: { tournamentId, status: "COMPLETED" },
        OR: [{ yellowCards: { gt: 0 } }, { redCards: { gt: 0 } }],
      },
      _sum: { yellowCards: true, redCards: true },
    });

    if (aggregated.length === 0) return [];

    const sorted = [...aggregated].sort((a, b) => {
      const aTotal = (a._sum.yellowCards ?? 0) + (a._sum.redCards ?? 0);
      const bTotal = (b._sum.yellowCards ?? 0) + (b._sum.redCards ?? 0);
      return bTotal - aTotal;
    });

    const [players, users] = await Promise.all([
      prisma.fcPlayer.findMany({
        where: { id: { in: sorted.map((s) => s.fcPlayerId) } },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: { id: { in: sorted.map((s) => s.userId) } },
        select: { id: true, nickname: true },
      }),
    ]);

    return sorted.map((s, i) => ({
      rank: i + 1,
      yellowCards: s._sum.yellowCards ?? 0,
      redCards: s._sum.redCards ?? 0,
      playerName: players.find((p) => p.id === s.fcPlayerId)?.name ?? "—",
      nickname: users.find((u) => u.id === s.userId)?.nickname ?? "",
    }));
  }
}
