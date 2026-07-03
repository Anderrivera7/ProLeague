/**
 * Cliente TypeScript inspirado en:
 * https://github.com/1erkandogan/fc26-clubs-api
 *
 * API oficial EA Pro Clubs (proclubs.ea.com).
 * Útil para clubs de Pro Clubs; las selecciones usan squad-rosters + Drop API.
 */

const PROCLUBS_BASE = "https://proclubs.ea.com/api/fc";
const PLATFORM = "common-gen5";

const DEFAULT_HEADERS: HeadersInit = {
  Accept: "application/json",
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
};

async function proclubsRequest<T>(path: string, params: Record<string, string>) {
  const url = new URL(`${PROCLUBS_BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: DEFAULT_HEADERS,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`Pro Clubs API ${res.status}: ${path}`);
  }

  return (await res.json()) as T;
}

export interface ProClubSearchRow {
  clubId: string;
  clubInfo?: {
    name?: string;
    clubId?: string;
    regionId?: number;
  };
}

export interface ProClubInfo {
  name?: string;
  clubId?: string;
  wins?: string;
  losses?: string;
  ties?: string;
}

/** Busca club por nombre (fc26_api.search_club_by_name) */
export async function searchClubByName(clubName: string) {
  return proclubsRequest<ProClubSearchRow[]>("/allTimeLeaderboard/search", {
    platform: PLATFORM,
    clubName,
  });
}

/** Detalle de club por ID (fc26_api.get_club_details) */
export async function getClubDetails(clubId: string) {
  const rows = await proclubsRequest<ProClubInfo[]>("/clubs/info", {
    platform: PLATFORM,
    clubIds: clubId,
  });
  return rows[0] ?? null;
}

export async function getClubMatches(
  clubId: string,
  matchType: "friendlyMatch" | "leagueMatch" | "playoffMatch" = "friendlyMatch",
  maxResultCount = 10
) {
  return proclubsRequest<unknown[]>("/clubs/matches", {
    platform: PLATFORM,
    clubIds: clubId,
    matchType,
    maxResultCount: String(maxResultCount),
  });
}
