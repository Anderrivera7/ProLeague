import { isBallonDorTitle } from "@/lib/awards/ballon-dor";
import { isGoldenBootTitle } from "@/lib/awards/golden-boot";

/** Premios que no suman como título de campeón. */
export function isIndividualAward(title: string | null | undefined) {
  return isGoldenBootTitle(title) || isBallonDorTitle(title);
}
