/** Jugadores que no deben aparecer en plantillas (fallecidos, retirados, etc.). */
const EXCLUDED_EA_IDS = new Set([
  "205655", // Diogo Jota
]);

const EXCLUDED_NAME_KEYS = ["diogo jota"];

export function isExcludedPlayer(
  eaId?: string | null,
  name?: string | null
): boolean {
  if (eaId && EXCLUDED_EA_IDS.has(eaId)) return true;
  const key = name?.toLowerCase().trim() ?? "";
  return EXCLUDED_NAME_KEYS.some((n) => key.includes(n));
}

export function filterActiveSquad<
  T extends { eaId?: string; fifaIndexId?: string; id?: string; name: string },
>(players: T[]): T[] {
  return players.filter(
    (p) => !isExcludedPlayer(p.eaId ?? p.fifaIndexId ?? p.id, p.name)
  );
}
