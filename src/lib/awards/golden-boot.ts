export const GOLDEN_BOOT_PREFIX = "Bota de Oro";
export const GOLDEN_BOOT_IMAGE = "/trophies/golden-boot.png";

export function isGoldenBootTitle(title: string | null | undefined) {
  return !!title && title.startsWith(GOLDEN_BOOT_PREFIX);
}

export function goldenBootTitle(tournamentName: string) {
  return `${GOLDEN_BOOT_PREFIX} · ${tournamentName}`;
}
