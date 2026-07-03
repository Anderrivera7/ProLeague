import { getEaPlayerPortraitUrl } from "./player-image";
import { loadFc26CsvRows } from "./csv-store";
import { getNationalSquadFromCsv } from "./csv-parser";
import { enrichCsvSquadWithCurated } from "./squad-enricher";
import {
  eaIdFromNationality,
  getCatalogNation,
} from "./national-teams";
import type { Fc26CsvPlayer } from "./csv-parser";
import type { ScrapedPlayerData, TeamWithPlayersResult } from "./types";

export { isStarterRole } from "./formation";

function csvPlayerToScraped(p: Fc26CsvPlayer): ScrapedPlayerData {
  const primaryPos =
    p.nationPosition && !["SUB", "RES"].includes(p.nationPosition)
      ? p.nationPosition
      : p.positions.split(",")[0]?.trim();

  return {
    eaId: p.playerId,
    name: p.shortName || p.name,
    position: primaryPos,
    squadRole: p.nationPosition ?? undefined,
    jerseyNumber: p.nationJerseyNumber ?? undefined,
    overall: p.overall,
    potential: p.potential,
    nationality: p.nationalityName,
    imageUrl: getEaPlayerPortraitUrl(p.playerId),
    pace: p.pace,
    shooting: p.shooting,
    passing: p.passing,
    dribbling: p.dribbling,
    defending: p.defending,
    physic: p.physic,
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

  const squad = enrichCsvSquadWithCurated(nationalityId, baseSquad, rows);
  const players = squad.map(csvPlayerToScraped);
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
  const base = getNationalSquadFromCsv(rows, nationalityId);
  return enrichCsvSquadWithCurated(nationalityId, base, rows);
}
