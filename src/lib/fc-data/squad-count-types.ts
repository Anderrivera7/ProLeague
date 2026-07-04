import {
  isReserveRole,
  isStarterRole,
  isSubstituteRole,
} from "./formation";

export interface SquadCounts {
  total: number;
  starters: number;
  substitutes: number;
  reserves: number;
}

export function countFromRoles(
  roles: Array<string | null | undefined>
): SquadCounts {
  let starters = 0;
  let substitutes = 0;
  let reserves = 0;

  for (const role of roles) {
    if (!role) continue;
    if (isSubstituteRole(role)) substitutes++;
    else if (isReserveRole(role)) reserves++;
    else if (isStarterRole(role)) starters++;
  }

  return {
    total: starters + substitutes + reserves,
    starters,
    substitutes,
    reserves,
  };
}

export function formatSquadCounts(counts: SquadCounts) {
  const parts: string[] = [];
  if (counts.starters > 0) parts.push(`${counts.starters} tit`);
  if (counts.substitutes > 0) parts.push(`${counts.substitutes} sup`);
  if (counts.reserves > 0) parts.push(`${counts.reserves} res`);
  return parts.join(" · ");
}
