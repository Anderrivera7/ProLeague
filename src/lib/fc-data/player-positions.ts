const BENCH_ROLES = new Set(["SUB", "RES"]);

const LEFT_ROLES = new Set([
  "LB", "LWB", "LCB", "LM", "LDM", "LCM", "LAM", "LW", "LF", "LS",
]);
const RIGHT_ROLES = new Set([
  "RB", "RWB", "RCB", "RM", "RDM", "RCM", "RAM", "RW", "RF", "RS",
]);
const CENTER_ROLES = new Set(["GK", "CB", "CDM", "CM", "CAM", "CF", "ST"]);

/** Roles compatibles (ej. LB puede cubrir LWB). */
const ROLE_ALIASES: Record<string, string[]> = {
  LB: ["LWB"],
  RB: ["RWB"],
  LWB: ["LB"],
  RWB: ["RB"],
  LCB: ["CB"],
  RCB: ["CB"],
  CB: ["LCB", "RCB"],
  LCM: ["CM", "LDM"],
  RCM: ["CM", "RDM"],
  CM: ["LCM", "RCM", "CDM"],
  CDM: ["LDM", "RDM", "CM"],
  CAM: ["LAM", "RAM"],
  ST: ["CF", "LS", "RS"],
  CF: ["ST"],
  LW: ["LM", "LF"],
  RW: ["RM", "RF"],
};

export function parseNaturalPositions(position: string | null | undefined): string[] {
  if (!position) return [];
  return position
    .split(",")
    .map((p) => p.trim().toUpperCase())
    .filter(Boolean);
}

export function isBenchRole(role: string | null | undefined): boolean {
  return !!role && BENCH_ROLES.has(role.toUpperCase());
}

/** Posiciones naturales del CSV; ignora squadRole si es banquillo. */
export function getNaturalPositions(
  position: string | null | undefined,
  squadRole?: string | null
): string[] {
  const fromCsv = parseNaturalPositions(position);
  if (fromCsv.length > 0) return fromCsv;

  const role = squadRole?.toUpperCase();
  if (role && !isBenchRole(role)) return [role];
  return [];
}

export function roleSide(role: string): "left" | "right" | "center" {
  const r = role.toUpperCase();
  if (LEFT_ROLES.has(r)) return "left";
  if (RIGHT_ROLES.has(r)) return "right";
  return "center";
}

function rolesCompatible(natural: string, slot: string): boolean {
  const n = natural.toUpperCase();
  const s = slot.toUpperCase();
  if (n === s) return true;
  return ROLE_ALIASES[n]?.includes(s) ?? ROLE_ALIASES[s]?.includes(n) ?? false;
}

export function positionFitScore(
  naturalPositions: string[],
  slotRole: string,
  overall: number | null,
  nationRole?: string | null
): number {
  const slot = slotRole.toUpperCase();
  const slotLine = lineForRole(slot);
  const slotSide = roleSide(slot);

  if (nationRole?.toUpperCase() === slot) {
    return 1100 + (overall ?? 0);
  }

  for (const pos of naturalPositions) {
    if (pos === slot) return 1000 + (overall ?? 0);
    if (rolesCompatible(pos, slot)) {
      return 900 + (overall ?? 0);
    }
  }

  const sameLine = naturalPositions.filter(
    (p) => lineForRole(p) === slotLine && slotLine !== "gk"
  );

  if (sameLine.length === 0) return 0;

  for (const pos of sameLine) {
    const posSide = roleSide(pos);
    if (slotSide === "center" || posSide === slotSide || posSide === "center") {
      return 500 + (overall ?? 0);
    }
  }

  return 0;
}

const GK = new Set(["GK"]);
const DEF = new Set(["LB", "LCB", "CB", "RCB", "RB", "LWB", "RWB", "SW"]);
const ATT = new Set(["LW", "RW", "LF", "CF", "RF", "ST", "LS", "RS"]);
const MID = new Set([
  "LDM", "CDM", "RDM", "LCM", "CM", "RCM", "LM", "RM", "LAM", "CAM", "RAM",
]);

export function lineForRole(role: string): "gk" | "def" | "mid" | "att" {
  const r = role.toUpperCase();
  if (GK.has(r)) return "gk";
  if (DEF.has(r)) return "def";
  if (ATT.has(r)) return "att";
  if (MID.has(r)) return "mid";
  return "mid";
}

/** Orden de asignación: bandas y GK antes que centrales. */
export const SLOT_ASSIGN_PRIORITY: Record<string, number> = {
  GK: 0,
  LB: 1,
  RB: 2,
  LWB: 3,
  RWB: 4,
  LW: 5,
  RW: 6,
  LCB: 10,
  RCB: 11,
  CB: 12,
  LDM: 20,
  RDM: 21,
  CDM: 22,
  LM: 23,
  RM: 24,
  LCM: 25,
  RCM: 26,
  CM: 27,
  LAM: 30,
  CAM: 31,
  RAM: 32,
  LF: 40,
  RF: 41,
  CF: 42,
  LS: 43,
  RS: 44,
  ST: 45,
};

export function primaryNaturalPosition(
  position: string | null | undefined,
  squadRole?: string | null
): string | null {
  const natural = getNaturalPositions(position, squadRole);
  if (natural.length === 0) return null;
  if (squadRole && !isBenchRole(squadRole) && natural.includes(squadRole.toUpperCase())) {
    return squadRole.toUpperCase();
  }
  return natural[0];
}
