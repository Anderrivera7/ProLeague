const BENCH_ROLES = new Set(["SUB", "RES"]);

export function isStarterRole(role: string | null | undefined) {
  return !!role && !BENCH_ROLES.has(role);
}

export function isSubstituteRole(role: string | null | undefined) {
  return role === "SUB" || role === "RES";
}

export function isReserveRole(role: string | null | undefined) {
  return role === "RES";
}

/** Titulares + banquillo (suplentes y reservas) */
export function isBenchRole(role: string | null | undefined) {
  return isSubstituteRole(role);
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
  const withoutGk = roles.filter((r) => r !== "GK");
  const counts = {
    def: withoutGk.filter((r) =>
      ["LB", "LCB", "CB", "RCB", "RB", "LWB", "RWB"].includes(r)
    ).length,
    mid: withoutGk.filter((r) =>
      ["LDM", "CDM", "RDM", "LCM", "CM", "RCM", "LM", "RM", "LAM", "CAM", "RAM"].includes(r)
    ).length,
    att: withoutGk.filter((r) =>
      ["LW", "RW", "LF", "CF", "RF", "ST", "LS", "RS"].includes(r)
    ).length,
  };
  return `${counts.def}-${counts.mid}-${counts.att}`;
}

export interface PitchPosition {
  top: string;
  left: string;
}

/** Reparte jugadores en cada línea para evitar solapamientos en el campo */
export function layoutStarterPositions(
  starters: { squadRole: string | null }[]
): PitchPosition[] {
  const rowGroups = new Map<number, { index: number; col: number; sub: number }[]>();

  starters.forEach((player, index) => {
    const slot = getFormationSlot(player.squadRole);
    const group = rowGroups.get(slot.row) ?? [];
    const sub = group.filter((g) => g.col === slot.col).length;
    group.push({ index, col: slot.col, sub });
    rowGroups.set(slot.row, group);
  });

  const positions: PitchPosition[] = Array.from({ length: starters.length }, () => ({
    top: "50%",
    left: "50%",
  }));

  for (const [row, group] of rowGroups) {
    const sorted = [...group].sort((a, b) => a.col - b.col || a.sub - b.sub);
    const colCounts = new Map<number, number>();

    sorted.forEach((entry, posInRow) => {
      const count = sorted.length;
      const baseCol =
        count === 1 ? entry.col : (posInRow / Math.max(count - 1, 1)) * 4;

      const dupesAtCol = group.filter((g) => g.col === entry.col).length;
      const subIndex = colCounts.get(entry.col) ?? 0;
      colCounts.set(entry.col, subIndex + 1);
      const subOffset =
        dupesAtCol > 1 ? (subIndex - (dupesAtCol - 1) / 2) * 0.45 : 0;

      positions[entry.index] = {
        top: `${(row / 4) * 82 + 6}%`,
        left: `${(Math.min(4, Math.max(0, baseCol + subOffset)) / 4) * 88 + 6}%`,
      };
    });
  }

  return positions;
}

/** Orden visual en el campo: ataque arriba, portero abajo */
export function sortStartersForPitch<T extends { squadRole: string | null }>(
  starters: T[]
): T[] {
  return [...starters].sort((a, b) => {
    const sa = getFormationSlot(a.squadRole);
    const sb = getFormationSlot(b.squadRole);
    if (sa.row !== sb.row) return sa.row - sb.row;
    return sa.col - sb.col;
  });
}

export function shortPlayerName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return name;
  const last = parts[parts.length - 1];
  if (last.length <= 12) return last;
  return `${last.slice(0, 10)}…`;
}
