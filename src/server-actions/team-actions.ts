"use server";

import { TeamService } from "@/services/team-service";
import { PlayerService } from "@/services/player-service";

export async function syncTeamAction(eaId: string) {
  try {
    const result = await TeamService.getOrSyncByEaId(eaId);
    return {
      success: true as const,
      team: serializeTeam(result.team),
      source: result.source,
      playersSynced: result.playersSynced,
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Error al sincronizar equipo",
    };
  }
}

export async function syncTeamByIdAction(teamId: string) {
  try {
    const result = await TeamService.getOrSyncById(teamId);
    return {
      success: true as const,
      team: serializeTeam(result.team),
      source: result.source,
      playersSynced: result.playersSynced,
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Error al sincronizar equipo",
    };
  }
}

export async function syncPlayersAction(eaId: string) {
  try {
    const { TeamRepository } = await import("@/repositories/team-repository");
    const team = await TeamRepository.findByEaId(eaId);
    if (!team) {
      return { success: false as const, error: "Equipo no encontrado en cache" };
    }

    const players = await PlayerService.syncByTeamEaId(team.id, eaId);
    const updated = await TeamRepository.findByEaId(eaId);

    return {
      success: true as const,
      players: players.map(serializePlayer),
      team: updated ? serializeTeam(updated) : null,
      count: players.length,
    };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Error al sincronizar jugadores",
    };
  }
}

export async function searchTeamsAction(
  query: string,
  leagueId?: string,
  fetchRemote = true
) {
  try {
    const result = await TeamService.search(query, {
      leagueId,
      fetchRemote,
      limit: 40,
    });
    return { success: true as const, ...result };
  } catch (e) {
    return {
      success: false as const,
      error: e instanceof Error ? e.message : "Error en búsqueda",
      teams: [],
      remote: [],
    };
  }
}

function serializeTeam(team: {
  id: string;
  fifaIndexId: string;
  name: string;
  shortName: string | null;
  country: string | null;
  crestUrl: string | null;
  overall: number | null;
  attack: number | null;
  midfield: number | null;
  defense: number | null;
  syncedAt: Date | null;
  league: { id: string; name: string } | null;
  players: Array<{
    id: string;
    fifaIndexId: string;
    name: string;
    position: string | null;
    overall: number | null;
    potential: number | null;
    imageUrl: string | null;
  }>;
}) {
  return {
    id: team.id,
    eaId: team.fifaIndexId,
    name: team.name,
    shortName: team.shortName,
    country: team.country,
    crestUrl: team.crestUrl,
    overall: team.overall,
    attack: team.attack,
    midfield: team.midfield,
    defense: team.defense,
    syncedAt: team.syncedAt?.toISOString() ?? null,
    league: team.league,
    players: team.players.map(serializePlayer),
  };
}

function serializePlayer(p: {
  id: string;
  fifaIndexId: string;
  name: string;
  position: string | null;
  overall: number | null;
  potential: number | null;
  imageUrl: string | null;
}) {
  return {
    id: p.id,
    eaId: p.fifaIndexId,
    name: p.name,
    position: p.position,
    overall: p.overall,
    potential: p.potential,
    imageUrl: p.imageUrl,
  };
}
