import {
  FEATURED_LEAGUES,
  resolveSportsDbLeagueId,
  SPORTSDB_LEAGUE_NAMES,
} from "@/lib/sports-apis/league-mapping";
import {
  getCachedLeagueStandings,
  getCachedNextEvents,
  getCachedPastEvents,
  type SportsDbEvent,
  type SportsDbStanding,
} from "@/lib/sports-apis/thesportsdb-client";
import { getFootballHighlights } from "@/lib/sports-apis/scorebat-client";

export type LeagueSnapshot = {
  fifaIndexId: string;
  sportsDbLeagueId: string;
  leagueName: string;
  standings: SportsDbStanding[];
  upcoming: SportsDbEvent[];
  recent: SportsDbEvent[];
};

export class RealFootballService {
  static async getLeagueSnapshot(
    fifaIndexId: string,
    options?: { standingsLimit?: number; eventsLimit?: number }
  ): Promise<LeagueSnapshot | null> {
    const sportsDbLeagueId = resolveSportsDbLeagueId(fifaIndexId);
    if (!sportsDbLeagueId) return null;

    const standingsLimit = options?.standingsLimit ?? 8;
    const eventsLimit = options?.eventsLimit ?? 4;

    const [standings, upcoming, recent] = await Promise.all([
      getCachedLeagueStandings(sportsDbLeagueId, standingsLimit),
      getCachedNextEvents(sportsDbLeagueId, eventsLimit),
      getCachedPastEvents(sportsDbLeagueId, eventsLimit),
    ]);

    const leagueName =
      SPORTSDB_LEAGUE_NAMES[sportsDbLeagueId] ??
      standings[0]?.team ??
      "Liga";

    return {
      fifaIndexId,
      sportsDbLeagueId,
      leagueName,
      standings,
      upcoming,
      recent,
    };
  }

  static async getFeaturedSnapshots(): Promise<LeagueSnapshot[]> {
    const results = await Promise.all(
      FEATURED_LEAGUES.map((l) =>
        this.getLeagueSnapshot(l.fifaId, {
          standingsLimit: 5,
          eventsLimit: 3,
        })
      )
    );
    return results.filter((r): r is LeagueSnapshot => r != null);
  }

  static async getHighlights() {
    return getFootballHighlights(6);
  }

  /** Liga preferida: torneo activo del usuario o equipo favorito. */
  static async resolvePreferredLeagueId(userId: string): Promise<string | null> {
    const { prisma } = await import("@/lib/prisma");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        favoriteTeam: { select: { league: { select: { fifaIndexId: true } } } },
      },
    });

    const favLeague = user?.favoriteTeam?.league?.fifaIndexId;
    if (favLeague && resolveSportsDbLeagueId(favLeague)) return favLeague;

    const activeTournament = await prisma.tournament.findFirst({
      where: {
        OR: [
          { creatorId: userId },
          { participants: { some: { userId } } },
        ],
        status: { in: ["ACTIVE", "REGISTRATION"] },
        fcLeagueId: { not: null },
      },
      include: { fcLeague: { select: { fifaIndexId: true } } },
      orderBy: { updatedAt: "desc" },
    });

    const tourLeague = activeTournament?.fcLeague?.fifaIndexId;
    if (tourLeague && resolveSportsDbLeagueId(tourLeague)) return tourLeague;

    return "13";
  }
}
