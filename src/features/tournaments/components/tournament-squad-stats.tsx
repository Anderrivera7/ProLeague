"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  GoalStat,
  RedCardStat,
  YellowCardStat,
} from "@/components/shared/match-stat-icons";
import { resolvePlayerImageUrl } from "@/lib/fc-data/player-image";
import { cn } from "@/lib/utils";
import type { TournamentFcPlayerStats } from "@/types/tournament-stats";

interface TournamentSquadStatsProps {
  stats: TournamentFcPlayerStats[];
}

function StatRankingRow({
  rank,
  name,
  imageUrl,
  eaId,
  stat,
}: {
  rank: number;
  name: string;
  imageUrl?: string | null;
  eaId?: string | null;
  stat: React.ReactNode;
}) {
  const portrait =
    eaId != null ? resolvePlayerImageUrl(eaId, imageUrl) : null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5">
      <span className="w-5 shrink-0 text-xs font-bold text-muted-foreground">
        {rank}
      </span>
      <Avatar className="h-10 w-10 border border-border">
        {portrait ? (
          <AvatarImage src={portrait} alt={name} referrerPolicy="no-referrer" />
        ) : null}
        <AvatarFallback className="text-xs">
          {name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</p>
      <div className="shrink-0">{stat}</div>
    </div>
  );
}

function RankingSection({
  title,
  items,
  renderStat,
}: {
  title: string;
  items: TournamentFcPlayerStats[];
  renderStat: (item: TournamentFcPlayerStats) => React.ReactNode;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{title}</p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <StatRankingRow
            key={item.fcPlayerId}
            rank={index + 1}
            name={item.fcPlayer?.name ?? "Jugador"}
            imageUrl={item.fcPlayer?.imageUrl}
            eaId={item.fcPlayer?.fifaIndexId}
            stat={renderStat(item)}
          />
        ))}
      </div>
    </div>
  );
}

export function TournamentSquadStats({ stats }: TournamentSquadStatsProps) {
  const hasStats = stats.some(
    (s) => s.goals > 0 || s.yellowCards > 0 || s.redCards > 0
  );

  if (!hasStats) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">Estadísticas del torneo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Aún no hay goles ni tarjetas registrados en este torneo.
        </CardContent>
      </Card>
    );
  }

  const scorers = [...stats]
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals);
  const yellows = [...stats]
    .filter((s) => s.yellowCards > 0)
    .sort((a, b) => b.yellowCards - a.yellowCards);
  const reds = [...stats]
    .filter((s) => s.redCards > 0)
    .sort((a, b) => b.redCards - a.redCards);

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">Estadísticas del torneo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <RankingSection
          title="Goleadores"
          items={scorers}
          renderStat={(s) => (
            <div className="flex flex-col items-end">
              <GoalStat count={s.goals} />
              <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                Goles
              </span>
            </div>
          )}
        />
        {(yellows.length > 0 || reds.length > 0) && (
          <div className="space-y-4">
            <RankingSection
              title="Tarjetas amarillas"
              items={yellows}
              renderStat={(s) => (
                <div className="flex flex-col items-end">
                  <YellowCardStat count={s.yellowCards} />
                  <span
                    className={cn(
                      "text-[9px] font-semibold uppercase tracking-wider text-muted-foreground"
                    )}
                  >
                    Amarillas
                  </span>
                </div>
              )}
            />
            <RankingSection
              title="Tarjetas rojas"
              items={reds}
              renderStat={(s) => (
                <div className="flex flex-col items-end">
                  <RedCardStat count={s.redCards} />
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rojas
                  </span>
                </div>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
