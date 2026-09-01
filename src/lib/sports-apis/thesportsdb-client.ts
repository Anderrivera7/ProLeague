import { unstable_cache } from "next/cache";
import { currentFootballSeason } from "./league-mapping";

const BASE = "https://www.thesportsdb.com/api/v1/json";
const DEFAULT_KEY = "3";

function apiKey() {
  return process.env.THE_SPORTS_DB_API_KEY?.trim() || DEFAULT_KEY;
}

async function fetchSportsDb<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}/${apiKey()}/${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export type SportsDbStanding = {
  rank: number;
  team: string;
  badge: string | null;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string | null;
};

export type SportsDbEvent = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeBadge: string | null;
  awayBadge: string | null;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string | null;
  league: string;
  leagueBadge: string | null;
  status: string;
  thumb: string | null;
};

type TableRow = {
  intRank: string;
  strTeam: string;
  strBadge: string;
  intPlayed: string;
  intWin: string;
  intDraw: string;
  intLoss: string;
  intGoalsFor: string;
  intGoalsAgainst: string;
  intGoalDifference: string;
  intPoints: string;
  strForm?: string;
};

type EventRow = {
  idEvent: string;
  strHomeTeam: string;
  strAwayTeam: string;
  strHomeTeamBadge: string;
  strAwayTeamBadge: string;
  intHomeScore: string | null;
  intAwayScore: string | null;
  dateEvent: string;
  strTime: string;
  strLeague: string;
  strLeagueBadge: string;
  strStatus: string;
  strThumb: string | null;
};

function mapStanding(row: TableRow): SportsDbStanding {
  return {
    rank: parseInt(row.intRank, 10),
    team: row.strTeam,
    badge: row.strBadge?.replace("/tiny", "") ?? null,
    played: parseInt(row.intPlayed, 10),
    wins: parseInt(row.intWin, 10),
    draws: parseInt(row.intDraw, 10),
    losses: parseInt(row.intLoss, 10),
    goalsFor: parseInt(row.intGoalsFor, 10),
    goalsAgainst: parseInt(row.intGoalsAgainst, 10),
    goalDifference: parseInt(row.intGoalDifference, 10),
    points: parseInt(row.intPoints, 10),
    form: row.strForm ?? null,
  };
}

function mapEvent(row: EventRow): SportsDbEvent {
  return {
    id: row.idEvent,
    homeTeam: row.strHomeTeam,
    awayTeam: row.strAwayTeam,
    homeBadge: row.strHomeTeamBadge ?? null,
    awayBadge: row.strAwayTeamBadge ?? null,
    homeScore: row.intHomeScore != null ? parseInt(row.intHomeScore, 10) : null,
    awayScore: row.intAwayScore != null ? parseInt(row.intAwayScore, 10) : null,
    date: row.dateEvent,
    time: row.strTime ?? null,
    league: row.strLeague,
    leagueBadge: row.strLeagueBadge ?? null,
    status: row.strStatus,
    thumb: row.strThumb,
  };
}

export async function getLeagueStandings(
  sportsDbLeagueId: string,
  limit = 10
): Promise<SportsDbStanding[]> {
  const season = currentFootballSeason();
  const data = await fetchSportsDb<{ table?: TableRow[] }>(
    `lookuptable.php?l=${sportsDbLeagueId}&s=${season}`
  );
  if (!data?.table?.length) return [];
  return data.table.slice(0, limit).map(mapStanding);
}

export async function getNextLeagueEvents(
  sportsDbLeagueId: string,
  limit = 5
): Promise<SportsDbEvent[]> {
  const data = await fetchSportsDb<{ events?: EventRow[] }>(
    `eventsnextleague.php?id=${sportsDbLeagueId}`
  );
  if (!data?.events?.length) return [];
  return data.events.slice(0, limit).map(mapEvent);
}

export async function getPastLeagueEvents(
  sportsDbLeagueId: string,
  limit = 5
): Promise<SportsDbEvent[]> {
  const data = await fetchSportsDb<{ events?: EventRow[] }>(
    `eventspastleague.php?id=${sportsDbLeagueId}`
  );
  const events = data?.events ?? [];
  return events.slice(0, limit).map(mapEvent);
}

/** Busca escudo de equipo por nombre (fallback si no hay crest en EA). */
export async function searchTeamBadge(
  teamName: string
): Promise<string | null> {
  const data = await fetchSportsDb<{
    teams?: Array<{ strTeamBadge: string }>;
  }>(`searchteams.php?t=${encodeURIComponent(teamName)}`);
  return data?.teams?.[0]?.strTeamBadge ?? null;
}

export const getCachedLeagueStandings = unstable_cache(
  async (sportsDbLeagueId: string, limit: number) =>
    getLeagueStandings(sportsDbLeagueId, limit),
  ["sportsdb-standings"],
  { revalidate: 3600 }
);

export const getCachedNextEvents = unstable_cache(
  async (sportsDbLeagueId: string, limit: number) =>
    getNextLeagueEvents(sportsDbLeagueId, limit),
  ["sportsdb-next-events"],
  { revalidate: 1800 }
);

export const getCachedPastEvents = unstable_cache(
  async (sportsDbLeagueId: string, limit: number) =>
    getPastLeagueEvents(sportsDbLeagueId, limit),
  ["sportsdb-past-events"],
  { revalidate: 1800 }
);
