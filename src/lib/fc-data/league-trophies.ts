import { getLeagueCoverUrl, getLeagueIconUrl } from "./club-ids";

/**
 * Ligas / competiciones de FC27 (+ extras del selector).
 * IDs = fifaIndexId / EA.
 */
export const FC27_COMPETITIONS: Array<{
  id: string;
  name: string;
  kind: "league" | "intl" | "continental" | "cup";
}> = [
  { id: "intl", name: "Selecciones / Mundial", kind: "intl" },
  { id: "world_cup", name: "Copa del Mundo", kind: "intl" },
  { id: "ucl", name: "UEFA Champions League", kind: "continental" },
  { id: "223", name: "UEFA Champions League", kind: "continental" },
  { id: "13", name: "Premier League", kind: "league" },
  { id: "53", name: "La Liga", kind: "league" },
  { id: "19", name: "Bundesliga", kind: "league" },
  { id: "31", name: "Serie A", kind: "league" },
  { id: "16", name: "Ligue 1", kind: "league" },
  { id: "10", name: "Eredivisie", kind: "league" },
  { id: "308", name: "Primeira Liga", kind: "league" },
  { id: "32", name: "Süper Lig", kind: "league" },
  { id: "350", name: "Saudi Pro League", kind: "league" },
  { id: "39", name: "MLS", kind: "league" },
  { id: "353", name: "Liga Argentina", kind: "league" },
  { id: "7", name: "Brasileirão", kind: "league" },
  { id: "4", name: "Pro League (Bélgica)", kind: "league" },
  { id: "50", name: "Premiership (Escocia)", kind: "league" },
  { id: "1", name: "Superliga (Dinamarca)", kind: "league" },
  { id: "56", name: "Allsvenskan", kind: "league" },
  { id: "41", name: "Eliteserien", kind: "league" },
  { id: "330", name: "Liga I (Rumanía)", kind: "league" },
  { id: "2012", name: "Super League (Suiza)", kind: "league" },
  { id: "2149", name: "Super League (Grecia)", kind: "league" },
  { id: "351", name: "A-League", kind: "league" },
  { id: "68", name: "K League", kind: "league" },
  { id: "189", name: "Ekstraklasa", kind: "league" },
  { id: "80", name: "Liga MX", kind: "league" },
  { id: "83", name: "J1 League", kind: "league" },
  { id: "libertadores", name: "Copa Libertadores", kind: "continental" },
  { id: "sudamericana", name: "Copa Sudamericana", kind: "continental" },
  { id: "ecuador", name: "Liga Pro Ecuador", kind: "league" },
  { id: "peru", name: "Liga 1 Perú", kind: "league" },
  { id: "taca_portugal", name: "Taça de Portugal", kind: "cup" },
  { id: "club_world_cup", name: "Mundial de Clubes", kind: "intl" },
  { id: "intercontinental", name: "Intercontinental", kind: "intl" },
  { id: "confederations", name: "Confederaciones", kind: "intl" },
];

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
  "10": "/trophies/eredivisie.png",
  "308": "/trophies/primeira-liga.png",
  "32": "/trophies/super-lig.png",
  "353": "/trophies/liga-argentina.png",
  "7": "/trophies/brasileirao.png",
  "80": "/trophies/liga-mx.png",
  "350": "/trophies/saudi-pro-league.png",
  "39": "/trophies/mls.png",
  "4": "/trophies/belgium-pro-league.png",
  "50": "/trophies/scottish-premiership.png",
  "1": "/trophies/denmark-superliga.png",
  "56": "/trophies/allsvenskan.png",
  "41": "/trophies/eliteserien.png",
  "2149": "/trophies/greece-super-league.png",
  "351": "/trophies/a-league.png",
  "223": "/trophies/ucl.png",
  ucl: "/trophies/ucl.png",
  intl: "/trophies/world-cup.png",
  libertadores: "/trophies/libertadores.png",
  sudamericana: "/trophies/sudamericana.png",
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
  "350": "https://r2.thesportsdb.com/images/media/league/trophy/tkaj2z1747536256.png",
  "39": "https://r2.thesportsdb.com/images/media/league/trophy/k50lm81684415987.png",
  "4": "https://r2.thesportsdb.com/images/media/league/trophy/tvuvwy1422267731.png",
  "50": "https://r2.thesportsdb.com/images/media/league/trophy/qsqruv1422282072.png",
  "1": "https://r2.thesportsdb.com/images/media/league/trophy/uqywpu1422281651.png",
  "56": "https://r2.thesportsdb.com/images/media/league/trophy/0zpqqm1610917265.png",
  "41": "https://r2.thesportsdb.com/images/media/league/trophy/uz9kw61778714637.png",
  "2149": "https://r2.thesportsdb.com/images/media/league/trophy/y96u431716371640.png",
  "351": "https://r2.thesportsdb.com/images/media/league/trophy/uxssyx1422266419.png",
  "223": "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png",
  ucl: "https://r2.thesportsdb.com/images/media/league/trophy/31y13d1747884950.png",
  world_cup:
    "https://r2.thesportsdb.com/images/media/league/trophy/mmyv4f1724782185.png",
  intl: "https://r2.thesportsdb.com/images/media/league/trophy/mmyv4f1724782185.png",
  libertadores:
    "https://r2.thesportsdb.com/images/media/league/trophy/oev42h1696615691.png",
  sudamericana:
    "https://www.thesportsdb.com/images/media/league/trophy/xtvtut1448813925.png",
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
  { pattern: /s[uü]per\s*lig(?!\s*(suiza|swiss|greece|grec))/i, id: "32" },
  { pattern: /liga\s*mx|mexican/i, id: "80" },
  { pattern: /brasileir[aã]o|brazilian\s*serie/i, id: "7" },
  { pattern: /liga\s*profesional|argentin/i, id: "353" },
  { pattern: /saudi|pro\s*league\s*saud|roshn/i, id: "350" },
  { pattern: /\bmls\b|major\s*league\s*soccer/i, id: "39" },
  { pattern: /belg|jupiler|pro\s*league\s*\(?b[eé]lg/i, id: "4" },
  { pattern: /scottish|premiership|escoc/i, id: "50" },
  { pattern: /superliga|danmark|denmark|danes/i, id: "1" },
  { pattern: /allsvenskan|suec/i, id: "56" },
  { pattern: /eliteserien|norueg/i, id: "41" },
  { pattern: /liga\s*i\b|ruman|romania/i, id: "330" },
  { pattern: /swiss|suiza|super\s*league\s*suiz/i, id: "2012" },
  { pattern: /super\s*league\s*grec|greece|grecia/i, id: "2149" },
  { pattern: /a[\s-]*league|austral/i, id: "351" },
  { pattern: /k[\s-]*league|corea|korea/i, id: "68" },
  { pattern: /ekstraklasa|polon/i, id: "189" },
  { pattern: /j[\s-]*league|j1|japon/i, id: "83" },
  { pattern: /champions\s*league|uefa\s*champions/i, id: "ucl" },
  { pattern: /libertadores/i, id: "libertadores" },
  {
    pattern: /liga\s*pro|ecuador|ldu|quito|serie\s*a\s*ecuador/i,
    id: "ecuador",
  },
  { pattern: /sudamericana/i, id: "sudamericana" },
  { pattern: /liga\s*1\s*per[uú]|liga\s*peruana/i, id: "peru" },
  { pattern: /copa\s*del\s*mundo|world\s*cup|mundial(?!\s*de\s*club)/i, id: "world_cup" },
  { pattern: /confederaciones|confederations/i, id: "confederations" },
  { pattern: /mundial\s*de\s*clubes|club\s*world\s*cup/i, id: "club_world_cup" },
  { pattern: /intercontinental/i, id: "intercontinental" },
  { pattern: /selecciones/i, id: "intl" },
];

