const CLUB_PREFIX = "club:";

export const INTL_LEAGUE_EA_ID = "intl";
export const UCL_LEAGUE_EA_ID = "ucl";

/** Bandera del país para representar cada liga en el selector */
const LEAGUE_FLAG_BY_ID: Record<string, string> = {
  intl: "international",
  "53": "es", // La Liga
  "13": "gb-eng", // Premier League
  "19": "de", // Bundesliga
  "31": "it", // Serie A
  "16": "fr", // Ligue 1
  "10": "nl", // Eredivisie
  "308": "pt", // Primeira Liga
  "350": "sa", // Saudi Pro League
  "39": "us", // MLS
  "353": "ar", // Liga Argentina
  "7": "br", // Brasileirão
  "4": "be", // Pro League Bélgica
  "50": "gb-sct", // Premiership Escocia
  "1": "dk", // Superliga
  "56": "se", // Allsvenskan
  "41": "no", // Eliteserien
  "330": "ro", // Liga I
  "2012": "ch", // Super League Suiza
  "2149": "gr", // Super League Grecia
  "351": "au", // A-League
  "68": "kr", // K League
  "189": "pl", // Ekstraklasa
  "32": "tr", // Süper Lig
  "80": "mx", // Liga MX
  "83": "jp", // J League
};

export function eaIdFromClub(clubTeamId: number | string) {
  return `${CLUB_PREFIX}${clubTeamId}`;
}

export function isClubEaId(eaId: string) {
  return eaId.startsWith(CLUB_PREFIX);
}

export function parseClubEaId(eaId: string): number | null {
  if (!isClubEaId(eaId)) return null;
  const id = parseInt(eaId.slice(CLUB_PREFIX.length), 10);
  return Number.isNaN(id) ? null : id;
}

export function getSofifaTeamCrestUrl(clubTeamId: number | string) {
  return `https://cdn.sofifa.net/teams/${clubTeamId}/60.png`;
}

export function getSofifaLeagueLogoUrl(leagueId: number | string) {
  const flag = LEAGUE_FLAG_BY_ID[String(leagueId)];
  if (!flag) return null;
  if (flag === "international") return null;
  return `https://cdn.sofifa.net/flags/${flag}.png`;
}

