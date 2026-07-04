import { getEaPlayerPortraitUrl } from "./player-image";
import { loadFc26CsvRows } from "./csv-store";
import {
  extractClubsFromRows,
  extractLeaguesFromClubRows,
  getClubSquadFromRows,
  parseFc26ClubCsv,
  type Fc26CsvClubPlayer,
} from "./csv-club-parser";
import { computeTeamStats } from "./ea-drop-client";
import {
  eaIdFromClub,
  getSofifaLeagueLogoUrl,
  getSofifaTeamCrestUrl,
  parseClubEaId,
} from "./club-ids";
import type { ScrapedPlayerData, TeamWithPlayersResult } from "./types";
import { readFileSync } from "fs";
import { resolveFc26CsvPath } from "./csv-store";

function csvClubPlayerToScraped(p: Fc26CsvClubPlayer): ScrapedPlayerData {
  const primaryPos =
    p.clubPosition && !["SUB", "RES"].includes(p.clubPosition)
      ? p.clubPosition
      : p.positions.split(",")[0]?.trim();

  return {
    eaId: p.playerId,
    name: p.shortName || p.name,
    position: primaryPos,
    squadRole: p.clubPosition ?? undefined,
    jerseyNumber: p.clubJerseyNumber ?? undefined,
    overall: p.overall,
    potential: p.potential,
    nationality: p.nationalityName,
    imageUrl: p.imageUrl ?? getEaPlayerPortraitUrl(p.playerId),
    pace: p.pace,
    shooting: p.shooting,
    passing: p.passing,
    dribbling: p.dribbling,
    defending: p.defending,
    physic: p.physic,
  };
}

function loadClubRows() {
  try {
    const path = resolveFc26CsvPath();
    const content = readFileSync(path, "utf8");
    return parseFc26ClubCsv(content);
  } catch {
    const rows = loadFc26CsvRows();
    return rows.flatMap(() => []);
  }
}

let clubRowsCache: Fc26CsvClubPlayer[] | null = null;

export function getClubCsvRows() {
  if (!clubRowsCache) {
    clubRowsCache = loadClubRows();
  }
  return clubRowsCache;
}

export function importClubFromCsv(eaId: string): TeamWithPlayersResult {
  const clubTeamId = parseClubEaId(eaId);
  if (clubTeamId == null) {
    throw new Error(`ID de club inválido: ${eaId}`);
  }

  const rows = getClubCsvRows();
  const squad = getClubSquadFromRows(rows, clubTeamId);

  if (squad.length === 0) {
    throw new Error(`Sin plantilla en CSV para el club ${clubTeamId}`);
  }

  const meta = squad[0];
  const players = squad.map(csvClubPlayerToScraped);
  const stats = computeTeamStats(players);

  return {
    team: {
      eaId: eaIdFromClub(clubTeamId),
      name: meta.clubName,
      shortName: meta.clubName,
      country: meta.leagueName,
      crestUrl: getSofifaTeamCrestUrl(clubTeamId),
      ...stats,
      league: {
        eaId: String(meta.leagueId),
        name: meta.leagueName,
        country: meta.leagueName,
      },
    },
    players,
  };
}

export function getLeaguesFromCsv(maxLevel = 1) {
  const rows = getClubCsvRows();
  return extractLeaguesFromClubRows(rows, { maxLevel }).map((l) => ({
    ...l,
    logoUrl: getSofifaLeagueLogoUrl(l.leagueId),
  }));
}

export function getClubsForLeagueFromCsv(leagueId: number) {
  const rows = getClubCsvRows();
  return extractClubsFromRows(rows, leagueId);
}
