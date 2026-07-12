import type { FormationId } from "./tactical-formations";
import { isClubEaId } from "./club-ids";
import { normalizeEaTeamId } from "./national-teams";

/**
 * Formación táctica habitual por selección (EA FC 26 / tendencias reales).
 * Fuentes: plantillas SoFIFA, alineaciones tipo en modo carrera internacional.
 */
const NATIONAL_FORMATIONS: Record<number, FormationId> = {
  52: "433", // Argentina
  10: "4231", // Croacia
  12: "4231", // República Checa
  13: "433", // Dinamarca
  14: "433", // Inglaterra
  17: "442", // Finlandia
  18: "4231", // Francia
  21: "4231", // Alemania
  117: "4231", // Ghana
  34: "433", // Países Bajos
  23: "4231", // Hungría
  24: "442", // Islandia
  25: "433", // Irlanda
  27: "433", // Italia
  83: "4231", // México
  129: "4231", // Marruecos
  35: "442", // Irlanda del Norte
  36: "433", // Noruega
  37: "4231", // Polonia
  38: "4231", // Portugal
  182: "451", // Catar
  39: "4231", // Rumanía
  42: "4231", // Escocia
  45: "433", // España
  46: "442", // Suecia
  49: "4231", // Ucrania
  95: "433", // Estados Unidos
  50: "4231", // Gales
};

/** Clubes top con formación conocida (eaId club-XXXXX) */
const CLUB_FORMATIONS: Record<string, FormationId> = {
  "club-73": "433", // PSG
  "club-243": "433", // Real Madrid
  "club-241": "4231", // Barcelona
  "club-9": "433", // Liverpool
  "club-1": "4231", // Arsenal
  "club-11": "4231", // Man United
  "club-10": "4231", // Man City
  "club-44": "352", // Inter
  "club-47": "433", // AC Milan
  "club-21": "4231", // Bayern
  "club-5": "433", // Chelsea
};

export function getDefaultFormation(teamEaId?: string | null): FormationId {
  if (!teamEaId) return "433";

  const normalized = normalizeEaTeamId(teamEaId);

  if (isClubEaId(normalized)) {
    return CLUB_FORMATIONS[normalized] ?? "433";
  }

  const nationalityId = parseInt(normalized, 10);
  if (!Number.isNaN(nationalityId)) {
    return NATIONAL_FORMATIONS[nationalityId] ?? "433";
  }

  return "433";
}
