import { PlayerRepository } from "@/repositories/player-repository";
import { importTeamByEaId } from "@/lib/fc-data/importer";
import { getCsvSquadForNationality } from "@/lib/fc-data/csv-importer";
import { getClubCsvRows } from "@/lib/fc-data/csv-club-importer";
import { getClubSquadFromRows } from "@/lib/fc-data/csv-club-parser";
import { isClubEaId, parseClubEaId } from "@/lib/fc-data/club-ids";

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

function needsClubCsvRefresh(
  eaId: string,
  players: Array<{ fifaIndexId: string; pace: number | null; squadRole: string | null }>
) {
  if (players.length === 0) return true;

  const missingStats = players.some((p) => p.pace == null);
  const missingRoles = players.some((p) => !p.squadRole);
  if (missingStats || missingRoles) return true;

  const clubTeamId = parseClubEaId(eaId);
  if (clubTeamId == null) return true;

  const expected = getClubSquadFromRows(getClubCsvRows(), clubTeamId);
  const currentIds = new Set(players.map((p) => p.fifaIndexId));
  const missingFromSquad = expected.some((p) => !currentIds.has(p.playerId));

  return missingFromSquad;
}

export function needsSquadRefresh(
  eaId: string,
  players: Array<{ fifaIndexId: string; pace: number | null; squadRole: string | null }>
) {
  if (isClubEaId(eaId)) return needsClubCsvRefresh(eaId, players);
  const nationalityId = parseInt(eaId, 10);
  if (Number.isNaN(nationalityId)) return players.length === 0;
  return needsCsvRefresh(nationalityId, players);
}

export class PlayerService {
  static async syncByTeamEaId(teamId: string, eaId: string) {
    if (isClubEaId(eaId)) {
      const existing = await PlayerRepository.findByTeamId(teamId);
      if (existing.length > 0 && !needsClubCsvRefresh(eaId, existing)) {
        return existing;
      }

      const { players } = await importTeamByEaId(eaId);
      if (existing.length > 0) {
        return PlayerRepository.replaceSquad(teamId, players);
      }
      return PlayerRepository.upsertMany(teamId, players);
    }

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
