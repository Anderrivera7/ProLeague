export const APP_NAME = "ProLeague";
export const APP_DESCRIPTION =
  "La plataforma definitiva para gestionar torneos de EA SPORTS FC";

export const COLORS = {
  background: "#0B0B0B",
  card: "#141414",
  hover: "#1E1E1E",
  primary: "#39FF14",
  secondary: "#00C853",
  border: "#2A2A2A",
  text: "#FFFFFF",
  textSecondary: "#A1A1AA",
} as const;

export const ELO = {
  DEFAULT: 1000,
  K_FACTOR: 32,
  MIN: 100,
  MAX: 3000,
} as const;

export const TOURNAMENT_TYPES = {
  LEAGUE: { label: "Liga", description: "Todos contra todos" },
  KNOCKOUT: { label: "Eliminación Directa", description: "Bracket de eliminación" },
  GROUPS: { label: "Grupos", description: "Fase de grupos" },
  GROUPS_KNOCKOUT: {
    label: "Grupos + Eliminación",
    description: "Grupos seguidos de bracket",
  },
  TWO_LEGS: {
    label: "Ida y Vuelta",
    description: "Partidos de ida y vuelta",
  },
} as const;

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/tournaments", label: "Torneos", icon: "Trophy" },
  { href: "/matches", label: "Partidos", icon: "Swords" },
  { href: "/rankings", label: "Rankings", icon: "BarChart3" },
  { href: "/stats", label: "Estadísticas", icon: "TrendingUp" },
  { href: "/players", label: "Jugadores", icon: "Users" },
  { href: "/profile", label: "Mi Perfil", icon: "User" },
] as const;

export const STAT_CATEGORIES = [
  { key: "top_scorers", label: "Top Goleadores", icon: "Target" },
  { key: "top_assists", label: "Top Asistencias", icon: "Handshake" },
  { key: "most_wins", label: "Más Victorias", icon: "Medal" },
  { key: "most_titles", label: "Más Títulos", icon: "Crown" },
  { key: "most_matches", label: "Más Partidos", icon: "Gamepad2" },
  { key: "unbeaten", label: "Mayor Invicto", icon: "Shield" },
  { key: "best_attack", label: "Mejor Ataque", icon: "Flame" },
  { key: "best_defense", label: "Mejor Defensa", icon: "ShieldCheck" },
  { key: "elo_ranking", label: "Ranking ELO", icon: "Zap" },
] as const;
