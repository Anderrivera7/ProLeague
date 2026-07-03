import type { Fc26CsvPlayer } from "./csv-parser";
import { normalizePlayerSearch } from "./ea-drop-scraper";
import { getNationalSquadTemplate } from "./squad-rosters";

const BENCH_ROLES = new Set(["SUB", "RES"]);

function matchesSearch(player: Fc26CsvPlayer, search: string) {
  const key = normalizePlayerSearch(search);
  return (
    normalizePlayerSearch(player.name).includes(key) ||
    normalizePlayerSearch(player.shortName).includes(key)
  );
}

function isInSquad(squad: Fc26CsvPlayer[], search: string) {
  return squad.some((p) => matchesSearch(p, search));
}

function findInNationalityPool(
  pool: Fc26CsvPlayer[],
  nationalityId: number,
  search: string
) {
  return pool
    .filter((p) => p.nationalityId === nationalityId)
    .filter((p) => matchesSearch(p, search))
    .sort((a, b) => b.overall - a.overall)[0];
}

/**
 * Completa la plantilla del CSV con jugadores del juego (misma nacionalidad)
 * que faltan en nation_team_id pero sí están en la lista curada EA/FC26.
 * Ej: Kanté en Francia (está en EA FC26 pero no en nation_team_id del CSV).
 */
export function enrichCsvSquadWithCurated(
  nationalityId: number,
  squad: Fc26CsvPlayer[],
  allRows: Fc26CsvPlayer[]
): Fc26CsvPlayer[] {
  const template = getNationalSquadTemplate(nationalityId);
  if (!template) return squad;

  const result = [...squad];

  for (const slot of template.players) {
    if (isInSquad(result, slot.search)) continue;

    const fromPool = findInNationalityPool(allRows, nationalityId, slot.search);
    if (!fromPool) continue;

    result.push({
      ...fromPool,
      nationPosition: "SUB",
      nationTeamId:
        fromPool.nationTeamId ?? template.careerTeamId?.toString() ?? null,
    });
  }

  return trimSquadTo26(result, template.players.map((p) => p.search));
}

function trimSquadTo26(squad: Fc26CsvPlayer[], protectedSearches: string[]) {
  if (squad.length <= 26) return squad;

  const protectedIds = new Set(
    squad
      .filter((p) => protectedSearches.some((s) => matchesSearch(p, s)))
      .map((p) => p.playerId)
  );

  const removable = squad
    .filter(
      (p) =>
        !protectedIds.has(p.playerId) &&
        (BENCH_ROLES.has(p.nationPosition ?? "") || !p.nationJerseyNumber)
    )
    .sort((a, b) => a.overall - b.overall);

  const trimmed = [...squad];
  for (const player of removable) {
    if (trimmed.length <= 26) break;
    const idx = trimmed.findIndex((p) => p.playerId === player.playerId);
    if (idx >= 0) trimmed.splice(idx, 1);
  }

  return trimmed.slice(0, 26);
}
