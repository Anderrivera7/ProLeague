const EA_PORTRAIT_BASE =
  "https://ratings-images-prod.pulse.ea.com/FC25/full/player-portraits";

/** Retrato oficial EA (funciona en navegador sin hotlink block). */
export function getEaPlayerPortraitUrl(eaId: string) {
  return `${EA_PORTRAIT_BASE}/p${eaId}.png?padding=0.7`;
}

export function resolvePlayerImageUrl(
  eaId: string,
  storedUrl?: string | null
): string {
  if (storedUrl?.includes("pulse.ea.com")) return storedUrl;
  if (storedUrl?.includes("drop-assets.ea.com")) return storedUrl;
  // SoFIFA suele bloquear en el cliente; EA es la fuente fiable en UI.
  return getEaPlayerPortraitUrl(eaId);
}
