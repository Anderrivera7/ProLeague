export function isBetterWin(
  newMargin: number,
  newGf: number,
  oldMargin: number,
  oldGf: number
): boolean {
  if (newMargin > oldMargin) return true;
  if (newMargin === oldMargin && newGf > oldGf) return true;
  return false;
}

export function formatBiggestWin(
  gf: number,
  ga: number,
  opponentNickname?: string | null
): string {
  if (gf <= 0) return "—";
  const score = `${gf}-${ga}`;
  return opponentNickname ? `${score} vs ${opponentNickname}` : score;
}

export function positiveStreak(streak: number): number {
  return Math.max(0, streak);
}
