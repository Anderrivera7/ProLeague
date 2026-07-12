import { getEaPlayerPortraitUrl } from "./player-image";
import { loadFc26CsvRows } from "./csv-store";
import { getNationalSquadFromCsv } from "./csv-parser";
import { computeTeamStats } from "./ea-drop-client";
import { filterActiveSquad } from "./excluded-players";
import {
  eaIdFromNationality,
  getCatalogNation,
} from "./national-teams";
import type { Fc26CsvPlayer } from "./csv-parser";
import type { ScrapedPlayerData, TeamWithPlayersResult } from "./types";

export { isStarterRole } from "./formation";

function csvPlayerToScraped(p: Fc26CsvPlayer): ScrapedPlayerData {
  const isGk = p.positions.trim().toUpperCase() === "GK";
  const gkRating = p.positionRatings.GK ?? p.overall;

  return {
    eaId: p.playerId,
    name: p.shortName || p.name,
    position: p.positions.trim() || undefined,
    squadRole: p.nationPosition ?? undefined,
    jerseyNumber: p.nationJerseyNumber ?? undefined,
    overall: p.overall,
    potential: p.potential,
    nationality: p.nationalityName,
    imageUrl: getEaPlayerPortraitUrl(p.playerId),
    pace: isGk && p.pace === 0 ? gkRating : p.pace,
    shooting: isGk && p.shooting === 0 ? Math.round(gkRating * 0.35) : p.shooting,
    passing: isGk && p.passing === 0 ? Math.round(gkRating * 0.82) : p.passing,
    dribbling: isGk && p.dribbling === 0 ? Math.round(gkRating * 0.4) : p.dribbling,
    defending: isGk && p.defending === 0 ? Math.round(gkRating * 0.2) : p.defending,
    physic: isGk && p.physic === 0 ? Math.round(gkRating * 0.75) : p.physic,
  };
}

export function importNationalTeamFromCsv(
  nationalityId: number
): TeamWithPlayersResult {
  const catalog = getCatalogNation(nationalityId);
  if (!catalog) {
    throw new Error(`Selección no encontrada en catálogo FC26 (ID ${nationalityId})`);
  }

  const rows = loadFc26CsvRows();
  const baseSquad = getNationalSquadFromCsv(rows, nationalityId);

  if (baseSquad.length === 0) {
    throw new Error(`Sin plantilla en CSV para ${catalog.nameEs} (ID ${nationalityId})`);
  }

  const players = filterActiveSquad(baseSquad.map(csvPlayerToScraped));
  const stats = computeTeamStats(players);

  return {
    team: {
      eaId: eaIdFromNationality(nationalityId),
      name: catalog.nameEs,
      shortName: catalog.nameEn,
      country: catalog.nameEs,
      crestUrl: catalog.crestUrl,
      ...stats,
      league: {
        eaId: "intl",
        name: "Selecciones Internacionales",
        country: "Internacional",
      },
    },
    players,
  };
}

export function getCsvSquadForNationality(nationalityId: number) {
  const rows = loadFc26CsvRows();
  return getNationalSquadFromCsv(rows, nationalityId);
}
