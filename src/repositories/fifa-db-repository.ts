import { TeamRepository } from "@/repositories/team-repository";
import {
  resolveLeagueLogoUrl,
  sortLeaguesByPriority,
} from "@/lib/fc-data/club-ids";
import {
  UCL_2026_27_TEAMS,
  isUclLeagueFifaId,
} from "@/lib/fc-data/ucl-teams";

/** @deprecated Usar TeamRepository / TeamService */
export class FifaDbRepository {
  static async getLeagues() {
    const { prisma } = await import("@/lib/prisma");
    const leagues = await prisma.fcLeague.findMany({
      where: { teams: { some: {} } },
      include: { _count: { select: { teams: true } } },
    });
    return sortLeaguesByPriority(leagues).map((league) => ({
      ...league,
      logoUrl: resolveLeagueLogoUrl(
        league.logoUrl,
        league.fifaIndexId,
        league.name
      ),
      _count: {
        teams: isUclLeagueFifaId(league.fifaIndexId)
          ? UCL_2026_27_TEAMS.length
          : league._count.teams,
      },
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
