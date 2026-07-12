import type { Fc26CsvPlayer } from "./csv-parser";
import type { ScrapedPlayerData } from "./types";
import { isStarterRole } from "./formation";
import { normalizePlayerSearch } from "./ea-drop-scraper";
import {
  getNationalSquadTemplate,
  type NationalSquadTemplate,
} from "./squad-rosters";

const BENCH_ROLES = new Set(["SUB", "RES"]);

function matchesPlayerName(name: string, search: string) {
  const key = normalizePlayerSearch(search);
  return normalizePlayerSearch(name).includes(key);
}

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

function isTemplateGoalkeeper(
  template: NationalSquadTemplate,
  player: Fc26CsvPlayer
) {
  return template.players.some(
    (s) => s.position === "GK" && matchesSearch(player, s.search)
  );
}

/** Un solo portero titular; el resto a banquillo. */
function normalizeGoalkeepers(
  squad: Fc26CsvPlayer[],
  template: NationalSquadTemplate
) {
  const gkSlots = squad
    .map((p, index) => ({ p, index }))
    .filter(
      ({ p }) =>
        p.nationPosition === "GK" || isTemplateGoalkeeper(template, p)
    )
    .sort((a, b) => b.p.overall - a.p.overall);

  for (const [rank, { index }] of gkSlots.entries()) {
    squad[index] = {
      ...squad[index],
      nationPosition: rank === 0 ? "GK" : "SUB",
    };
  }
}

/** Asegura 11 titulares usando la lista curada EA/FC26. */
function ensureElevenStarters(
  squad: Fc26CsvPlayer[],
  template: NationalSquadTemplate
) {
  let starters = squad.filter((p) => isStarterRole(p.nationPosition)).length;
  if (starters >= 11) return;

  for (const slot of template.players) {
    if (starters >= 11) break;
    if (slot.position === "GK") continue;

    const index = squad.findIndex((p) => matchesSearch(p, slot.search));
    if (index < 0 || isStarterRole(squad[index].nationPosition)) continue;

    squad[index] = { ...squad[index], nationPosition: slot.position };
    starters++;
  }
}

/** Si hay más de 11 titulares, baja OVR a banquillo. */
function trimToElevenStarters(squad: Fc26CsvPlayer[]) {
  const starterSlots = squad
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => isStarterRole(p.nationPosition))
    .sort((a, b) => (a.p.overall ?? 0) - (b.p.overall ?? 0));

  if (starterSlots.length <= 11) return;

  for (const { index } of starterSlots.slice(0, starterSlots.length - 11)) {
    squad[index] = { ...squad[index], nationPosition: "SUB" };
  }
}

/** Banquillo: hasta 9 suplentes + reservas. */
function assignBenchRoles(squad: Fc26CsvPlayer[]) {
  const bench = squad
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => !isStarterRole(p.nationPosition))
    .sort((a, b) => b.p.overall - a.p.overall);

  for (const [rank, { index }] of bench.entries()) {
    squad[index] = {
      ...squad[index],
      nationPosition: rank < 9 ? "SUB" : "RES",
    };
  }
}

/** Sin recorte algorítmico: se respetan los roles del CSV/API tal cual. */
function capScrapedStartersToEleven(
  players: ScrapedPlayerData[]
): ScrapedPlayerData[] {
  return players.map((p) => ({ ...p }));
}

/** Sin recorte algorítmico: se respetan los roles del CSV tal cual. */
function capStartersToEleven(squad: Fc26CsvPlayer[]): Fc26CsvPlayer[] {
  return squad.map((p) => ({ ...p }));
}

function normalizeGoalkeepersGeneric(squad: Fc26CsvPlayer[]) {
  const gkSlots = squad
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => p.nationPosition === "GK")
    .sort((a, b) => b.p.overall - a.p.overall);

  for (const [rank, { index }] of gkSlots.entries()) {
    squad[index] = {
      ...squad[index],
      nationPosition: rank === 0 ? "GK" : "SUB",
    };
  }
}

function assignBenchRolesGeneric(squad: Fc26CsvPlayer[]) {
  const bench = squad
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => !isStarterRole(p.nationPosition))
    .sort((a, b) => b.p.overall - a.p.overall);

  for (const [rank, { index }] of bench.entries()) {
    squad[index] = {
      ...squad[index],
      nationPosition: rank < 9 ? "SUB" : "RES",
    };
  }
}

