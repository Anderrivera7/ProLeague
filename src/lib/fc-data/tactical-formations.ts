/** Plantillas tácticas estándar (11 jugadores). row: 0=ataque, 4=portero */

export type FormationId =
  | "442"
  | "433"
  | "451"
  | "343"
  | "352"
  | "3151"
  | "532"
  | "541"
  | "4222"
  | "4231"
  | "244"
  | "253";

export interface FormationSlot {
  role: string;
  row: number;
  col: number;
}

export interface TacticalFormation {
  id: FormationId;
  label: string;
  slots: FormationSlot[];
}

export const TACTICAL_FORMATIONS: TacticalFormation[] = [
  {
    id: "442",
    label: "4-4-2",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RB", row: 3, col: 4 },
      { role: "LM", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RM", row: 2, col: 4 },
      { role: "LS", row: 0, col: 1 },
      { role: "RS", row: 0, col: 3 },
    ],
  },
  {
    id: "433",
    label: "4-3-3",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RB", row: 3, col: 4 },
      { role: "LCM", row: 2, col: 1 },
      { role: "CDM", row: 2, col: 2 },
      { role: "RCM", row: 2, col: 3 },
      { role: "LW", row: 0, col: 0 },
      { role: "ST", row: 0, col: 2 },
      { role: "RW", row: 0, col: 4 },
    ],
  },
  {
    id: "451",
    label: "4-5-1",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RB", row: 3, col: 4 },
      { role: "LM", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "CDM", row: 2, col: 2 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RM", row: 2, col: 4 },
      { role: "ST", row: 0, col: 2 },
    ],
  },
  {
    id: "343",
    label: "3-4-3",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LCB", row: 3, col: 1 },
      { role: "CB", row: 3, col: 2 },
      { role: "RCB", row: 3, col: 3 },
      { role: "LM", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RM", row: 2, col: 4 },
      { role: "LW", row: 0, col: 0 },
      { role: "ST", row: 0, col: 2 },
      { role: "RW", row: 0, col: 4 },
    ],
  },
  {
    id: "352",
    label: "3-5-2",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LCB", row: 3, col: 1 },
      { role: "CB", row: 3, col: 2 },
      { role: "RCB", row: 3, col: 3 },
      { role: "LWB", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "CDM", row: 2, col: 2 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RWB", row: 2, col: 4 },
      { role: "LS", row: 0, col: 1 },
      { role: "RS", row: 0, col: 3 },
    ],
  },
  {
    id: "3151",
    label: "3-1-5-1",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LCB", row: 3, col: 1 },
      { role: "CB", row: 3, col: 2 },
      { role: "RCB", row: 3, col: 3 },
      { role: "CDM", row: 2, col: 2 },
      { role: "LM", row: 1, col: 0 },
      { role: "LCM", row: 1, col: 1 },
      { role: "CAM", row: 1, col: 2 },
      { role: "RCM", row: 1, col: 3 },
      { role: "RM", row: 1, col: 4 },
      { role: "ST", row: 0, col: 2 },
    ],
  },
  {
    id: "532",
    label: "5-3-2",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LWB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "CB", row: 3, col: 2 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RWB", row: 3, col: 4 },
      { role: "LCM", row: 2, col: 1 },
      { role: "CDM", row: 2, col: 2 },
      { role: "RCM", row: 2, col: 3 },
      { role: "LS", row: 0, col: 1 },
      { role: "RS", row: 0, col: 3 },
    ],
  },
  {
    id: "541",
    label: "5-4-1",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LWB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "CB", row: 3, col: 2 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RWB", row: 3, col: 4 },
      { role: "LM", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RM", row: 2, col: 4 },
      { role: "ST", row: 0, col: 2 },
    ],
  },
  {
    id: "4222",
    label: "4-2-2-2",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RB", row: 3, col: 4 },
      { role: "LDM", row: 2, col: 1 },
      { role: "RDM", row: 2, col: 3 },
      { role: "LAM", row: 1, col: 1 },
      { role: "RAM", row: 1, col: 3 },
      { role: "LS", row: 0, col: 1 },
      { role: "RS", row: 0, col: 3 },
    ],
  },
  {
    id: "4231",
    label: "4-2-3-1",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LB", row: 3, col: 0 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "RB", row: 3, col: 4 },
      { role: "LDM", row: 2, col: 1 },
      { role: "RDM", row: 2, col: 3 },
      { role: "LAM", row: 1, col: 0 },
      { role: "CAM", row: 1, col: 2 },
      { role: "RAM", row: 1, col: 4 },
      { role: "ST", row: 0, col: 2 },
    ],
  },
  {
    id: "244",
    label: "2-4-4",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "LM", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RM", row: 2, col: 4 },
      { role: "LW", row: 0, col: 0 },
      { role: "LS", row: 0, col: 1 },
      { role: "RS", row: 0, col: 3 },
      { role: "RW", row: 0, col: 4 },
    ],
  },
  {
    id: "253",
    label: "2-5-3",
    slots: [
      { role: "GK", row: 4, col: 2 },
      { role: "LCB", row: 3, col: 1 },
      { role: "RCB", row: 3, col: 3 },
      { role: "LWB", row: 2, col: 0 },
      { role: "LCM", row: 2, col: 1 },
      { role: "CDM", row: 2, col: 2 },
      { role: "RCM", row: 2, col: 3 },
      { role: "RWB", row: 2, col: 4 },
      { role: "LW", row: 0, col: 0 },
      { role: "ST", row: 0, col: 2 },
      { role: "RW", row: 0, col: 4 },
    ],
  },
];

export function getFormationById(id: FormationId): TacticalFormation {
  return TACTICAL_FORMATIONS.find((f) => f.id === id) ?? TACTICAL_FORMATIONS[1];
}

/** Formaciones más usadas — el resto en "Más". */
export const PRIMARY_FORMATION_IDS: FormationId[] = [
  "4231",
  "433",
  "442",
  "451",
  "352",
  "343",
];
