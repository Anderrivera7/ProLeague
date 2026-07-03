import { TeamRepository } from "@/repositories/team-repository";

/** @deprecated Usar TeamRepository / TeamService */
export class FifaDbRepository {
  static async getLeagues() {
    const { prisma } = await import("@/lib/prisma");
    return prisma.fcLeague.findMany({
      include: { _count: { select: { teams: true } } },
      orderBy: { name: "asc" },
    });
  }

  static async getTeams(search?: string, leagueId?: string, limit = 50) {
    return TeamRepository.search(search ?? "", leagueId, limit);
  }

  static getTeamById = TeamRepository.findById;
  static getPlayersByTeam = async (teamId: string) => {
    const { PlayerRepository } = await import("@/repositories/player-repository");
    return PlayerRepository.findByTeamId(teamId);
  };

  static searchPlayers = async () => [] as never[];
}
