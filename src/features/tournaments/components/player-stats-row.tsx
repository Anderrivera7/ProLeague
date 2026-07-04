"use client";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import { Badge } from "@/components/ui/badge";
import {
  GoalStat,
  RedCardStat,
  YellowCardStat,
} from "@/components/shared/match-stat-icons";

export interface PlayerWithStats {
  id: string;
  eaId: string;
  name: string;
  position: string | null;
  squadRole: string | null;
  jerseyNumber: number | null;
  overall: number | null;
  potential: number | null;
  imageUrl: string | null;
  pace: number | null;
  shooting: number | null;
  passing: number | null;
  dribbling: number | null;
  defending: number | null;
  physic: number | null;
}

interface PlayerStatsRowProps {
  player: PlayerWithStats;
  compact?: boolean;
  matchStats?: {
    goals: number;
    yellowCards: number;
    redCards: number;
  };
}

function StatPill({ label, value }: { label: string; value: number | null }) {
  if (value == null) return null;
  return (
    <div className="flex flex-col items-center rounded-md bg-muted/60 px-2 py-1 min-w-[38px]">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

export function PlayerStatsRow({ player, compact, matchStats }: PlayerStatsRowProps) {
  const isBench =
    player.squadRole === "SUB" || player.squadRole === "RES";

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/50 px-3 py-2.5">
      <PlayerAvatar
        eaId={player.eaId}
        name={player.name}
        imageUrl={player.imageUrl}
        size={44}
        fallback={player.jerseyNumber ?? "—"}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {player.jerseyNumber != null && (
            <span className="text-xs font-bold text-muted-foreground">
              #{player.jerseyNumber}
            </span>
          )}
          <p className="truncate text-sm font-semibold">{player.name}</p>
          {isBench && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
              {player.squadRole}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {player.squadRole ?? player.position ?? "—"}
          {!compact && player.potential != null && ` · POT ${player.potential}`}
        </p>
        {matchStats &&
          (matchStats.goals > 0 ||
            matchStats.yellowCards > 0 ||
            matchStats.redCards > 0) && (
            <div className="mt-1 flex flex-wrap gap-2">
              {matchStats.goals > 0 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  <GoalStat count={matchStats.goals} />
                </Badge>
              )}
              {matchStats.yellowCards > 0 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <YellowCardStat count={matchStats.yellowCards} />
                </Badge>
              )}
              {matchStats.redCards > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  <RedCardStat count={matchStats.redCards} />
                </Badge>
              )}
            </div>
          )}
      </div>

      <Badge className="shrink-0">{player.overall ?? "—"}</Badge>

      {!compact && (
        <div className="hidden gap-1 sm:flex">
          <StatPill label="PAC" value={player.pace} />
          <StatPill label="SHO" value={player.shooting} />
          <StatPill label="PAS" value={player.passing} />
          <StatPill label="DRI" value={player.dribbling} />
          <StatPill label="DEF" value={player.defending} />
          <StatPill label="PHY" value={player.physic} />
        </div>
      )}
    </div>
  );
}