const KNOWN_IDS = new Set(FC27_COMPETITIONS.map((c) => c.id));

export function resolveLeagueIdForTrophy(
  fifaIndexId?: string | null,
  leagueName?: string | null
): string | null {
  if (fifaIndexId && KNOWN_IDS.has(fifaIndexId)) return fifaIndexId;
  if (
    fifaIndexId &&
    (LOCAL_TROPHY_BY_ID[fifaIndexId] || REMOTE_TROPHY_BY_ID[fifaIndexId])
  ) {
    return fifaIndexId;
  }

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

export type ChampionTheme = {
  id: string;
  eyebrow: string;
  confetti: string[];
  glow: string;
  stripe: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  titleGradient: string;
  buttonClass: string;
};

function theme(
  id: string,
  eyebrow: string,
  confetti: string[],
  glow: string,
  stripe: string,
  badge: [border: string, bg: string, text: string],
  titleGradient: string,
  buttonClass: string
): ChampionTheme {
  return {
    id,
    eyebrow,
    confetti,
    glow,
    stripe,
    badgeBorder: badge[0],
    badgeBg: badge[1],
    badgeText: badge[2],
    titleGradient,
    buttonClass,
  };
}

/** Tema visual distinto por cada competición FC27. */
const THEME_BY_ID: Record<string, ChampionTheme> = {
  ucl: theme(
    "ucl",
    "Noche europea",
    ["#a5b4fc", "#e0e7ff", "#6366f1", "#c7d2fe", "#818cf8"],
    "rgba(99,102,241,0.35)",
    "via-indigo-300/30",
    ["border-indigo-300/50", "bg-indigo-500/15", "text-indigo-100"],
    "from-indigo-100 via-white to-indigo-300",
    "bg-gradient-to-r from-indigo-400 to-violet-500 text-white hover:from-indigo-300 hover:to-violet-400"
  ),
  "223": theme(
    "223",
    "Noche europea",
    ["#a5b4fc", "#e0e7ff", "#6366f1", "#c7d2fe", "#818cf8"],
    "rgba(99,102,241,0.35)",
    "via-indigo-300/30",
    ["border-indigo-300/50", "bg-indigo-500/15", "text-indigo-100"],
    "from-indigo-100 via-white to-indigo-300",
    "bg-gradient-to-r from-indigo-400 to-violet-500 text-white hover:from-indigo-300 hover:to-violet-400"
  ),
  world_cup: theme(
    "world_cup",
    "Campeón del mundo",
    ["#facc15", "#22c55e", "#38bdf8", "#f97316", "#ffffff"],
    "rgba(34,197,94,0.32)",
    "via-emerald-300/30",
    ["border-emerald-300/50", "bg-emerald-500/15", "text-emerald-100"],
    "from-yellow-100 via-emerald-200 to-sky-300",
    "bg-gradient-to-r from-emerald-400 to-sky-500 font-bold text-black hover:from-emerald-300 hover:to-sky-400"
  ),
  intl: theme(
    "intl",
    "Gloria internacional",
    ["#facc15", "#22c55e", "#38bdf8", "#f97316", "#ffffff"],
    "rgba(34,197,94,0.32)",
    "via-emerald-300/30",
    ["border-emerald-300/50", "bg-emerald-500/15", "text-emerald-100"],
    "from-yellow-100 via-emerald-200 to-sky-300",
    "bg-gradient-to-r from-emerald-400 to-sky-500 font-bold text-black hover:from-emerald-300 hover:to-sky-400"
  ),
  club_world_cup: theme(
    "club_world_cup",
    "Rey de clubes",
    ["#fde68a", "#f59e0b", "#38bdf8", "#e2e8f0", "#fbbf24"],
    "rgba(56,189,248,0.3)",
    "via-sky-300/30",
    ["border-sky-300/50", "bg-sky-500/15", "text-sky-100"],
    "from-sky-100 via-yellow-200 to-amber-400",
    "bg-gradient-to-r from-sky-400 to-amber-400 font-bold text-black hover:from-sky-300 hover:to-amber-300"
  ),
  intercontinental: theme(
    "intercontinental",
    "Clásico intercontinental",
    ["#fde68a", "#f59e0b", "#38bdf8", "#e2e8f0", "#fbbf24"],
    "rgba(56,189,248,0.3)",
    "via-sky-300/30",
    ["border-sky-300/50", "bg-sky-500/15", "text-sky-100"],
    "from-sky-100 via-yellow-200 to-amber-400",
    "bg-gradient-to-r from-sky-400 to-amber-400 font-bold text-black hover:from-sky-300 hover:to-amber-300"
  ),
  confederations: theme(
    "confederations",
    "Confederaciones",
    ["#fde68a", "#22c55e", "#38bdf8", "#e2e8f0", "#fbbf24"],
    "rgba(34,197,94,0.28)",
    "via-teal-300/30",
    ["border-teal-300/50", "bg-teal-500/15", "text-teal-100"],
    "from-teal-100 via-yellow-200 to-emerald-400",
    "bg-gradient-to-r from-teal-400 to-emerald-500 font-bold text-black hover:from-teal-300 hover:to-emerald-400"
  ),
  libertadores: theme(
    "libertadores",
    "Gloria continental",
    ["#fbbf24", "#f59e0b", "#78350f", "#fde68a", "#a16207"],
    "rgba(245,158,11,0.35)",
    "via-amber-500/35",
    ["border-amber-500/50", "bg-amber-600/20", "text-amber-100"],
    "from-amber-100 via-yellow-300 to-amber-600",
    "bg-gradient-to-r from-amber-500 to-yellow-600 font-bold text-black hover:from-amber-400 hover:to-yellow-500"
  ),
  sudamericana: theme(
    "sudamericana",
    "Sudamericana",
    ["#f97316", "#ea580c", "#fdba74", "#fff7ed", "#c2410c"],
    "rgba(249,115,22,0.35)",
    "via-orange-400/35",
    ["border-orange-400/50", "bg-orange-500/15", "text-orange-100"],
    "from-orange-100 via-orange-300 to-red-500",
    "bg-gradient-to-r from-orange-400 to-red-500 font-bold text-white hover:from-orange-300 hover:to-red-400"
  ),
  taca_portugal: theme(
    "taca_portugal",
    "Campeón de copa",
    ["#fb7185", "#f43f5e", "#fda4af", "#e2e8f0", "#fbbf24"],
    "rgba(244,63,94,0.3)",
    "via-rose-400/30",
    ["border-rose-300/50", "bg-rose-500/15", "text-rose-100"],
    "from-rose-100 via-pink-200 to-rose-400",
    "bg-gradient-to-r from-rose-400 to-pink-500 font-bold text-white hover:from-rose-300 hover:to-pink-400"
  ),
  // Big 5
  "13": theme(
    "13",
    "Premier League",
    ["#7c3aed", "#a78bfa", "#c4b5fd", "#ffffff", "#4c1d95"],
    "rgba(124,58,237,0.35)",
    "via-violet-400/30",
    ["border-violet-300/50", "bg-violet-500/15", "text-violet-100"],
    "from-violet-100 via-purple-200 to-violet-400",
    "bg-gradient-to-r from-violet-500 to-purple-700 text-white hover:from-violet-400 hover:to-purple-600"
  ),
  "53": theme(
    "53",
    "La Liga",
    ["#f97316", "#ea580c", "#fdba74", "#ffffff", "#fb923c"],
    "rgba(249,115,22,0.35)",
    "via-orange-400/30",
    ["border-orange-300/50", "bg-orange-500/15", "text-orange-100"],
    "from-orange-100 via-amber-200 to-orange-500",
    "bg-gradient-to-r from-orange-400 to-red-500 font-bold text-white hover:from-orange-300 hover:to-red-400"
  ),
  "19": theme(
    "19",
    "Bundesliga",
    ["#ef4444", "#f87171", "#fecaca", "#ffffff", "#b91c1c"],
    "rgba(239,68,68,0.32)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-400",
    "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600"
  ),
  "31": theme(
    "31",
    "Serie A",
    ["#38bdf8", "#0ea5e9", "#7dd3fc", "#ffffff", "#0369a1"],
    "rgba(14,165,233,0.32)",
    "via-sky-400/30",
    ["border-sky-300/50", "bg-sky-500/15", "text-sky-100"],
    "from-sky-100 via-cyan-200 to-sky-500",
    "bg-gradient-to-r from-sky-400 to-blue-600 text-white hover:from-sky-300 hover:to-blue-500"
  ),
  "16": theme(
    "16",
    "Ligue 1",
    ["#1e3a8a", "#3b82f6", "#93c5fd", "#facc15", "#1d4ed8"],
    "rgba(37,99,235,0.35)",
    "via-blue-400/30",
    ["border-blue-300/50", "bg-blue-500/15", "text-blue-100"],
    "from-blue-100 via-yellow-200 to-blue-500",
    "bg-gradient-to-r from-blue-600 to-yellow-400 font-bold text-white hover:from-blue-500 hover:to-yellow-300"
  ),
  "10": theme(
    "10",
    "Eredivisie",
    ["#f97316", "#fb923c", "#fdba74", "#ffffff", "#ea580c"],
    "rgba(249,115,22,0.35)",
    "via-orange-400/30",
    ["border-orange-300/50", "bg-orange-500/15", "text-orange-100"],
    "from-orange-100 via-orange-300 to-orange-600",
    "bg-gradient-to-r from-orange-400 to-orange-600 font-bold text-black hover:from-orange-300 hover:to-orange-500"
  ),
  "308": theme(
    "308",
    "Primeira Liga",
    ["#22c55e", "#ef4444", "#facc15", "#ffffff", "#15803d"],
    "rgba(34,197,94,0.32)",
    "via-green-400/30",
    ["border-green-300/50", "bg-green-500/15", "text-green-100"],
    "from-green-100 via-red-200 to-yellow-400",
    "bg-gradient-to-r from-green-500 to-red-500 text-white hover:from-green-400 hover:to-red-400"
  ),
  "32": theme(
    "32",
    "Süper Lig",
    ["#ef4444", "#ffffff", "#fca5a5", "#fecaca", "#b91c1c"],
    "rgba(239,68,68,0.32)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-500",
    "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600"
  ),
  "350": theme(
    "350",
    "Saudi Pro League",
    ["#16a34a", "#facc15", "#86efac", "#ffffff", "#166534"],
    "rgba(22,163,74,0.35)",
    "via-green-400/30",
    ["border-green-300/50", "bg-green-500/15", "text-green-100"],
    "from-green-100 via-yellow-200 to-green-600",
    "bg-gradient-to-r from-green-500 to-yellow-500 font-bold text-black hover:from-green-400 hover:to-yellow-400"
  ),
  "39": theme(
    "39",
    "MLS Cup",
    ["#0ea5e9", "#ef4444", "#38bdf8", "#ffffff", "#1d4ed8"],
    "rgba(14,165,233,0.32)",
    "via-sky-400/30",
    ["border-sky-300/50", "bg-sky-500/15", "text-sky-100"],
    "from-sky-100 via-red-200 to-blue-500",
    "bg-gradient-to-r from-sky-500 to-red-500 text-white hover:from-sky-400 hover:to-red-400"
  ),
  "353": theme(
    "353",
    "Liga Argentina",
    ["#38bdf8", "#ffffff", "#7dd3fc", "#e0f2fe", "#0284c7"],
    "rgba(56,189,248,0.32)",
    "via-sky-300/30",
    ["border-sky-300/50", "bg-sky-500/15", "text-sky-100"],
    "from-sky-100 via-white to-sky-400",
    "bg-gradient-to-r from-sky-400 to-sky-600 text-white hover:from-sky-300 hover:to-sky-500"
  ),
  "7": theme(
    "7",
    "Brasileirão",
    ["#22c55e", "#facc15", "#86efac", "#ffffff", "#15803d"],
    "rgba(34,197,94,0.35)",
    "via-green-400/30",
    ["border-green-300/50", "bg-green-500/15", "text-green-100"],
    "from-green-100 via-yellow-200 to-green-600",
    "bg-gradient-to-r from-green-500 to-yellow-400 font-bold text-black hover:from-green-400 hover:to-yellow-300"
  ),
  "4": theme(
    "4",
    "Pro League",
    ["#facc15", "#ef4444", "#000000", "#fde68a", "#b91c1c"],
    "rgba(250,204,21,0.3)",
    "via-yellow-400/30",
    ["border-yellow-300/50", "bg-yellow-500/15", "text-yellow-100"],
    "from-yellow-100 via-red-200 to-yellow-500",
    "bg-gradient-to-r from-yellow-400 to-red-600 font-bold text-black hover:from-yellow-300 hover:to-red-500"
  ),
  "50": theme(
    "50",
    "Premiership",
    ["#1e3a8a", "#3b82f6", "#93c5fd", "#ffffff", "#1e40af"],
    "rgba(30,64,175,0.35)",
    "via-blue-400/30",
    ["border-blue-300/50", "bg-blue-500/15", "text-blue-100"],
    "from-blue-100 via-white to-blue-500",
    "bg-gradient-to-r from-blue-700 to-blue-500 text-white hover:from-blue-600 hover:to-blue-400"
  ),
  "1": theme(
    "1",
    "Superliga",
    ["#ef4444", "#ffffff", "#fca5a5", "#fecaca", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-500",
    "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600"
  ),
  "56": theme(
    "56",
    "Allsvenskan",
    ["#3b82f6", "#facc15", "#93c5fd", "#ffffff", "#1d4ed8"],
    "rgba(59,130,246,0.32)",
    "via-blue-400/30",
    ["border-blue-300/50", "bg-blue-500/15", "text-blue-100"],
    "from-blue-100 via-yellow-200 to-blue-500",
    "bg-gradient-to-r from-blue-500 to-yellow-400 font-bold text-black hover:from-blue-400 hover:to-yellow-300"
  ),
  "41": theme(
    "41",
    "Eliteserien",
    ["#ef4444", "#1e3a8a", "#fca5a5", "#ffffff", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-blue-200 to-red-500",
    "bg-gradient-to-r from-red-500 to-blue-700 text-white hover:from-red-400 hover:to-blue-600"
  ),
  "330": theme(
    "330",
    "Liga I",
    ["#3b82f6", "#facc15", "#ef4444", "#ffffff", "#1d4ed8"],
    "rgba(59,130,246,0.32)",
    "via-blue-400/30",
    ["border-blue-300/50", "bg-blue-500/15", "text-blue-100"],
    "from-blue-100 via-yellow-200 to-red-400",
    "bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 text-white hover:from-blue-400 hover:to-red-400"
  ),
  "2012": theme(
    "2012",
    "Super League",
    ["#ef4444", "#ffffff", "#fca5a5", "#fecaca", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-500",
    "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600"
  ),
  "2149": theme(
    "2149",
    "Super League",
    ["#3b82f6", "#ffffff", "#93c5fd", "#e0f2fe", "#1d4ed8"],
    "rgba(59,130,246,0.32)",
    "via-blue-400/30",
    ["border-blue-300/50", "bg-blue-500/15", "text-blue-100"],
    "from-blue-100 via-white to-blue-500",
    "bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-400 hover:to-blue-600"
  ),
  "351": theme(
    "351",
    "A-League",
    ["#f97316", "#0ea5e9", "#fdba74", "#ffffff", "#ea580c"],
    "rgba(249,115,22,0.32)",
    "via-orange-400/30",
    ["border-orange-300/50", "bg-orange-500/15", "text-orange-100"],
    "from-orange-100 via-sky-200 to-orange-500",
    "bg-gradient-to-r from-orange-400 to-sky-500 font-bold text-black hover:from-orange-300 hover:to-sky-400"
  ),
  "68": theme(
    "68",
    "K League",
    ["#ef4444", "#3b82f6", "#fca5a5", "#ffffff", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-blue-200 to-red-500",
    "bg-gradient-to-r from-red-500 to-blue-600 text-white hover:from-red-400 hover:to-blue-500"
  ),
  "189": theme(
    "189",
    "Ekstraklasa",
    ["#ef4444", "#ffffff", "#fca5a5", "#fecaca", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-500",
    "bg-gradient-to-r from-white to-red-600 text-black hover:from-red-100 hover:to-red-500"
  ),
  "80": theme(
    "80",
    "Liga MX",
    ["#22c55e", "#ef4444", "#86efac", "#ffffff", "#15803d"],
    "rgba(34,197,94,0.32)",
    "via-green-400/30",
    ["border-green-300/50", "bg-green-500/15", "text-green-100"],
    "from-green-100 via-red-200 to-green-600",
    "bg-gradient-to-r from-green-500 to-red-500 text-white hover:from-green-400 hover:to-red-400"
  ),
  "83": theme(
    "83",
    "J1 League",
    ["#ef4444", "#ffffff", "#fca5a5", "#fecaca", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-500",
    "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600"
  ),
  ecuador: theme(
    "ecuador",
    "Liga Pro",
    ["#facc15", "#3b82f6", "#ef4444", "#ffffff", "#eab308"],
    "rgba(234,179,8,0.32)",
    "via-yellow-400/30",
    ["border-yellow-300/50", "bg-yellow-500/15", "text-yellow-100"],
    "from-yellow-100 via-blue-200 to-red-400",
    "bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 font-bold text-black hover:from-yellow-300 hover:to-red-400"
  ),
  peru: theme(
    "peru",
    "Liga 1",
    ["#ef4444", "#ffffff", "#fca5a5", "#fecaca", "#b91c1c"],
    "rgba(239,68,68,0.3)",
    "via-red-400/30",
    ["border-red-300/50", "bg-red-500/15", "text-red-100"],
    "from-red-100 via-white to-red-500",
    "bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-400 hover:to-red-600"
  ),
};

const DEFAULT_LEAGUE_THEME = theme(
  "league",
  "Nuevo título",
  ["#facc15", "#f59e0b", "#fde68a", "#eab308", "#fef3c7"],
  "rgba(250,204,21,0.28)",
  "via-yellow-400/25",
  ["border-yellow-400/50", "bg-yellow-500/10", "text-yellow-200"],
  "from-yellow-100 via-yellow-300 to-amber-500",
  "bg-gradient-to-r from-yellow-400 to-amber-500 font-bold text-black hover:from-yellow-300 hover:to-amber-400"
);

const DEFAULT_CUP_THEME = theme(
  "cup",
  "Campeón de copa",
  ["#fb7185", "#f43f5e", "#fda4af", "#e2e8f0", "#fbbf24"],
  "rgba(244,63,94,0.3)",
  "via-rose-400/30",
  ["border-rose-300/50", "bg-rose-500/15", "text-rose-100"],
  "from-rose-100 via-pink-200 to-rose-400",
  "bg-gradient-to-r from-rose-400 to-pink-500 font-bold text-white hover:from-rose-300 hover:to-pink-400"
);

/** Look de la animación de campeón según la competición. */
export function getChampionTheme(
  fifaIndexId?: string | null,
  leagueName?: string | null
): ChampionTheme {
  const id = resolveLeagueIdForTrophy(fifaIndexId, leagueName);
  if (id && THEME_BY_ID[id]) return THEME_BY_ID[id];

  const name = leagueName ?? "";
  if (/copa|cup|ta[cç]a|fa\s*cup|carabao|coupe/i.test(name)) {
    return DEFAULT_CUP_THEME;
  }
  return DEFAULT_LEAGUE_THEME;
}

/** Presets para preview local de todas las competiciones. */
export function listChampionPreviewPresets() {
  const seen = new Set<string>();
  return FC27_COMPETITIONS.filter((c) => {
    if (c.id === "223") return false; // alias de ucl
    if (seen.has(c.id)) return false;
    seen.add(c.id);
    return true;
  }).map((c) => ({
    id: c.id,
    name: c.name,
    trophyUrl: getLeagueTrophyUrl(c.id, c.name),
    theme: getChampionTheme(c.id, c.name),
  }));
}

export function resolveTrophyImage(
  imageUrl?: string | null,
  fifaIndexId?: string | null,
  leagueOrTitle?: string | null
): string | null {
  if (imageUrl) return imageUrl;
  return getLeagueTrophyUrl(fifaIndexId, leagueOrTitle);
}
