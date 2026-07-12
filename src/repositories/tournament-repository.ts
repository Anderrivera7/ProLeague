import { prisma } from "@/lib/prisma";
import type { Prisma, TournamentType } from "@prisma/client";
import { generateJoinCode } from "@/utils/join-code";

const participantUserTeamInclude = {
  user: { select: { id: true, nickname: true, elo: true } },
  fcTeam: {
    select: {
      id: true,
      name: true,
      country: true,
      crestUrl: true,
      fifaIndexId: true,
      league: { select: { id: true, name: true } },
    },
  },
} as const;

const matchParticipantInclude = {
  user: { select: { id: true, nickname: true } },
  fcTeam: {
    select: {
      id: true,
      name: true,
      country: true,
      crestUrl: true,
      fifaIndexId: true,
    },
  },
} as const;

export class TournamentRepository {
  static async findById(id: string) {
    return this.findByIdForDetail(id);
  }

  static async findByIdMeta(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        creatorId: true,
        joinCode: true,
        status: true,
        maxParticipants: true,
      },
    });
  }

  static async findByIdForSelectTeam(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        fcLeagueId: true,
        fcLeague: {
          select: { id: true, name: true, fifaIndexId: true },
        },
        participants: {
          select: { userId: true, fcTeamId: true },
        },
      },
    });
  }

  static async isTeamTaken(
    tournamentId: string,
    fcTeamId: string,
    excludeUserId: string
  ) {
    const row = await prisma.tournamentParticipant.findFirst({
      where: {
        tournamentId,
        fcTeamId,
        userId: { not: excludeUserId },
      },
      select: { id: true },
    });
    return Boolean(row);
  }

  static async findByIdForDetail(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, nickname: true } },
        fcLeague: true,
        participants: {
          include: participantUserTeamInclude,
          orderBy: { seed: "asc" },
        },
        matches: {
          select: {
            id: true,
            round: true,
            groupName: true,
            bracketPosition: true,
            leg: true,
            status: true,
            homeScore: true,
            awayScore: true,
            scheduledAt: true,
            homeParticipantId: true,
            awayParticipantId: true,
            homeParticipant: {
              select: {
                id: true,
                seed: true,
                userId: true,
                ...matchParticipantInclude,
              },
            },
            awayParticipant: {
              select: {
                id: true,
                seed: true,
                userId: true,
                ...matchParticipantInclude,
              },
            },
          },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
        standings: {
          include: { participant: { include: participantUserTeamInclude } },
          orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
        },
        _count: { select: { participants: true, matches: true } },
      },
    });
  }

  static async findByJoinCode(joinCode: string) {
    return prisma.tournament.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
      include: {
        fcLeague: true,
        _count: { select: { participants: true } },
      },
    });
  }

  static async findAll(filters?: {
    status?: string;
    creatorId?: string;
    limit?: number;
  }) {
    return prisma.tournament.findMany({
      where: {
        ...(filters?.status && {
          status: filters.status as Prisma.EnumTournamentStatusFilter,
        }),
        ...(filters?.creatorId && { creatorId: filters.creatorId }),
      },
      include: {
        creator: true,
        fcLeague: true,
        _count: { select: { participants: true, matches: true } },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 50,
    });
  }

  static async createUniqueJoinCode(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const joinCode = generateJoinCode();
      const existing = await prisma.tournament.findUnique({
        where: { joinCode },
      });
      if (!existing) return joinCode;
    }
    throw new Error("No se pudo generar código único");
  }

  static async create(data: Prisma.TournamentCreateInput) {
    return prisma.tournament.create({ data });
  }

  static async update(id: string, data: Prisma.TournamentUpdateInput) {
    return prisma.tournament.update({ where: { id }, data });
  }

  static async delete(id: string) {
    return prisma.tournament.delete({ where: { id } });
  }

  static async addParticipant(
    tournamentId: string,
    userId: string,
    seed?: number
  ) {
    return prisma.tournamentParticipant.create({
      data: { tournamentId, userId, seed },
      include: { user: true, fcTeam: true },
    });
  }

  static async getParticipant(tournamentId: string, userId: string) {
    return prisma.tournamentParticipant.findUnique({
      where: { tournamentId_userId: { tournamentId, userId } },
      include: { fcTeam: true, user: true },
    });
  }

  static async setParticipantTeam(
    tournamentId: string,
    userId: string,
    fcTeamId: string
  ) {
    return prisma.tournamentParticipant.update({
      where: { tournamentId_userId: { tournamentId, userId } },
      data: { fcTeamId },
      include: { fcTeam: true, user: true },
    });
  }

  static async createMatches(
    tournamentId: string,
    matches: {
      round: number;
      groupName?: string;
      leg: number;
      bracketPosition?: number;
      homeParticipantId: string;
      awayParticipantId: string;
      scheduledAt?: Date;
    }[]
  ) {
    return prisma.match.createMany({
      data: matches.map((m) => ({ tournamentId, ...m })),
    });
  }

  static async createStandings(
    tournamentId: string,
    standings: {
      participantId: string;
      groupName?: string | null;
    }[]
  ) {
    return prisma.standing.createMany({
      data: standings.map((s) => ({
        tournamentId,
        participantId: s.participantId,
        groupName: s.groupName,
      })),
    });
  }
}
