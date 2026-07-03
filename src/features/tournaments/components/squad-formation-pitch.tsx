"use client";

import { Badge } from "@/components/ui/badge";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { getFormationSlot, inferFormationLabel, isStarterRole } from "@/lib/fc-data/formation";

export interface SquadPlayer {
  id: string;
  eaId?: string;
  name: string;
  overall: number | null;
  squadRole: string | null;
  jerseyNumber: number | null;
  imageUrl: string | null;
}

interface SquadFormationPitchProps {
  players: SquadPlayer[];
}

export function SquadFormationPitch({ players }: SquadFormationPitchProps) {
  const starters = players.filter((p) => isStarterRole(p.squadRole));
  const formation = inferFormationLabel(
    starters.map((p) => p.squadRole?.toUpperCase() ?? "CM")
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Formación inicial</h3>
        <Badge variant="secondary">{formation}</Badge>
      </div>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-b from-emerald-950/40 via-emerald-900/20 to-emerald-950/50">
        <div className="absolute inset-4 rounded-xl border border-white/10" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/10" />

        {starters.map((player) => {
          const slot = getFormationSlot(player.squadRole);
          const top = `${(slot.row / 4) * 82 + 6}%`;
          const left = `${(slot.col / 4) * 88 + 6}%`;

          return (
            <div
              key={player.id}
              className="absolute flex w-[18%] min-w-[52px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ top, left }}
            >
              <PlayerAvatar
                eaId={player.eaId ?? player.id}
                name={player.name}
                imageUrl={player.imageUrl}
                size={40}
                className="border-2 border-primary/60 shadow-lg"
                fallback={player.jerseyNumber ?? "—"}
              />
              <div className="rounded-md bg-black/60 px-1.5 py-0.5 text-center backdrop-blur-sm">
                <p className="max-w-[72px] truncate text-[9px] font-semibold text-white">
                  {player.name}
                </p>
                <p className="text-[9px] text-primary">
                  {player.overall ?? "—"} · {player.squadRole}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
