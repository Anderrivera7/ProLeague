import { prisma } from "@/lib/prisma";

export class FifaDbRepository {
  static async getTeams(search?: string, limit = 50) {
    return prisma.fcTeam.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : undefined,
      include: { league: true },
      orderBy: { overall: "desc" },
      take: limit,
    });
  }

  static async getTeamById(id: string) {
    return prisma.fcTeam.findUnique({
      where: { id },
      include: {
        league: true,
        players: { orderBy: { overall: "desc" } },
      },
    });
  }

  static async getPlayersByTeam(teamId: string) {
    return prisma.fcPlayer.findMany({
      where: { teamId },
      orderBy: { overall: "desc" },
    });
  }

  static async searchPlayers(query: string, limit = 30) {
    return prisma.fcPlayer.findMany({
      where: {
        name: { contains: query, mode: "insensitive" },
      },
      include: { team: true },
      orderBy: { overall: "desc" },
      take: limit,
    });
  }
}
