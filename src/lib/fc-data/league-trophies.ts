import { getLeagueCoverUrl, getLeagueIconUrl } from "./club-ids";

/**
 * Trofeos locales (prioridad) + TheSportsDB.
 * Clave = fifaIndexId de FcLeague / SoFIFA.
 */
const LOCAL_TROPHY_BY_ID: Record<string, string> = {
  "53": "/trophies/la-liga.png", // La Liga — imagen propia
};

const REMOTE_TROPHY_BY_ID: Record<string, string> = {
  "13": "https://r2.thesportsdb.com/images/media/league/trophy/9a6kw51689108793.png", // Premier
  "53": "https://r2.thesportsdb.com/images/media/league/trophy/vc2z6q1684416521.png", // La Liga fallback
  "31": "https://r2.thesportsdb.com/images/media/league/trophy/83l94y1684416466.png", // Serie A
  "19": "https://r2.thesportsdb.com/images/media/league/trophy/0o56hs1684416407.png", // Bundesliga
  "16": "https://r2.thesportsdb.com/images/media/league/trophy/ygfgeq1684416349.png", // Ligue 1
  "10": "https://r2.thesportsdb.com/images/media/league/trophy/wx9n831722781060.png", // Eredivisie
  "308": "https://r2.thesportsdb.com/images/media/league/trophy/3v5npc1726462062.png", // Primeira Liga
  "32": "https://r2.thesportsdb.com/images/media/league/trophy/2oirc41681158648.png", // Süper Lig
  "80": "https://r2.thesportsdb.com/images/media/league/trophy/rpqwss1422012934.png", // Liga MX
  "7": "https://r2.thesportsdb.com/images/media/league/trophy/02ftjh1684945323.png", // Brasileirão
  "353": "https://r2.thesportsdb.com/images/media/league/trophy/9sj4611777273081.png", // Liga Argentina
  "223": "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png", // UCL
  ucl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png",
};

const NAME_TO_LEAGUE_ID: Array<{ pattern: RegExp; id: string }> = [
  { pattern: /premier\s*league|inglesa/i, id: "13" },
  {
    pattern: /la\s*liga|laliga|liga\s*espa[nñ]ola|primera\s*divisi[oó]n/i,
    id: "53",
  },
  { pattern: /serie\s*a/i, id: "31" },
  { pattern: /bundesliga/i, id: "19" },
  { pattern: /ligue\s*1/i, id: "16" },
  { pattern: /eredivisie/i, id: "10" },
  { pattern: /primeira\s*liga|liga\s*portugal/i, id: "308" },
  { pattern: /s[uü]per\s*lig/i, id: "32" },
  { pattern: /liga\s*mx|mexican/i, id: "80" },
  { pattern: /brasileir[aã]o|brazilian\s*serie/i, id: "7" },
  { pattern: /liga\s*profesional|argentin/i, id: "353" },
  { pattern: /champions\s*league|uefa\s*champions/i, id: "ucl" },
  { pattern: /mundial|world\s*cup|selecciones/i, id: "intl" },
];

export function resolveLeagueIdForTrophy(
  fifaIndexId?: string | null,
  leagueName?: string | null
): string | null {
  if (fifaIndexId && (LOCAL_TROPHY_BY_ID[fifaIndexId] || REMOTE_TROPHY_BY_ID[fifaIndexId])) {
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

/** URL del trofeo de la competición (local > TheSportsDB > logo). */
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
