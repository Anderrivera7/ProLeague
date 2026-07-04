const BENCH_ROLES = new Set(["SUB", "RES"]);

export function isStarterRole(role: string | null | undefined) {
  return !!role && !BENCH_ROLES.has(role);
}

export function isSubstituteRole(role: string | null | undefined) {
  return role === "SUB";
}

export function isReserveRole(role: string | null | undefined) {
  return role === "RES";
}

export interface FormationSlot {
  role: string;
  row: number;
  col: number;
}

/** Coordenadas en grid 5×5 para dibujar la formación en el campo */
const FORMATION_LAYOUT: Record<string, FormationSlot> = {
  GK: { role: "GK", row: 4, col: 2 },
  LB: { role: "LB", row: 3, col: 0 },
  LWB: { role: "LWB", row: 3, col: 0 },
  LCB: { role: "LCB", row: 3, col: 1 },
  CB: { role: "CB", row: 3, col: 2 },
  RCB: { role: "RCB", row: 3, col: 3 },
  RB: { role: "RB", row: 3, col: 4 },
  RWB: { role: "RWB", row: 3, col: 4 },
  LDM: { role: "LDM", row: 2, col: 1 },
  CDM: { role: "CDM", row: 2, col: 2 },
  RDM: { role: "RDM", row: 2, col: 3 },
  LCM: { role: "LCM", row: 2, col: 1 },
  CM: { role: "CM", row: 2, col: 2 },
  RCM: { role: "RCM", row: 2, col: 3 },
  LM: { role: "LM", row: 2, col: 0 },
  RM: { role: "RM", row: 2, col: 4 },
  LAM: { role: "LAM", row: 1, col: 1 },
  CAM: { role: "CAM", row: 1, col: 2 },
  RAM: { role: "RAM", row: 1, col: 3 },
  LW: { role: "LW", row: 1, col: 0 },
  RW: { role: "RW", row: 1, col: 4 },
  LF: { role: "LF", row: 0, col: 1 },
  CF: { role: "CF", row: 0, col: 2 },
  RF: { role: "RF", row: 0, col: 3 },
  ST: { role: "ST", row: 0, col: 2 },
  LS: { role: "LS", row: 0, col: 1 },
  RS: { role: "RS", row: 0, col: 3 },
};

export function getFormationSlot(role: string | null | undefined): FormationSlot {
  const key = role?.toUpperCase() ?? "CM";
  return FORMATION_LAYOUT[key] ?? { role: key, row: 2, col: 2 };
}

export function inferFormationLabel(roles: string[]) {
  const counts = {
    def: roles.filter((r) => ["LB", "LCB", "CB", "RCB", "RB", "LWB", "RWB"].includes(r)).length,
    mid: roles.filter((r) =>
      ["LDM", "CDM", "RDM", "LCM", "CM", "RCM", "LM", "RM", "LAM", "CAM", "RAM"].includes(r)
    ).length,
    att: roles.filter((r) =>
      ["LW", "RW", "LF", "CF", "RF", "ST", "LS", "RS"].includes(r)
    ).length,
  };
  return `${counts.def}-${counts.mid}-${counts.att}`;
}
