/**
 * Mapeo fifaIndexId (SoFIFA/EA) → idLeague de TheSportsDB.
 * Fuente: https://www.thesportsdb.com/api.php
 */
export const FIFA_TO_SPORTSDB_LEAGUE: Record<string, string> = {
  "13": "4328", // Premier League
  "53": "4335", // La Liga
  "31": "4332", // Serie A
  "19": "4331", // Bundesliga
  "16": "4334", // Ligue 1
  "10": "4337", // Eredivisie
  "308": "4344", // Primeira Liga
  "32": "4339", // Süper Lig
  "80": "4350", // Liga MX
  "7": "4351", // Brasileirão
  "353": "4406", // Liga Argentina
  "223": "4480", // UEFA Champions League
  ucl: "4480",
};

export const SPORTSDB_LEAGUE_NAMES: Record<string, string> = {
  "4328": "Premier League",
  "4335": "La Liga",
  "4332": "Serie A",
  "4331": "Bundesliga",
  "4334": "Ligue 1",
  "4337": "Eredivisie",
  "4344": "Primeira Liga",
  "4339": "Süper Lig",
  "4350": "Liga MX",
  "4351": "Brasileirão",
  "4406": "Liga Argentina",
  "4480": "Champions League",
};

export function resolveSportsDbLeagueId(
  fifaIndexId?: string | null
): string | null {
  if (!fifaIndexId) return null;
  return FIFA_TO_SPORTSDB_LEAGUE[fifaIndexId] ?? null;
}

/** Temporada europea actual (agosto–julio). */
export function currentFootballSeason(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 7) return `${year}-${year + 1}`;
  return `${year - 1}-${year}`;
}

export const FEATURED_LEAGUES = [
  { fifaId: "13", label: "Premier League" },
  { fifaId: "53", label: "La Liga" },
  { fifaId: "31", label: "Serie A" },
  { fifaId: "19", label: "Bundesliga" },
  { fifaId: "16", label: "Ligue 1" },
  { fifaId: "223", label: "Champions League" },
] as const;
