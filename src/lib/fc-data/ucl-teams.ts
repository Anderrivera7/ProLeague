/**
 * Clasificados a la fase de liga UEFA Champions League 2026/27.
 * `clubTeamId` = ID SoFIFA / EA FC 26.
 */
export const UCL_2026_27_TEAMS = [
  { clubTeamId: 243, name: "Real Madrid" },
  { clubTeamId: 241, name: "FC Barcelona" },
  { clubTeamId: 240, name: "Atlético Madrid" },
  { clubTeamId: 448, name: "Athletic Club" },
  { clubTeamId: 483, name: "Villarreal CF" },
  { clubTeamId: 9, name: "Liverpool" },
  { clubTeamId: 1, name: "Arsenal" },
  { clubTeamId: 10, name: "Manchester City" },
  { clubTeamId: 11, name: "Manchester United" },
  { clubTeamId: 5, name: "Chelsea" },
  { clubTeamId: 13, name: "Newcastle United" },
  { clubTeamId: 2, name: "Aston Villa" },
  { clubTeamId: 18, name: "Tottenham Hotspur" },
  { clubTeamId: 21, name: "Bayern München" },
  { clubTeamId: 22, name: "Borussia Dortmund" },
  { clubTeamId: 32, name: "Bayer 04 Leverkusen" },
  { clubTeamId: 112172, name: "RB Leipzig" },
  { clubTeamId: 36, name: "VfB Stuttgart" },
  { clubTeamId: 1824, name: "Eintracht Frankfurt" },
  { clubTeamId: 44, name: "Inter" },
  { clubTeamId: 47, name: "AC Milan" },
  { clubTeamId: 45, name: "Juventus" },
  { clubTeamId: 48, name: "Napoli" },
  { clubTeamId: 52, name: "Roma" },
  { clubTeamId: 1745, name: "Como" },
  { clubTeamId: 39, name: "Atalanta" },
  { clubTeamId: 189, name: "Bologna" },
  { clubTeamId: 73, name: "Paris Saint-Germain" },
  { clubTeamId: 69, name: "AS Monaco" },
  { clubTeamId: 378, name: "Stade Brestois" },
  { clubTeamId: 234, name: "Benfica" },
  { clubTeamId: 237, name: "Sporting CP" },
  { clubTeamId: 236, name: "FC Porto" },
  { clubTeamId: 245, name: "Ajax" },
  { clubTeamId: 246, name: "PSV" },
  { clubTeamId: 247, name: "Feyenoord" },
  { clubTeamId: 78, name: "Celtic" },
  { clubTeamId: 231, name: "Club Brugge" },
  { clubTeamId: 191, name: "RB Salzburg" },
] as const;

export const UCL_LEAGUE_DISPLAY_NAME = "UEFA Champions League 2026/27";

export function isUclLeagueFifaId(fifaIndexId?: string | null) {
  return fifaIndexId === "ucl" || fifaIndexId === "223";
}

export function getUclTeamEaIds() {
  return UCL_2026_27_TEAMS.map((t) => `club:${t.clubTeamId}`);
}

export function isUclClubTeamId(clubTeamId: number) {
  return UCL_2026_27_TEAMS.some((t) => t.clubTeamId === clubTeamId);
}
