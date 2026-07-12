import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { Prisma as PrismaNamespace } from "@prisma/client";

const userProfileInclude = {
  favoriteTeam: true,
  stats: true,
  trophies: { orderBy: { wonAt: "desc" as const }, take: 10 },
  achievements: {
    include: { achievement: true },
    orderBy: { unlockedAt: "desc" as const },
  },
} satisfies Prisma.UserInclude;

/** Consulta ligera para sesión / layout (sin trofeos ni logros). */
const sessionUserInclude = {
  favoriteTeam: true,
  stats: true,
} satisfies Prisma.UserInclude;

export class UserRepository {
  static async findSessionById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        elo: true,
        level: true,
      },
    });
  }

  static async findProfileCardById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        country: true,
        level: true,
        elo: true,
        lastActiveAt: true,
        stats: true,
        achievements: {
          take: 4,
          orderBy: { unlockedAt: "desc" },
          include: {
            achievement: {
              select: { id: true, title: true, description: true, xpReward: true },
            },
          },
        },
      },
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: userProfileInclude,
    });
  }

  static async findByIdForSession(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: sessionUserInclude,
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
      select: { id: true, nickname: true },
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

  /** Crea perfil si no existe; tolera requests paralelos (layout + página). */
  static async findOrCreateFromAuth(data: {
    id: string;
    email: string;
    nickname: string;
    avatarUrl?: string | null;
    country?: string | null;
  }) {
    const existing = await this.findByIdForSession(data.id);
    if (existing) return existing;

    try {
      return await prisma.user.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          email: data.email,
          nickname: data.nickname,
          avatarUrl: data.avatarUrl ?? null,
          country: data.country ?? null,
          stats: { create: {} },
        },
        update: {},
        include: sessionUserInclude,
      });
    } catch (error) {
      if (
        error instanceof PrismaNamespace.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const profile = await this.findByIdForSession(data.id);
        if (profile) return profile;

        const field = Array.isArray(error.meta?.target)
          ? error.meta.target[0]
          : error.meta?.target;

        if (field === "nickname") {
          return this.findOrCreateFromAuth({
            ...data,
            nickname: `${data.nickname}_${data.id.slice(0, 4)}`.slice(0, 20),
          });
        }
      }
      throw error;
    }
  }

  static async updateElo(userId: string, newElo: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { elo: newElo, level: Math.floor(newElo / 100) + 1 },
    });
  }

  static async updateProfile(
    userId: string,
    data: { nickname?: string; avatarUrl?: string | null }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nickname: true,
        avatarUrl: true,
        elo: true,
        level: true,
      },
    });
  }

  static async getRankInfo(elo: number) {
    const [higherCount, total] = await prisma.$transaction([
      prisma.user.count({ where: { elo: { gt: elo } } }),
      prisma.user.count(),
    ]);
    return { rank: higherCount + 1, total };
  }
}
