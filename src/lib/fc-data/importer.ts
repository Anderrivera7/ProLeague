import { importNationalTeamFromCsv } from "./csv-importer";
import { importClubFromCsv } from "./csv-club-importer";
import {
  computeTeamStats,
  fetchNationalTeamSquad,
} from "./ea-drop-client";
import { isClubEaId } from "./club-ids";
import { getNationalSquadTemplate } from "./squad-rosters";
import {
  eaIdFromNationality,
  getCatalogNation,
  normalizeEaTeamId,
  searchCatalog,
} from "./national-teams";
import type {
  ScrapedTeamData,
  TeamWithPlayersResult,
} from "./types";

export async function importNationalTeam(
  nationalityId: number
): Promise<TeamWithPlayersResult> {
  const catalog = getCatalogNation(nationalityId);
  if (!catalog) {
    throw new Error(`Selección no encontrada en catálogo FC26 (ID ${nationalityId})`);
  }

  try {
    return importNationalTeamFromCsv(nationalityId);
  } catch {
    // Fallback a API EA si el CSV no está disponible
  }

  const squadTemplate = getNationalSquadTemplate(nationalityId);
  const { players, crestUrl } = await fetchNationalTeamSquad(nationalityId);

  const stats = squadTemplate
    ? {
        overall: squadTemplate.overall ?? computeTeamStats(players).overall,
        attack: squadTemplate.attack ?? computeTeamStats(players).attack,
        midfield: squadTemplate.midfield ?? computeTeamStats(players).midfield,
        defense: squadTemplate.defense ?? computeTeamStats(players).defense,
      }
    : computeTeamStats(players);

  const team: ScrapedTeamData = {
    eaId: eaIdFromNationality(nationalityId),
    name: catalog.nameEs,
    shortName: catalog.nameEn,
    country: catalog.nameEs,
    crestUrl: crestUrl ?? catalog.crestUrl,
    ...stats,
    league: {
      eaId: "intl",
      name: "Selecciones Internacionales",
      country: "Internacional",
    },
  };

  return { team, players };
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
