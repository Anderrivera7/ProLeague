export const BALLON_DOR_PREFIX = "Balón de Oro";
export const BALLON_DOR_IMAGE = "/trophies/ballon-dor.png";

export function isBallonDorTitle(title: string | null | undefined) {
  return !!title && title.startsWith(BALLON_DOR_PREFIX);
}

export function ballonDorTitle(tournamentName: string) {
  return `${BALLON_DOR_PREFIX} · ${tournamentName}`;
}
