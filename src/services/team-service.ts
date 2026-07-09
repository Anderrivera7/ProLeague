import { TeamRepository } from "@/repositories/team-repository";
import { PlayerService, needsSquadRefresh } from "@/services/player-service";
import {
  importTeamByEaId,
  searchRemoteNationalTeams,
} from "@/lib/fc-data/importer";
import { getExpectedSquadCounts } from "@/lib/fc-data/squad-counts-server";

export type SyncSource = "cache" | "csv";

export interface SyncTeamResult {
  team: NonNullable<Awaited<ReturnType<typeof TeamRepository.findByEaId>>>;
  source: SyncSource;
  playersSynced: number;
}

export class TeamService {
  /**
   * Lazy loading:
   * 1. Busca en Supabase por ea_id (nationalityId EA)
   * 2. Si existe con jugadores → cache
   * 3. Si no → API oficial EA → guarda → devuelve
   */
  static async getOrSyncByEaId(eaId: string): Promise<SyncTeamResult> {
    const cached = await TeamRepository.findByEaId(eaId);

    if (cached && cached.players.length > 0) {
      if (!needsSquadRefresh(eaId, cached.players)) {
        return { team: cached, source: "cache", playersSynced: cached.players.length };
      }
      const players = await PlayerService.syncByTeamEaId(cached.id, eaId);
      const team = await TeamRepository.findByEaId(eaId);
      if (!team) throw new Error("Error al recargar equipo");
      return { team, source: "csv", playersSynced: players.length };
    }

    if (cached && cached.players.length === 0) {
      const players = await PlayerService.syncByTeamEaId(cached.id, eaId);
      const team = await TeamRepository.findByEaId(eaId);
      if (!team) throw new Error("Error al recargar equipo");
      return { team, source: "csv", playersSynced: players.length };
    }

    return this.importFromEaApi(eaId);
  }

  static async getOrSyncById(teamId: string): Promise<SyncTeamResult> {
    const cached = await TeamRepository.findById(teamId);
    if (!cached) throw new Error("Equipo no encontrado");

    const needsRefresh =
      cached.players.length === 0 ||
      needsSquadRefresh(cached.fifaIndexId, cached.players);

    if (cached.players.length > 0 && !needsRefresh) {
      return {
        team: cached,
        source: "cache",
        playersSynced: cached.players.length,
      };
    }

    const players = await PlayerService.syncByTeamEaId(
      cached.id,
      cached.fifaIndexId
    );
    const team = await TeamRepository.findById(teamId);
    if (!team) throw new Error("Error al recargar equipo");

    return {
      team,
      source: needsRefresh ? "csv" : "cache",
      playersSynced: players.length,
    };
  }

  static async importFromEaApi(eaId: string): Promise<SyncTeamResult> {
    const scraped = await importTeamByEaId(eaId);

    const league = await TeamRepository.upsertLeague({
      eaId: scraped.team.league?.eaId ?? "intl",
      name: scraped.team.league?.name ?? "Selecciones Internacionales",
      country: scraped.team.league?.country ?? "Mundial",
    });

    const team = await TeamRepository.upsertFromSync({
      eaId: scraped.team.eaId,
      name: scraped.team.name,
      shortName: scraped.team.shortName,
      country: scraped.team.country,
      crestUrl: scraped.team.crestUrl,
      overall: scraped.team.overall,
      attack: scraped.team.attack,
      midfield: scraped.team.midfield,
      defense: scraped.team.defense,
      leagueId: league.id,
    });

    const players = await PlayerService.syncFromScraped(
      team.id,
      scraped.players
    );

    const full = await TeamRepository.findByEaId(eaId);
    if (!full) throw new Error("Error al persistir equipo");

    return {
      team: full,
      source: "csv",
      playersSynced: players.length,
    };
  }

  static async search(
    query: string,
    options?: { leagueId?: string; fetchRemote?: boolean; limit?: number }
  ) {
    const limit = options?.limit ?? 30;
    const local = await TeamRepository.search(query, options?.leagueId, limit);

    const localResults = local.map((t) => {
      const squad = getExpectedSquadCounts(t.fifaIndexId);
      return {
        id: t.id,
        eaId: t.fifaIndexId,
        name: t.name,
        crestUrl: t.crestUrl,
        overall: t.overall,
        attack: t.attack,
        midfield: t.midfield,
        defense: t.defense,
        league: t.league,
        playerCount: squad?.total ?? t._count.players,
        squadCounts: squad,
        source: "cache" as const,
      };
    });

    if (local.length >= 5 || !options?.fetchRemote || query.length < 2) {
      return { teams: localResults, remote: [] };
    }

    const localEaIds = new Set(local.map((t) => t.fifaIndexId));
    const remote = searchRemoteNationalTeams(query, 15)
      .filter((r) => !localEaIds.has(r.eaId))
      .map((r) => ({
        eaId: r.eaId,
        name: r.name,
        crestUrl: r.crestUrl,
        overall: r.overall,
        source: "csv" as const,
      }));

    return { teams: localResults, remote };
  }
}
