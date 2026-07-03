/**
 * Plantillas reales de selecciones en EA FC 26 (Career / International).
 * Fuente de referencia: FIFACM team pages, EA FC 26 squad data.
 *
 * Evita el error de usar "todos los jugadores con esa nacionalidad"
 * (ej. Benzema ya no está en la selección de Francia en FC26).
 */

export interface SquadPlayerTemplate {
  /** Término de búsqueda en EA Drop API */
  search: string;
  position: string;
}

export interface NationalSquadTemplate {
  nationalityId: number;
  /** ID de equipo en modo carrera (referencia FIFACM) */
  careerTeamId?: number;
  overall?: number;
  attack?: number;
  midfield?: number;
  defense?: number;
  players: SquadPlayerTemplate[];
}

/** Plantilla Francia FC26 — 26 jugadores (sin Benzema) */
const FRANCE_SQUAD: NationalSquadTemplate = {
  nationalityId: 18,
  careerTeamId: 1335,
  overall: 86,
  attack: 87,
  midfield: 85,
  defense: 85,
  players: [
    { search: "Maignan", position: "GK" },
    { search: "Samba", position: "GK" },
    { search: "Risser", position: "GK" },
    { search: "Koundé", position: "RB" },
    { search: "Upamecano", position: "CB" },
    { search: "Saliba", position: "CB" },
    { search: "Konaté", position: "CB" },
    { search: "Lacroix", position: "CB" },
    { search: "Theo", position: "LB" },
    { search: "Digne", position: "LB" },
    { search: "Gusto", position: "RB" },
    { search: "Tchouaméni", position: "CDM" },
    { search: "Rabiot", position: "CM" },
    { search: "Kanté", position: "CDM" },
    { search: "Koné", position: "CM" },
    { search: "Zaïre-Emery", position: "CM" },
    { search: "Olise", position: "CAM" },
    { search: "Cherki", position: "CAM" },
    { search: "Mbappé", position: "ST" },
    { search: "Dembélé", position: "RW" },
    { search: "Doué", position: "LW" },
    { search: "Barcola", position: "LW" },
    { search: "Thuram", position: "ST" },
    { search: "Mateta", position: "ST" },
    { search: "Akliouche", position: "CAM" },
  ],
};

const ROSTERS_BY_NATIONALITY: Record<number, NationalSquadTemplate> = {
  18: FRANCE_SQUAD,
};

export function getNationalSquadTemplate(
  nationalityId: number
): NationalSquadTemplate | undefined {
  return ROSTERS_BY_NATIONALITY[nationalityId];
}

export function hasCuratedSquad(nationalityId: number) {
  return nationalityId in ROSTERS_BY_NATIONALITY;
}
