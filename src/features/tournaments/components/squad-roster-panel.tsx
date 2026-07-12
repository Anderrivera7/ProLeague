"use client";

import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { PlayerStatsRow } from "@/features/tournaments/components/player-stats-row";
import {
  buildLineupFromCsv,
  displayPosition,
  inferFormationFromCsv,
  lineupPitchPositions,
  type LineupPlayer,
} from "@/lib/fc-data/formation-assignment";
import { shortPlayerName } from "@/lib/fc-data/formation";
import type { TournamentFcPlayerStats } from "@/types/tournament-stats";
import { cn } from "@/lib/utils";

interface SquadRosterPanelProps {
  players: LineupPlayer[];
  teamEaId?: string | null;
  tournamentPlayerStats?: TournamentFcPlayerStats[];
  statsPanel?: React.ReactNode;
}

export function SquadRosterPanel({
  players,
  tournamentPlayerStats,
  statsPanel,
}: SquadRosterPanelProps) {
  const statsByPlayer = useMemo(
    () => new Map((tournamentPlayerStats ?? []).map((s) => [s.fcPlayerId, s])),
    [tournamentPlayerStats]
  );

  const lineup = useMemo(() => buildLineupFromCsv(players), [players]);
  const sortedLineup = useMemo(
    () =>
      [...lineup].sort(
        (a, b) =>
          (a.player.jerseyNumber ?? 99) - (b.player.jerseyNumber ?? 99)
      ),
    [lineup]
  );
  const positions = useMemo(() => lineupPitchPositions(lineup), [lineup]);
  const formationLabel = useMemo(
    () => inferFormationFromCsv(players),
    [players]
  );

  const lineupIds = useMemo(
    () => new Set(lineup.map((slot) => slot.player.id)),
    [lineup]
  );

  const benchPlayers = useMemo(() => {
    const rest = players.filter((p) => !lineupIds.has(p.id));
    return [...rest].sort((a, b) => (b.overall ?? 0) - (a.overall ?? 0));
  }, [players, lineupIds]);

  function matchStatsFor(playerId: string) {
    const ms = statsByPlayer.get(playerId);
    if (!ms) return undefined;
    return {
      goals: ms.goals,
      yellowCards: ms.yellowCards,
      redCards: ms.redCards,
    };
  }

  function roleForDisplay(player: LineupPlayer, slotRole?: string) {
    return slotRole ?? displayPosition(player);
  }

  return (
    <div className="space-y-6">
      <div className={cn("grid gap-6", statsPanel && "lg:grid-cols-2")}>
        {statsPanel}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Formación táctica</h3>
            <Badge variant="secondary">{formationLabel}</Badge>
          </div>

          <p className="text-[11px] text-muted-foreground">
            Titulares y posiciones según SoFIFA FC26 (`nation_position` del CSV).
          </p>

          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-900/50 via-emerald-800/30 to-emerald-950/60 shadow-inner">
            <div className="absolute inset-3 rounded-xl border border-white/15" />
            <div className="absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/15" />
            <div className="absolute left-1/2 top-3 bottom-3 w-px -translate-x-1/2 bg-white/15" />
            <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15" />

            {lineup.map((slot, index) => {
              const pos = positions[index];
              const label = roleForDisplay(slot.player, slot.slotRole);
              return (
                <div
                  key={slot.player.id}
                  className="absolute z-10 flex w-[17%] min-w-[54px] max-w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5"
                  style={{ top: pos.top, left: pos.left, zIndex: 10 + index }}
                >
                  <PlayerAvatar
                    eaId={slot.player.eaId ?? slot.player.id}
                    name={slot.player.name}
                    imageUrl={slot.player.imageUrl}
                    size={44}
                    className="border-2 border-emerald-400/70 shadow-lg ring-1 ring-black/40"
                    fallback={slot.player.jerseyNumber ?? "—"}
                  />
                  <div className="w-full rounded-md bg-black/75 px-1 py-0.5 text-center backdrop-blur-sm">
                    <p className="truncate text-[9px] font-semibold leading-tight text-white">
                      {shortPlayerName(slot.player.name)}
                    </p>
                    <p className="text-[8px] font-medium leading-tight text-emerald-300">
                      {slot.player.overall ?? "—"} · {label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass border-emerald-500/10">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              Titulares
              <Badge variant="secondary">{lineup.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {sortedLineup.map((slot) => (
              <PlayerStatsRow
                key={slot.player.id}
                overallOnly
                player={{
                  ...slot.player,
                  eaId: slot.player.eaId ?? slot.player.id,
                  potential: slot.player.potential ?? null,
                  squadRole: roleForDisplay(slot.player, slot.slotRole),
                }}
                matchStats={matchStatsFor(slot.player.id)}
              />
            ))}
          </CardContent>
        </Card>

        <Card className="glass border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              Suplentes
              <Badge variant="outline">{benchPlayers.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {benchPlayers.map((player) => (
              <PlayerStatsRow
                key={player.id}
                overallOnly
                compact
                player={{
                  ...player,
                  eaId: player.eaId ?? player.id,
                  potential: player.potential ?? null,
                }}
                matchStats={matchStatsFor(player.id)}
              />
            ))}
            {benchPlayers.length === 0 && (
              <p className="text-sm text-muted-foreground">Sin suplentes.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
