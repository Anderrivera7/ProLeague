export const MATCH_POINTS = {
  win: 3,
  draw: 1,
  loss: 0,
  mvpBonus: 1,
} as const;

export function getMatchPointUpdates(
  homePoints: number,
  awayPoints: number,
  homeScore: number,
  awayScore: number,
  mvpUserId: string | undefined,
  homeUserId: string,
  awayUserId: string
) {
  const homeWon = homeScore > awayScore;
  const awayWon = awayScore > homeScore;
  const isDraw = homeScore === awayScore;

  let homeDelta = homeWon
    ? MATCH_POINTS.win
    : isDraw
      ? MATCH_POINTS.draw
      : MATCH_POINTS.loss;
  let awayDelta = awayWon
    ? MATCH_POINTS.win
    : isDraw
      ? MATCH_POINTS.draw
      : MATCH_POINTS.loss;

  if (mvpUserId === homeUserId) homeDelta += MATCH_POINTS.mvpBonus;
  if (mvpUserId === awayUserId) awayDelta += MATCH_POINTS.mvpBonus;

  return {
    homeNewPoints: homePoints + homeDelta,
    awayNewPoints: awayPoints + awayDelta,
  };
}

export function calculateLevel(points: number): number {
  return Math.floor(points / 100) + 1;
}
