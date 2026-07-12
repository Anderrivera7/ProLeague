import { PlayerRepository } from "@/repositories/player-repository";
import { importTeamByEaId } from "@/lib/fc-data/importer";
import { getCsvSquadForNationality } from "@/lib/fc-data/csv-importer";
import { getClubCsvRows } from "@/lib/fc-data/csv-club-importer";
import { getClubSquadFromRows } from "@/lib/fc-data/csv-club-parser";
import { isClubEaId, parseClubEaId } from "@/lib/fc-data/club-ids";
import { isStarterRole } from "@/lib/fc-data/formation";
import { isExcludedPlayer, filterActiveSquad } from "@/lib/fc-data/excluded-players";
import type { ScrapedPlayerData } from "@/lib/fc-data/types";

type SquadPlayerRow = {
  fifaIndexId: string;
  pace: number | null;
  squadRole: string | null;
};

function squadRolesDriftFromExpected(
  players: SquadPlayerRow[],
  expected: Array<{ playerId: string; role: string | null }>
) {
  const byId = new Map(players.map((p) => [p.fifaIndexId, p]));

  for (const slot of expected) {
    const current = byId.get(slot.playerId);
    if (!current) continue;
    if ((current.squadRole ?? null) !== (slot.role ?? null)) return true;
  }

  const expectedStarters = expected.filter((p) => isStarterRole(p.role)).length;
  const currentStarters = players.filter((p) => isStarterRole(p.squadRole)).length;
  if (expectedStarters >= 11 && currentStarters !== expectedStarters) return true;

  return false;
}

export function needsCsvRefresh(nationalityId: number, players: SquadPlayerRow[]) {
  if (players.length === 0) return true;

  if (players.some((p) => isExcludedPlayer(p.fifaIndexId))) return true;

  const missingStats = players.some((p) => p.pace == null);
  const missingRoles = players.some((p) => !p.squadRole);
  if (missingStats || missingRoles) return true;

  const expected = getCsvSquadForNationality(nationalityId);
  const currentIds = new Set(players.map((p) => p.fifaIndexId));
  const missingFromSquad = expected.some((p) => !currentIds.has(p.playerId));
  if (missingFromSquad) return true;

  return squadRolesDriftFromExpected(
    players,
    expected.map((p) => ({ playerId: p.playerId, role: p.nationPosition }))
  );
}

function needsClubCsvRefresh(eaId: string, players: SquadPlayerRow[]) {
  if (players.length === 0) return true;

  const missingStats = players.some((p) => p.pace == null);
  const missingRoles = players.some((p) => !p.squadRole);
  if (missingStats || missingRoles) return true;

  const clubTeamId = parseClubEaId(eaId);
  if (clubTeamId == null) return true;

  const expected = getClubSquadFromRows(getClubCsvRows(), clubTeamId);
  const currentIds = new Set(players.map((p) => p.fifaIndexId));
  const missingFromSquad = expected.some((p) => !currentIds.has(p.playerId));
  if (missingFromSquad) return true;

  return squadRolesDriftFromExpected(
    players,
    expected.map((p) => ({ playerId: p.playerId, role: p.clubPosition }))
  );
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
      const active = filterActiveSquad(players);
      if (existing.length > 0) {
        return PlayerRepository.replaceSquad(teamId, active);
      }
      return PlayerRepository.upsertMany(teamId, active);
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
    const active = filterActiveSquad(players);
    if (existing.length > 0) {
      return PlayerRepository.replaceSquad(teamId, active);
    }
    return PlayerRepository.upsertMany(teamId, active);
  }

  static async syncFromScraped(teamId: string, players: ScrapedPlayerData[]) {
    const active = filterActiveSquad(players);
    if (active.length === 0) return [];
    return PlayerRepository.replaceSquad(teamId, active);
  }

  static async getByTeamId(teamId: string) {
    return PlayerRepository.findByTeamId(teamId);
  }
}
