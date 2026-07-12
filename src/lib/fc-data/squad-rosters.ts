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

const PORTUGAL_SQUAD: NationalSquadTemplate = {
  nationalityId: 38,
  careerTeamId: 1354,
  overall: 86,
  attack: 85,
  midfield: 84,
  defense: 84,
  players: [
    { search: "Costa", position: "GK" },
    { search: "Patrício", position: "GK" },
    { search: "Mendes", position: "LB" },
    { search: "Cancelo", position: "LB" },
    { search: "Inácio", position: "LCB" },
    { search: "Dias", position: "RCB" },
    { search: "Dalot", position: "RB" },
    { search: "Guerreiro", position: "LB" },
    { search: "Palhinha", position: "LDM" },
    { search: "Gonçalves Neves", position: "RDM" },
    { search: "Vitinha", position: "CDM" },
    { search: "Fernandes", position: "LAM" },
    { search: "Rafa", position: "CAM" },
    { search: "Otávio", position: "RAM" },
    { search: "Bernardo", position: "RCM" },
    { search: "Leão", position: "LW" },
    { search: "Neto", position: "RW" },
    { search: "Ronaldo", position: "ST" },
    { search: "Conceição", position: "RW" },
    { search: "Semedo", position: "RB" },
    { search: "Rúben Neves", position: "CDM" },
    { search: "Matheus Nunes", position: "CM" },
    { search: "Horta", position: "CAM" },
    { search: "Jota Silva", position: "ST" },
  ],
};

const ROSTERS_BY_NATIONALITY: Record<number, NationalSquadTemplate> = {
  18: FRANCE_SQUAD,
  38: PORTUGAL_SQUAD,
};

export function getNationalSquadTemplate(
  nationalityId: number
): NationalSquadTemplate | undefined {
  return ROSTERS_BY_NATIONALITY[nationalityId];
}

export function hasCuratedSquad(nationalityId: number) {
  return nationalityId in ROSTERS_BY_NATIONALITY;
}
