"use client";

import { GiSoccerBall } from "react-icons/gi";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerLeaderRow } from "@/components/shared/player-leader-row";
import type { EnrichedPlayerStat } from "@/types/match-stats";

export type { EnrichedPlayerStat };

interface MatchEventsSummaryProps {
  playerStats: EnrichedPlayerStat[];
  mvpNickname?: string | null;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
}

function sortBy<T extends EnrichedPlayerStat>(
  items: T[],
  getValue: (item: T) => number
): T[] {
  return [...items].sort((a, b) => getValue(b) - getValue(a));
}

export function MatchEventsSummary({
  playerStats,
  mvpNickname,
  penaltiesHome,
  penaltiesAway,
}: MatchEventsSummaryProps) {
  const hasPenalties =
    penaltiesHome != null &&
    penaltiesAway != null &&
    (penaltiesHome > 0 || penaltiesAway > 0);

  const scorers = sortBy(
    playerStats.filter((p) => p.goals > 0),
    (p) => p.goals
  );
  const yellows = sortBy(
    playerStats.filter((p) => p.yellowCards > 0),
    (p) => p.yellowCards
  );
  const reds = sortBy(
    playerStats.filter((p) => p.redCards > 0),
    (p) => p.redCards
  );

  if (
    scorers.length === 0 &&
    yellows.length === 0 &&
    reds.length === 0 &&
    !mvpNickname &&
    !hasPenalties
  ) {
    return null;
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="text-base">Detalle del partido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {hasPenalties && (
          <p className="text-center text-sm text-muted-foreground">
            Penales: {penaltiesHome} — {penaltiesAway}
          </p>
        )}

        {mvpNickname && (
          <div className="flex justify-center">
            <Badge variant="secondary">
              MVP: {mvpNickname} (+1 pt ranking global)
            </Badge>
          </div>
        )}

        {scorers.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Goleadores</p>
            <div className="space-y-2">
              {scorers.map((s) => (
                <PlayerLeaderRow
                  key={`goal-${s.playerName}-${s.nickname}`}
                  rank={0}
                  showRank={false}
                  playerName={s.playerName}
                  playerImageUrl={s.playerImageUrl}
                  playerEaId={s.playerEaId}
                  teamName={s.teamName}
                  teamCrestUrl={s.teamCrestUrl}
                  teamFifaIndexId={s.teamFifaIndexId}
                  nickname={s.nickname}
                  stat={
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-1">
                        <GiSoccerBall className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xl font-black tabular-nums text-foreground">
                          {s.goals}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Goles
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {yellows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Tarjetas amarillas</p>
            <div className="space-y-2">
              {yellows.map((s) => (
                <PlayerLeaderRow
                  key={`yellow-${s.playerName}-${s.nickname}`}
                  rank={0}
                  showRank={false}
                  playerName={s.playerName}
                  playerImageUrl={s.playerImageUrl}
                  playerEaId={s.playerEaId}
                  teamName={s.teamName}
                  teamCrestUrl={s.teamCrestUrl}
                  teamFifaIndexId={s.teamFifaIndexId}
                  nickname={s.nickname}
                  stat={
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-3 rounded-sm bg-yellow-400 shadow-sm" />
                        <span className="text-sm font-bold">
                          {s.yellowCards}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Amarillas
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}

        {reds.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Tarjetas rojas</p>
            <div className="space-y-2">
              {reds.map((s) => (
                <PlayerLeaderRow
                  key={`red-${s.playerName}-${s.nickname}`}
                  rank={0}
                  showRank={false}
                  playerName={s.playerName}
                  playerImageUrl={s.playerImageUrl}
                  playerEaId={s.playerEaId}
                  teamName={s.teamName}
                  teamCrestUrl={s.teamCrestUrl}
                  teamFifaIndexId={s.teamFifaIndexId}
                  nickname={s.nickname}
                  stat={
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-4 w-3 rounded-sm bg-red-600 shadow-sm" />
                        <span className="text-sm font-bold">{s.redCards}</span>
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Rojas
                      </span>
                    </div>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
