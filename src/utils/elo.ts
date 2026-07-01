import { ELO } from "@/constants";

/**
 * Calcula el nuevo ELO tras un partido usando el sistema Elo estándar.
 */
export function calculateElo(
  playerElo: number,
  opponentElo: number,
  score: 1 | 0.5 | 0,
  kFactor = ELO.K_FACTOR
): number {
  const expected =
    1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const newElo = playerElo + kFactor * (score - expected);
  return Math.round(
    Math.max(ELO.MIN, Math.min(ELO.MAX, newElo))
  );
}

export function getMatchEloScores(
  homeElo: number,
  awayElo: number,
  homeScore: number,
  awayScore: number
): { homeNewElo: number; awayNewElo: number } {
  let homeResult: 1 | 0.5 | 0;
  let awayResult: 1 | 0.5 | 0;

  if (homeScore > awayScore) {
    homeResult = 1;
    awayResult = 0;
  } else if (homeScore < awayScore) {
    homeResult = 0;
    awayResult = 1;
  } else {
    homeResult = 0.5;
    awayResult = 0.5;
  }

  return {
    homeNewElo: calculateElo(homeElo, awayElo, homeResult),
    awayNewElo: calculateElo(awayElo, homeElo, awayResult),
  };
}

export function calculateLevel(elo: number): number {
  return Math.floor(elo / 100) + 1;
}