/**
 * Aplica roles de la plantilla curada: posiciones en campo, 11 titulares y banquillo.
 */
export function finalizeNationalSquadRoles(
  nationalityId: number,
  squad: Fc26CsvPlayer[]
): Fc26CsvPlayer[] {
  const template = getNationalSquadTemplate(nationalityId);
  if (!template) return capStartersToEleven(squad);

  const result = squad.map((p) => ({ ...p }));

  for (const slot of template.players) {
    const index = result.findIndex((p) => matchesSearch(p, slot.search));
    if (index < 0) continue;

    const current = result[index].nationPosition;
    if (slot.position === "GK") continue;

    if (!current || BENCH_ROLES.has(current)) {
      result[index] = { ...result[index], nationPosition: slot.position };
    }
  }

  normalizeGoalkeepers(result, template);
  ensureElevenStarters(result, template);
  trimToElevenStarters(result);
  assignBenchRoles(result);

  return result;
}

/** Misma lógica de roles para datos importados vía API EA. */
export function finalizeScrapedNationalSquad(
  nationalityId: number,
  players: ScrapedPlayerData[]
): ScrapedPlayerData[] {
  const template = getNationalSquadTemplate(nationalityId);
  if (!template) return capScrapedStartersToEleven(players);

  const result = players.map((p) => ({ ...p }));

  for (const slot of template.players) {
    const index = result.findIndex((p) => matchesPlayerName(p.name, slot.search));
    if (index < 0) continue;
    if (slot.position === "GK") continue;
    const current = result[index].squadRole;
    if (!current || BENCH_ROLES.has(current)) {
      result[index] = { ...result[index], squadRole: slot.position };
    }
  }

  const gkSlots = result
    .map((p, index) => ({ p, index }))
    .filter(({ p }) =>
      template.players.some(
        (s) => s.position === "GK" && matchesPlayerName(p.name, s.search)
      )
    )
    .sort((a, b) => (b.p.overall ?? 0) - (a.p.overall ?? 0));

  for (const [rank, { index }] of gkSlots.entries()) {
    result[index] = {
      ...result[index],
      squadRole: rank === 0 ? "GK" : "SUB",
    };
  }

  let starters = result.filter((p) => isStarterRole(p.squadRole)).length;
  for (const slot of template.players) {
    if (starters >= 11 || slot.position === "GK") continue;
    const index = result.findIndex((p) => matchesPlayerName(p.name, slot.search));
    if (index < 0 || isStarterRole(result[index].squadRole)) continue;
    result[index] = { ...result[index], squadRole: slot.position };
    starters++;
  }

  const starterSlots = result
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => isStarterRole(p.squadRole))
    .sort((a, b) => (a.p.overall ?? 0) - (b.p.overall ?? 0));

  if (starterSlots.length > 11) {
    for (const { index } of starterSlots.slice(0, starterSlots.length - 11)) {
      result[index] = { ...result[index], squadRole: "SUB" };
    }
  }

  const bench = result
    .map((p, index) => ({ p, index }))
    .filter(({ p }) => !isStarterRole(p.squadRole))
    .sort((a, b) => (b.p.overall ?? 0) - (a.p.overall ?? 0));

  for (const [rank, { index }] of bench.entries()) {
    result[index] = {
      ...result[index],
      squadRole: rank < 9 ? "SUB" : "RES",
    };
  }

  return result;
}

/**
 * Completa la plantilla del CSV con jugadores del juego (misma nacionalidad)
 * que faltan en nation_team_id pero sí están en la lista curada EA/FC26.
 */
export function enrichCsvSquadWithCurated(
  nationalityId: number,
  squad: Fc26CsvPlayer[],
  allRows: Fc26CsvPlayer[]
): Fc26CsvPlayer[] {
  const template = getNationalSquadTemplate(nationalityId);

  if (!template) {
    return capStartersToEleven(squad);
  }

  const result = [...squad];

  for (const slot of template.players) {
    if (isInSquad(result, slot.search)) continue;

    const fromPool = findInNationalityPool(allRows, nationalityId, slot.search);
    if (!fromPool) continue;

    result.push({
      ...fromPool,
      nationPosition: slot.position === "GK" ? "SUB" : slot.position,
      nationTeamId:
        fromPool.nationTeamId ?? template.careerTeamId?.toString() ?? null,
    });
  }

  const trimmed = trimSquadTo26(
    result,
    template.players.map((p) => p.search)
  );
  return finalizeNationalSquadRoles(nationalityId, trimmed);
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
