export const GOLDEN_BOOT_PREFIX = "Bota de Oro";
export const GOLDEN_BOOT_IMAGE = "/trophies/golden-boot.png";
export const TOTY_CARD_IMAGE = "/trophies/toty-card.png";

/** Apellido en mayúsculas, como en la carta. */
export function goldenBootPlayerLabel(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const label = parts.at(-1) ?? fullName;
  return label.toLocaleUpperCase("es-ES");
}

export function goldenBootGoalCount(seasonName: string | null | undefined) {
  const match = seasonName?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function isGoldenBootTitle(title: string | null | undefined) {
  return !!title && title.startsWith(GOLDEN_BOOT_PREFIX);
}

export function goldenBootTitle(tournamentName: string) {
  return `${GOLDEN_BOOT_PREFIX} · ${tournamentName}`;
}
