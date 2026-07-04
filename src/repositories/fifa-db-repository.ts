import { TeamRepository } from "@/repositories/team-repository";
import {
  resolveLeagueLogoUrl,
  sortLeaguesByPriority,
} from "@/lib/fc-data/club-ids";

/** @deprecated Usar TeamRepository / TeamService */
export class FifaDbRepository {
  static async getLeagues() {
    const { prisma } = await import("@/lib/prisma");
    const leagues = await prisma.fcLeague.findMany({
      include: { _count: { select: { teams: true } } },
    });
    return sortLeaguesByPriority(leagues).map((league) => ({
      ...league,
      logoUrl: resolveLeagueLogoUrl(
        league.logoUrl,
        league.fifaIndexId,
        league.name
      ),
    }));
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
