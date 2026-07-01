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
}
