import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export class UserRepository {
  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        favoriteTeam: true,
        stats: true,
        trophies: { orderBy: { wonAt: "desc" }, take: 10 },
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
        },
      },
    });
  }

  static async findProfileById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        favoriteTeam: true,
        stats: {
          include: {
            biggestWinOpponent: { select: { nickname: true } },
          },
        },
        trophies: { orderBy: { wonAt: "desc" }, take: 10 },
        achievements: {
          include: { achievement: true },
          orderBy: { unlockedAt: "desc" },
        },
      },
    });
  }

  static async findByNickname(nickname: string) {
    return prisma.user.findUnique({
      where: { nickname },
      include: { stats: true, favoriteTeam: true },
    });
  }

  static async getLeaderboard(limit = 50) {
    return prisma.user.findMany({
      orderBy: { elo: "desc" },
      take: limit,
      include: { stats: true, favoriteTeam: true },
    });
  }

  static async search(query: string, limit = 20) {
    return prisma.user.findMany({
      where: {
        nickname: { contains: query, mode: "insensitive" },
      },
      take: limit,
      include: { stats: true },
    });
  }

  static async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data: {
        ...data,
        stats: { create: {} },
      },
      include: { stats: true },
    });
  }

  static async updateElo(userId: string, newElo: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { elo: newElo, level: Math.floor(newElo / 100) + 1 },
    });
  }
}
