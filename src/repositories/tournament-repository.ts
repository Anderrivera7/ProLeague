import { prisma } from "@/lib/prisma";
import type { Prisma, TournamentType } from "@prisma/client";

export class TournamentRepository {
  static async findById(id: string) {
    return prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: true,
        participants: {
          include: { user: true },
          orderBy: { seed: "asc" },
        },
        matches: {
          include: {
            homeParticipant: { include: { user: true } },
            awayParticipant: { include: { user: true } },
          },
          orderBy: [{ round: "asc" }, { scheduledAt: "asc" }],
        },
        standings: {
          include: { participant: { include: { user: true } } },
          orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
        },
        _count: { select: { participants: true, matches: true } },
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
        _count: { select: { participants: true, matches: true } },
      },
      orderBy: { createdAt: "desc" },
      take: filters?.limit ?? 50,
    });
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

  static async addParticipant(tournamentId: string, userId: string, seed?: number) {
    return prisma.tournamentParticipant.create({
      data: { tournamentId, userId, seed },
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
