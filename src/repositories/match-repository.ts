import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class MatchRepository {
  static async findById(id: string) {
    return prisma.match.findUnique({
      where: { id },
      include: {
        tournament: true,
        homeParticipant: { include: { user: true, fcTeam: true } },
        awayParticipant: { include: { user: true, fcTeam: true } },
        events: { include: { user: true } },
        playerStats: { include: { fcPlayer: true } },
        mvpUser: true,
      },
    });
  }

  static async findUpcoming(userId: string, limit = 5) {
    return prisma.match.findMany({
      where: {
        status: "SCHEDULED",
        OR: [
          { homeParticipant: { userId } },
          { awayParticipant: { userId } },
        ],
        scheduledAt: { gte: new Date() },
      },
      include: {
        homeParticipant: { include: { user: true } },
        awayParticipant: { include: { user: true } },
        tournament: true,
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
    });
  }

  static async findRecent(userId: string, limit = 5) {
    return prisma.match.findMany({
      where: {
        status: "COMPLETED",
        OR: [
          { homeParticipant: { userId } },
          { awayParticipant: { userId } },
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

  static async updateResult(
    matchId: string,
    data: Prisma.MatchUpdateInput
  ) {
    return prisma.match.update({
      where: { id: matchId },
      data: { ...data, status: "COMPLETED", playedAt: new Date() },
    });
  }

  static async createEvents(
    matchId: string,
    events: {
      userId: string;
      goals?: number;
      assists?: number;
      yellowCards?: number;
      redCards?: number;
      ownGoals?: number;
      isMvp?: boolean;
    }[]
  ) {
    return prisma.matchEvent.createMany({
      data: events.map((e) => ({ matchId, ...e })),
    });
  }
}
