import { importNationalTeamFromCsv } from "./csv-importer";
import { importClubFromCsv } from "./csv-club-importer";
import { isClubEaId } from "./club-ids";
import {
  eaIdFromNationality,
  getCatalogNation,
  normalizeEaTeamId,
  searchCatalog,
} from "./national-teams";
import type { ScrapedTeamData, TeamWithPlayersResult } from "./types";

export async function importNationalTeam(
  nationalityId: number
): Promise<TeamWithPlayersResult> {
  const catalog = getCatalogNation(nationalityId);
  if (!catalog) {
    throw new Error(`Selección no encontrada en catálogo FC26 (ID ${nationalityId})`);
  }

  return importNationalTeamFromCsv(nationalityId);
}

export async function importTeamByEaId(eaId: string): Promise<TeamWithPlayersResult> {
  if (isClubEaId(eaId)) {
    return importClubFromCsv(eaId);
  }

  const normalizedEaId = normalizeEaTeamId(eaId);
  const nationalityId = parseInt(normalizedEaId, 10);
  if (Number.isNaN(nationalityId)) {
    throw new Error(`ID de equipo inválido: ${eaId}`);
  }
  return importNationalTeam(nationalityId);
}

export function searchRemoteNationalTeams(query: string, limit = 15): ScrapedTeamData[] {
  return searchCatalog(query, limit).map((n) => ({
    eaId: eaIdFromNationality(n.nationalityId),
    name: n.nameEs,
    country: n.nameEs,
    crestUrl: n.crestUrl,
    league: {
      eaId: "intl",
      name: "Selecciones Internacionales",
      country: "Internacional",
    },
  }));
}

/** @deprecated Alias para compatibilidad */
export const scrapeTeamPage = importTeamByEaId;
export const searchTeamsOnFifaIndex = searchRemoteNationalTeams;
