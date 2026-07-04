import { prisma } from "@/lib/prisma";
import type { Prisma, TournamentType } from "@prisma/client";
import { generateJoinCode } from "@/utils/join-code";

export class TournamentRepository {
  static async findById(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: true,
        fcLeague: true,
        participants: {
          include: {
            user: true,
            fcTeam: { include: { league: true } },
          },
          orderBy: { seed: "asc" },
        },
        matches: {
          include: {
            tournament: { select: { id: true, name: true } },
            homeParticipant: { include: { user: true, fcTeam: true } },
            awayParticipant: { include: { user: true, fcTeam: true } },
          },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
        standings: {
          include: { participant: { include: { user: true, fcTeam: true } } },
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
