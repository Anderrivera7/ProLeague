import { PlayerRepository } from "@/repositories/player-repository";
import { importTeamByEaId } from "@/lib/fc-data/importer";
import { getCsvSquadForNationality } from "@/lib/fc-data/csv-importer";
import type { ScrapedPlayerData } from "@/lib/fc-data/types";

export function needsCsvRefresh(
  nationalityId: number,
  players: Array<{ fifaIndexId: string; pace: number | null; squadRole: string | null }>
) {
  if (players.length === 0) return true;

  const missingStats = players.some((p) => p.pace == null);
  const missingRoles = players.some((p) => !p.squadRole);
  if (missingStats || missingRoles) return true;

  const expected = getCsvSquadForNationality(nationalityId);
  const currentIds = new Set(players.map((p) => p.fifaIndexId));
  const missingFromSquad = expected.some((p) => !currentIds.has(p.playerId));

  return missingFromSquad;
}

export class PlayerService {
  static async syncByTeamEaId(teamId: string, eaId: string) {
    const nationalityId = parseInt(eaId, 10);
    const existing = await PlayerRepository.findByTeamId(teamId);

    if (
      existing.length > 0 &&
      !needsCsvRefresh(nationalityId, existing)
    ) {
      return existing;
    }

    const { players } = await importTeamByEaId(eaId);
    if (existing.length > 0) {
      return PlayerRepository.replaceSquad(teamId, players);
    }
    return PlayerRepository.upsertMany(teamId, players);
  }

  static async syncFromScraped(teamId: string, players: ScrapedPlayerData[]) {
    if (players.length === 0) return [];
    return PlayerRepository.replaceSquad(teamId, players);
  }

  static async getByTeamId(teamId: string) {
    return PlayerRepository.findByTeamId(teamId);
  }
}
