import { getLeagueCoverUrl, getLeagueIconUrl } from "./club-ids";

/**
 * Trofeos locales PNG (prioridad) + TheSportsDB.
 * Clave = id interno de competición.
 */
const LOCAL_TROPHY_BY_ID: Record<string, string> = {
  "13": "/trophies/premier-league.png",
  "53": "/trophies/la-liga.png",
  "31": "/trophies/serie-a.png",
  "19": "/trophies/bundesliga.png",
  "16": "/trophies/ligue-1.png",
  "308": "/trophies/primeira-liga.png",
  "32": "/trophies/super-lig.png",
  "353": "/trophies/liga-argentina.png",
  "223": "/trophies/ucl.png",
  ucl: "/trophies/ucl.png",
  libertadores: "/trophies/libertadores.png",
  ecuador: "/trophies/liga-ecuador.png",
  peru: "/trophies/liga-1-peru.png",
  taca_portugal: "/trophies/taca-portugal.png",
  world_cup: "/trophies/world-cup.png",
  confederations: "/trophies/confederations.png",
  club_world_cup: "/trophies/club-world-cup.png",
  intercontinental: "/trophies/intercontinental.png",
};

const REMOTE_TROPHY_BY_ID: Record<string, string> = {
  "13": "https://r2.thesportsdb.com/images/media/league/trophy/9a6kw51689108793.png",
  "53": "https://r2.thesportsdb.com/images/media/league/trophy/vc2z6q1684416521.png",
  "31": "https://r2.thesportsdb.com/images/media/league/trophy/83l94y1684416466.png",
  "19": "https://r2.thesportsdb.com/images/media/league/trophy/0o56hs1684416407.png",
  "16": "https://r2.thesportsdb.com/images/media/league/trophy/ygfgeq1684416349.png",
  "10": "https://r2.thesportsdb.com/images/media/league/trophy/wx9n831722781060.png",
  "308": "https://r2.thesportsdb.com/images/media/league/trophy/3v5npc1726462062.png",
  "32": "https://r2.thesportsdb.com/images/media/league/trophy/2oirc41681158648.png",
  "80": "https://r2.thesportsdb.com/images/media/league/trophy/rpqwss1422012934.png",
  "7": "https://r2.thesportsdb.com/images/media/league/trophy/02ftjh1684945323.png",
  "353": "https://r2.thesportsdb.com/images/media/league/trophy/9sj4611777273081.png",
  "223": "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png",
  ucl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png",
  libertadores:
    "https://r2.thesportsdb.com/images/media/league/trophy/oev42h1696615691.png",
  peru: "https://r2.thesportsdb.com/images/media/league/trophy/tbe4ol1638922521.png",
  taca_portugal:
    "https://r2.thesportsdb.com/images/media/league/trophy/vzfp6k1549461835.png",
};

const NAME_TO_LEAGUE_ID: Array<{ pattern: RegExp; id: string }> = [
  { pattern: /premier\s*league|inglesa/i, id: "13" },
  {
    pattern: /la\s*liga|laliga|liga\s*espa[nñ]ola|primera\s*divisi[oó]n\s*espa/i,
    id: "53",
  },
  { pattern: /serie\s*a|scudetto/i, id: "31" },
  { pattern: /bundesliga|meisterschale/i, id: "19" },
  { pattern: /ligue\s*1|hexagoal/i, id: "16" },
  { pattern: /eredivisie/i, id: "10" },
  { pattern: /primeira\s*liga|liga\s*portugal(?!\s*ta[cç])/i, id: "308" },
  { pattern: /ta[cç]a\s*de\s*portugal|copa\s*de\s*portugal/i, id: "taca_portugal" },
  { pattern: /s[uü]per\s*lig/i, id: "32" },
  { pattern: /liga\s*mx|mexican/i, id: "80" },
  { pattern: /brasileir[aã]o|brazilian\s*serie/i, id: "7" },
  { pattern: /liga\s*profesional|argentin|racing/i, id: "353" },
  { pattern: /champions\s*league|uefa\s*champions/i, id: "ucl" },
  { pattern: /libertadores/i, id: "libertadores" },
  {
    pattern: /liga\s*pro|ecuador|ldu|quito|serie\s*a\s*ecuador/i,
    id: "ecuador",
  },
  { pattern: /sudamericana/i, id: "sudamericana" },
  { pattern: /liga\s*1\s*per[uú]|liga\s*peruana|per[uú](?!\s*liga)/i, id: "peru" },
  { pattern: /copa\s*del\s*mundo|world\s*cup|mundial(?!\s*de\s*club)/i, id: "world_cup" },
  { pattern: /confederaciones|confederations/i, id: "confederations" },
  { pattern: /mundial\s*de\s*clubes|club\s*world\s*cup/i, id: "club_world_cup" },
  { pattern: /intercontinental/i, id: "intercontinental" },
  { pattern: /mundial|selecciones/i, id: "intl" },
];

export function resolveLeagueIdForTrophy(
  fifaIndexId?: string | null,
  leagueName?: string | null
): string | null {
  if (
    fifaIndexId &&
    (LOCAL_TROPHY_BY_ID[fifaIndexId] || REMOTE_TROPHY_BY_ID[fifaIndexId])
  ) {
    return fifaIndexId;
  }
  if (fifaIndexId === "intl") return "intl";

  if (leagueName) {
    for (const entry of NAME_TO_LEAGUE_ID) {
      if (entry.pattern.test(leagueName)) return entry.id;
    }
  }

  return fifaIndexId ?? null;
}

/** URL del trofeo de la competición (local PNG > remoto > logo). */
export function getLeagueTrophyUrl(
  fifaIndexId?: string | null,
  leagueName?: string | null
): string | null {
  const id = resolveLeagueIdForTrophy(fifaIndexId, leagueName);
  if (!id) return null;

  if (LOCAL_TROPHY_BY_ID[id]) return LOCAL_TROPHY_BY_ID[id];
  if (REMOTE_TROPHY_BY_ID[id]) return REMOTE_TROPHY_BY_ID[id];

  return (
    getLeagueIconUrl(id, leagueName) ??
    getLeagueCoverUrl(id, leagueName ?? undefined) ??
    null
  );
}

export function getCompetitionTitleLabel(
  leagueName?: string | null,
  tournamentName?: string | null
): string {
  const name = leagueName?.trim() || tournamentName?.trim() || "Torneo";
  return `Campeón · ${name}`;
}

export function resolveTrophyImage(
  imageUrl?: string | null,
  fifaIndexId?: string | null,
  leagueOrTitle?: string | null
): string | null {
  if (imageUrl) return imageUrl;
  return getLeagueTrophyUrl(fifaIndexId, leagueOrTitle);
}
