import {
  cachedCrestPathForClubId,
  localCrestPathForClubId,
} from "./local-crests";

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

/**
 * Escudo de club usable en el navegador.
 * Preferimos proxy local (evita 403 de Sofifa/Futbin por hotlink).
 */
export function getSofifaTeamCrestUrl(clubTeamId: number | string) {
  return `/api/crest/${clubTeamId}`;
}

function clubIdFromSofifaCrestUrl(url: string): string | null {
  const match = url.match(/\/teams\/(\d+)/);
  return match?.[1] ?? null;
}

function clubIdFromAnyCrestUrl(url: string): string | null {
  return (
    clubIdFromSofifaCrestUrl(url) ??
    url.match(/\/clubs\/(\d+)\.png/)?.[1] ??
    url.match(/\/api\/crest\/(\d+)/)?.[1] ??
    null
  );
}

/** EA / Sofifa team id por nombre de club (palmarés manual). */
export const CLUB_NAME_TO_TEAM_ID: Record<string, number> = {
  "Manchester United": 11,
  "Manchester City": 10,
  Liverpool: 9,
  Feyenoord: 246,
  PSV: 247,
  Bologna: 189,
  "FC Porto": 236,
  Benfica: 234,
  "Sporting CP": 237,
  Inter: 44,
  "FC Bayern München": 21,
  "Borussia Dortmund": 22,
  "FC Barcelona": 241,
  "Atlético Madrid": 240,
  "Real Madrid": 243,
  Anderlecht: 229,
  Palmeiras: 383,
  Flamengo: 1041,
  "River Plate": 1876,
  "Boca Juniors": 1877,
  "Colo-Colo": 110980,
  Rangers: 86,
  "Olympique de Marseille": 219,
  Universitario: 111017,
  "LDU Quito": 110740,
  "Inter Miami": 112893,
  Toluca: 1882,
};

/** Selecciones / palmarés por país → bandera Sofifa (ISO). */
export const NATION_NAME_TO_FLAG: Record<string, string> = {
  France: "fr",
  Morocco: "ma",
  Argentina: "ar",
  Brazil: "br",
  England: "gb-eng",
  Spain: "es",
  Germany: "de",
  Italy: "it",
  Portugal: "pt",
  Netherlands: "nl",
  Chile: "cl",
};

export function localNationFlagPath(isoCode: string): string {
  return `/api/flag/${isoCode}`;
}

export function nationFlagUrl(isoCode: string): string {
  return localNationFlagPath(isoCode);
}

function resolveClubNumericId(
  fifaIndexId?: string | null,
  crestUrl?: string | null,
  clubName?: string | null
): string | null {
  if (fifaIndexId && isClubEaId(fifaIndexId)) {
    const id = parseClubEaId(fifaIndexId);
    if (id != null) return String(id);
  }
  if (fifaIndexId && /^\d+$/.test(fifaIndexId)) return fifaIndexId;
  if (clubName && NATION_NAME_TO_FLAG[clubName]) return null;
  if (clubName && CLUB_NAME_TO_TEAM_ID[clubName] != null) {
    return String(CLUB_NAME_TO_TEAM_ID[clubName]);
  }
  if (crestUrl) {
    const fromUrl = clubIdFromAnyCrestUrl(crestUrl);
    if (fromUrl) return fromUrl;
  }
  return null;
}