/** Corrige URLs rotas guardadas en BD y reconstruye desde fifaIndexId si hace falta */
export function resolveTeamCrestUrl(
  crestUrl: string | null | undefined,
  fifaIndexId?: string
): string | null {
  if (crestUrl) {
    if (crestUrl.includes("/teams/") && crestUrl.includes("/26.png")) {
      return crestUrl.replace("/26.png", "/60.png");
    }
    if (crestUrl.includes("/teams/") && !crestUrl.endsWith("/60.png")) {
      const match = crestUrl.match(/\/teams\/(\d+)\//);
      if (match) return getSofifaTeamCrestUrl(match[1]);
    }
    return crestUrl;
  }

  if (fifaIndexId && isClubEaId(fifaIndexId)) {
    const clubId = parseClubEaId(fifaIndexId);
    if (clubId != null) return getSofifaTeamCrestUrl(clubId);
  }

  return null;
}

/** Imagen hero de la competición (archivos en /public/leagues/) */
const LEAGUE_COVER_BY_ID: Record<string, string> = {
  intl: "/leagues/intl.png",
  "53": "/leagues/53.png",
  "13": "/leagues/13.png",
  ucl: "/leagues/ucl.png",
  "223": "/leagues/ucl.png", // UEFA Champions League (SoFIFA)
};

const CHAMPIONS_LEAGUE_NAME = /champions\s*league|uefa\s*champions/i;
const LA_LIGA_NAME = /la\s*liga|laliga|primera\s*divisi[oó]n/i;

const LEAGUE_ICON_VERSION = "3";

/** Iconos locales para el grid del selector */
const LEAGUE_ICON_BY_ID: Record<string, string> = {
  intl: "/leagues/intl-icon.png",
  ucl: "/leagues/ucl-icon.png",
  "223": "/leagues/ucl-icon.png",
};

function withIconCacheBust(path: string) {
  return `${path}?v=${LEAGUE_ICON_VERSION}`;
}

export function getLeagueIconUrl(
  fifaIndexId?: string | null,
  leagueName?: string | null
): string | null {
  if (fifaIndexId) {
    const byId = LEAGUE_ICON_BY_ID[fifaIndexId];
    if (byId) return withIconCacheBust(byId);
  }
  if (leagueName && CHAMPIONS_LEAGUE_NAME.test(leagueName)) {
    return withIconCacheBust(LEAGUE_ICON_BY_ID[UCL_LEAGUE_EA_ID]);
  }
  if (fifaIndexId === INTL_LEAGUE_EA_ID || leagueName?.toLowerCase().includes("selecciones")) {
    return withIconCacheBust(LEAGUE_ICON_BY_ID[INTL_LEAGUE_EA_ID]);
  }
  return null;
}

export function getLeagueSubtitle(
  fifaIndexId: string,
  teamCount?: number
): string | null {
  if (fifaIndexId === UCL_LEAGUE_EA_ID || fifaIndexId === "223") {
    const n = teamCount ?? 36;
    return `Temporada 2026/27 · ${n} clasificados`;
  }
  if (fifaIndexId === INTL_LEAGUE_EA_ID) {
    const n = teamCount ?? 28;
    return `Mundial FC26 · ${n} selecciones`;
  }
  return null;
}

export function getLeagueCoverUrl(
  fifaIndexId: string,
  leagueName?: string | null
): string | null {
  const byId = LEAGUE_COVER_BY_ID[fifaIndexId];
  if (byId) return byId;
  if (leagueName && CHAMPIONS_LEAGUE_NAME.test(leagueName)) {
    return LEAGUE_COVER_BY_ID[UCL_LEAGUE_EA_ID];
  }
  if (leagueName && LA_LIGA_NAME.test(leagueName)) {
    return LEAGUE_COVER_BY_ID["53"];
  }
  return null;
}

export function resolveLeagueLogoUrl(
  logoUrl: string | null | undefined,
  fifaIndexId?: string,
  leagueName?: string | null
): string | null {
  const icon = getLeagueIconUrl(fifaIndexId, leagueName);
  if (icon) return icon;

  if (logoUrl?.includes("/leagues/ucl.png")) {
    return withIconCacheBust(LEAGUE_ICON_BY_ID[UCL_LEAGUE_EA_ID]);
  }
  if (logoUrl?.includes("/leagues/intl.png")) {
    return withIconCacheBust(LEAGUE_ICON_BY_ID[INTL_LEAGUE_EA_ID]);
  }

  if (logoUrl?.startsWith("/leagues/")) return logoUrl;

  if (logoUrl) {
    if (logoUrl.includes("/leagues/") && logoUrl.includes("/26.png")) {
      const leagueId = logoUrl.match(/\/leagues\/(\d+)\//)?.[1];
      if (leagueId) return getSofifaLeagueLogoUrl(leagueId);
    }
    if (logoUrl.includes("/flags/")) return logoUrl;
    if (logoUrl.includes("/meta/")) {
      const leagueId = fifaIndexId;
      if (leagueId) return getSofifaLeagueLogoUrl(leagueId);
    }
  }

  if (fifaIndexId) return getSofifaLeagueLogoUrl(fifaIndexId);
  return null;
}

/** Ligas de 1ª división destacadas (orden en el selector) */
export const FEATURED_LEAGUE_IDS = [
  "intl",
  "ucl",
  "223",
  "53",
  "13",
  "19",
  "31",
  "16",
  "10",
  "308",
  "350",
  "39",
  "353",
  "7",
  "4",
  "50",
  "1",
] as const;

export function sortLeaguesByPriority<T extends { fifaIndexId: string; name: string }>(
  leagues: T[]
) {
  const priority = new Map(
    FEATURED_LEAGUE_IDS.map((id, index) => [id, index])
  );

  return [...leagues].sort((a, b) => {
    const pa = priority.get(a.fifaIndexId) ?? 999;
    const pb = priority.get(b.fifaIndexId) ?? 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, "es");
  });
}
