import { filterActiveSquad } from "./excluded-players";
import {
  getFormationSlot,
  inferFormationLabel,
  isStarterRole,
  layoutStarterPositions,
} from "./formation";

export interface LineupPlayer {
  id: string;
  eaId?: string;
  name: string;
  overall: number | null;
  potential?: number | null;
  squadRole: string | null;
  position: string | null;
  jerseyNumber: number | null;
  imageUrl: string | null;
  pace?: number | null;
  shooting?: number | null;
  passing?: number | null;
  dribbling?: number | null;
  defending?: number | null;
  physic?: number | null;
}

export interface AssignedLineupSlot {
  player: LineupPlayer;
  slotRole: string;
  row: number;
  col: number;
}

/** Titulares y posiciones tal cual vienen del CSV SoFIFA (`nation_position`). */
export function buildLineupFromCsv(players: LineupPlayer[]): AssignedLineupSlot[] {
  const starters = filterActiveSquad(players)
    .filter((p) => isStarterRole(p.squadRole))
    .sort((a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99));

  return starters.map((player) => {
    const role = player.squadRole!.toUpperCase();
    const slot = getFormationSlot(role);
    return {
      player,
      slotRole: role,
      row: slot.row,
      col: slot.col,
    };
  });
}

export function inferFormationFromCsv(players: LineupPlayer[]): string {
  const roles = filterActiveSquad(players)
    .filter((p) => isStarterRole(p.squadRole))
    .map((p) => p.squadRole!.toUpperCase());
  return inferFormationLabel(roles);
}

export function lineupPitchPositions(
  lineup: AssignedLineupSlot[]
): Array<{ top: string; left: string }> {
  return layoutStarterPositions(lineup.map((s) => ({ squadRole: s.slotRole })));
}

export function displayPosition(player: LineupPlayer): string {
  return player.squadRole ?? player.position?.split(",")[0]?.trim() ?? "—";
}