/** Candidatos de escudo (el cliente prueba en orden si uno falla). */
export function getTeamCrestCandidates(
  crestUrl: string | null | undefined,
  fifaIndexId?: string,
  clubName?: string | null
): string[] {
  const candidates: string[] = [];
  const push = (url: string | null | undefined) => {
    if (url && !candidates.includes(url)) candidates.push(url);
  };

  if (clubName && NATION_NAME_TO_FLAG[clubName]) {
    const code = NATION_NAME_TO_FLAG[clubName];
    push(localNationFlagPath(code));
    if (crestUrl?.startsWith("/api/flag/")) push(crestUrl);
    if (crestUrl?.startsWith("/flags/")) {
      const legacy = crestUrl.match(/\/flags\/([a-z0-9-]+)\.png/i)?.[1];
      if (legacy) push(localNationFlagPath(legacy));
    }
    return candidates;
  }

  const flagFromCrest =
    crestUrl?.match(/\/api\/flag\/([a-z0-9-]+)/i)?.[1] ??
    crestUrl?.match(/\/flags\/([a-z0-9-]+)\.png/i)?.[1];
  if (flagFromCrest) {
    push(localNationFlagPath(flagFromCrest));
    if (crestUrl?.startsWith("/")) push(crestUrl);
    return candidates;
  }

  const clubId = resolveClubNumericId(fifaIndexId, crestUrl, clubName);

  if (crestUrl?.startsWith("/crests/") && !crestUrl.includes("/cache/")) {
    push(crestUrl);
  }

  const localPath = localCrestPathForClubId(clubId);
  if (localPath) push(localPath);

  const cached = cachedCrestPathForClubId(clubId);
  if (cached) push(cached);

  if (clubId) {
    push(`/api/crest/${clubId}`);
  }

  if (crestUrl?.startsWith("/crests/")) push(crestUrl);

  if (crestUrl?.startsWith("/api/crest/")) push(crestUrl);

  if (
    crestUrl?.startsWith("/") &&
    !crestUrl.startsWith("/crests/") &&
    !crestUrl.startsWith("/api/crest/")
  ) {
    push(crestUrl);
  } else if (
    crestUrl &&
    !crestUrl.includes("sofifa.net") &&
    !crestUrl.includes("futbin.com")
  ) {
    push(crestUrl);
  }

  return candidates;
}

export function getSofifaLeagueLogoUrl(leagueId: number | string) {
  const flag = LEAGUE_FLAG_BY_ID[String(leagueId)];
  if (!flag) return null;
  if (flag === "international") return null;
  return `https://cdn.sofifa.net/flags/${flag}.png`;
}

/** Corrige URLs rotas/bloqueadas en BD y reconstruye desde fifaIndexId si hace falta */
export function resolveTeamCrestUrl(
  crestUrl: string | null | undefined,
  fifaIndexId?: string,
  clubName?: string | null
): string | null {
  return getTeamCrestCandidates(crestUrl, fifaIndexId, clubName)[0] ?? null;
}

/** Imagen hero de la competición (archivos en /public/leagues/) */
const LEAGUE_COVER_BY_ID: Record<string, string> = {
  intl: "/leagues/intl.png",
  "53": "/leagues/53.png", // LaLiga
  "13": "/leagues/13.png",
  "19": "/leagues/19.png", // Bundesliga
  "31": "/leagues/31.png", // Serie A
  "16": "/leagues/16.png", // Ligue 1
  ucl: "/leagues/ucl.png",
  "223": "/leagues/ucl.png", // UEFA Champions League (SoFIFA)
};

const CHAMPIONS_LEAGUE_NAME = /champions\s*league|uefa\s*champions/i;
const LA_LIGA_NAME = /la\s*liga|laliga|primera\s*divisi[oó]n/i;
const SERIE_A_NAME = /serie\s*a/i;
const BUNDESLIGA_NAME = /bundesliga/i;
const LIGUE_1_NAME = /ligue\s*1/i;

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
  if (leagueName && SERIE_A_NAME.test(leagueName)) {
    return LEAGUE_COVER_BY_ID["31"];
  }
  if (leagueName && BUNDESLIGA_NAME.test(leagueName)) {
    return LEAGUE_COVER_BY_ID["19"];
  }
  if (leagueName && LIGUE_1_NAME.test(leagueName)) {
    return LEAGUE_COVER_BY_ID["16"];
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
  "32",
  "350",
  "39",
  "353",
  "7",
  "80",
  "4",
  "50",
  "1",
  "56",
  "41",
  "330",
  "2012",
  "2149",
  "351",
  "68",
  "189",
  "83",
] as const;

export function sortLeaguesByPriority<T extends { fifaIndexId: string; name: string }>(
  leagues: T[]
) {
  const priority = new Map<string, number>(
    FEATURED_LEAGUE_IDS.map((id, index) => [id, index])
  );

  return [...leagues].sort((a, b) => {
    const pa = priority.get(a.fifaIndexId) ?? 999;
    const pb = priority.get(b.fifaIndexId) ?? 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name, "es");
  });
}
