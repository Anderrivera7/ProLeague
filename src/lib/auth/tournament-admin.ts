const TOURNAMENT_ADMINS = new Set(["anderr"]);

export function isTournamentAdmin(nickname: string | null | undefined) {
  if (!nickname) return false;
  return TOURNAMENT_ADMINS.has(nickname.trim().toLowerCase());
}
