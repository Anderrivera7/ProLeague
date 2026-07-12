"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import {
  buildLineupFromCsv,
  inferFormationFromCsv,
  lineupPitchPositions,
  type LineupPlayer,
} from "@/lib/fc-data/formation-assignment";
import { shortPlayerName } from "@/lib/fc-data/formation";

export type { LineupPlayer as SquadPlayer };

interface SquadFormationPitchProps {
  players: LineupPlayer[];
  teamEaId?: string | null;
}

export function SquadFormationPitch({ players }: SquadFormationPitchProps) {
  const lineup = useMemo(() => buildLineupFromCsv(players), [players]);
  const positions = useMemo(() => lineupPitchPositions(lineup), [lineup]);
  const formationLabel = useMemo(
    () => inferFormationFromCsv(players),
    [players]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Formación táctica</h3>
        <Badge variant="secondary">{formationLabel}</Badge>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Posiciones según SoFIFA FC26 (`nation_position` del CSV).
      </p>

      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-emerald-950/40 via-emerald-900/20 to-emerald-950/50">
        <div className="absolute inset-4 rounded-xl border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />

        {lineup.map((slot, index) => {
          const pos = positions[index];
          return (
            <div
              key={slot.player.id}
              className="absolute z-10 flex w-[18%] min-w-[52px] max-w-[68px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ top: pos.top, left: pos.left, zIndex: 10 + index }}
            >
              <PlayerAvatar
                eaId={slot.player.eaId ?? slot.player.id}
                name={slot.player.name}
                imageUrl={slot.player.imageUrl}
                size={40}
                className="border-2 border-primary/60 shadow-lg"
                fallback={slot.player.jerseyNumber ?? "—"}
              />
              <div className="w-full rounded-md bg-black/70 px-1 py-0.5 text-center backdrop-blur-sm">
                <p className="truncate text-[9px] font-semibold leading-tight text-white">
                  {shortPlayerName(slot.player.name)}
                </p>
                <p className="text-[8px] leading-tight text-primary">
                  {slot.player.overall ?? "—"} · {slot.slotRole}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
