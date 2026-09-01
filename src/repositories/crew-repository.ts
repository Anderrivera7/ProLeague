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
          wins: true,
          matchesPlayed: true,
        },
      },
      trophies: {
        orderBy: { wonAt: "desc" as const },
        take: 5,
        select: {
          id: true,
          title: true,
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
