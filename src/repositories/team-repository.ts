import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { resolveTeamCrestUrl } from "@/lib/fc-data/club-ids";
export type TeamWithRelations = Prisma.FcTeamGetPayload<{
  include: { league: true; players: true };
}>;

export class TeamRepository {
  /** ea_id en FIFA Index → fifaIndexId en DB */
  static async findByEaId(eaId: string) {
    return prisma.fcTeam.findUnique({
      where: { fifaIndexId: eaId },
      include: {
        league: true,
        players: { orderBy: [{ jerseyNumber: "asc" }, { overall: "desc" }] },
      },
    });
  }

  static async findById(id: string) {
    return prisma.fcTeam.findUnique({
      where: { id },
      include: {
        league: true,
        players: { orderBy: [{ jerseyNumber: "asc" }, { overall: "desc" }] },
      },
    });
  }

  static async getLeagues() {
    return prisma.fcLeague.findMany({
      include: { _count: { select: { teams: true } } },
      orderBy: { name: "asc" },
    });
  }

  static async search(query: string, leagueId?: string, limit = 50) {
    const teams = await prisma.fcTeam.findMany({      where: {
        ...(leagueId && { leagueId }),
        ...(query && {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { country: { contains: query, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        league: true,
        _count: { select: { players: true } },
      },
      orderBy: { overall: "desc" },
      take: limit,
    });

    return teams.map((team) => ({
      ...team,
      crestUrl: resolveTeamCrestUrl(team.crestUrl, team.fifaIndexId),
    }));
  }

  static async upsertFromSync(data: {
    eaId: string;
    name: string;
    shortName?: string;
    country?: string;
    crestUrl?: string;
    overall?: number;
    attack?: number;
    midfield?: number;
    defense?: number;
    leagueId?: string;
  }) {
    return prisma.fcTeam.upsert({
      where: { fifaIndexId: data.eaId },
      create: {
        fifaIndexId: data.eaId,
        name: data.name,
        shortName: data.shortName,
        country: data.country,
        crestUrl: data.crestUrl,
        overall: data.overall,
        attack: data.attack,
        midfield: data.midfield,
        defense: data.defense,
        leagueId: data.leagueId,
        syncedAt: new Date(),
      },
      update: {
        name: data.name,
        crestUrl: data.crestUrl,
        overall: data.overall,
        attack: data.attack,
        midfield: data.midfield,
        defense: data.defense,
        leagueId: data.leagueId,
        syncedAt: new Date(),
      },
      include: { league: true, players: true },
    });
  }

  static async upsertLeague(data: {
    eaId: string;
    name: string;
    country?: string;
  }) {
    return prisma.fcLeague.upsert({
      where: { fifaIndexId: data.eaId },
      create: {
        fifaIndexId: data.eaId,
        name: data.name,
        country: data.country,
      },
      update: { name: data.name, country: data.country },
    });
  }
}
