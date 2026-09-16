import { prisma } from "@/lib/prisma";

const memberInclude = {
  user: {
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      elo: true,
      level: true,
      stats: {
        select: {
          titlesWon: true,
          relegations: true,
          wins: true,
          losses: true,
          matchesPlayed: true,
          biggestWin: true,
          biggestWinFor: true,
          biggestWinAgainst: true,
          biggestLoss: true,
          goalsFor: true,
          goalsAgainst: true,
          goalDifference: true,
        },
      },
      trophies: {
        orderBy: { wonAt: "desc" as const },
        take: 5,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          wonAt: true,
          tournament: {
            select: {
              fcLeague: { select: { fifaIndexId: true, name: true } },
            },
          },
        },
      },
    },
  },
} as const;

export class CrewRepository {
  /** Descensos: puestos de cola en ligas completadas + eliminaciones. */
  static async countRelegationsByUser(userIds: string[]) {
    const counts = new Map<string, number>(userIds.map((id) => [id, 0]));
    if (userIds.length === 0) return counts;

    const leagues = await prisma.tournament.findMany({
      where: {
        status: "COMPLETED",
        type: "LEAGUE",
        participants: { some: { userId: { in: userIds } } },
      },
      select: {
        id: true,
        standings: {
          where: { OR: [{ groupName: null }, { groupName: "" }] },
          orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
          select: {
            participant: { select: { userId: true } },
          },
        },
      },
    });

    for (const league of leagues) {
      const allOrdered = league.standings.map((s) => s.participant.userId);
      if (allOrdered.length < 2) continue;

      const spots = allOrdered.length >= 8 ? 2 : 1;
      const relegated = new Set(allOrdered.slice(-spots));
      for (const id of userIds) {
        if (!relegated.has(id)) continue;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }

    const eliminations = await prisma.tournamentParticipant.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
        eliminated: true,
        tournament: { status: "COMPLETED" },
      },
      _count: { _all: true },
    });

    for (const row of eliminations) {
      counts.set(row.userId, (counts.get(row.userId) ?? 0) + row._count._all);
    }

    return counts;
  }

  /** Goleadas entre miembros del grupo (HeadToHead). */
  static async listCrewThrashings(userIds: string[]) {
    if (userIds.length < 2) return [];
    return prisma.headToHead.findMany({
      where: {
        userId: { in: userIds },
        opponentId: { in: userIds },
        biggestWin: { gt: 0 },
      },
      select: {
        userId: true,
        opponentId: true,
        biggestWin: true,
        biggestWinFor: true,
        biggestWinAgainst: true,
        opponent: { select: { nickname: true } },
      },
    });
  }

  static async findByJoinCode(joinCode: string) {
    return prisma.crew.findUnique({
      where: { joinCode },
      include: { members: { include: memberInclude } },
    });
  }

  static async findById(crewId: string) {
    return prisma.crew.findUnique({
      where: { id: crewId },
      include: {
        owner: { select: { id: true, nickname: true } },
        members: { include: memberInclude },
      },
    });
  }

  static async listForUser(userId: string) {
    return prisma.crew.findMany({
      where: { members: { some: { userId } } },
      include: {
        owner: { select: { id: true, nickname: true } },
        _count: { select: { members: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async isMember(crewId: string, userId: string) {
    const row = await prisma.crewMember.findUnique({
      where: { crewId_userId: { crewId, userId } },
    });
    return !!row;
  }

  static async create(data: {
    name: string;
    joinCode: string;
    ownerId: string;
  }) {
    return prisma.crew.create({
      data: {
        name: data.name,
        joinCode: data.joinCode,
        ownerId: data.ownerId,
        members: { create: { userId: data.ownerId } },
      },
      include: { _count: { select: { members: true } } },
    });
  }

  static async addMember(crewId: string, userId: string) {
    return prisma.crewMember.create({
      data: { crewId, userId },
    });
  }

  static async removeMember(crewId: string, userId: string) {
    return prisma.crewMember.delete({
      where: { crewId_userId: { crewId, userId } },
    });
  }

  static async deleteCrew(crewId: string) {
    return prisma.crew.delete({ where: { id: crewId } });
  }

  static async countMembers(crewId: string) {
    return prisma.crewMember.count({ where: { crewId } });
  }
}
