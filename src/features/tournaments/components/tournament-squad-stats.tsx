import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TournamentFcPlayerStats } from "@/types/tournament-stats";

interface TournamentSquadStatsProps {
  stats: TournamentFcPlayerStats[];
}

function RankingList({
  title,
  items,
  valueKey,
  emoji,
}: {
  title: string;
  items: TournamentFcPlayerStats[];
  valueKey: "goals" | "yellowCards" | "redCards";
  emoji: string;
}) {
  const ranked = items
    .filter((s) => s[valueKey] > 0)
    .sort((a, b) => b[valueKey] - a[valueKey]);

  if (ranked.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {ranked.map((s, i) => (
        <div
          key={s.fcPlayerId}
          className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
        >
          <span className="truncate">
            <span className="text-muted-foreground mr-2">{i + 1}.</span>
            {s.fcPlayer?.name ?? "Jugador"}
          </span>
          <Badge variant="outline">
            {emoji} {s[valueKey]}
          </Badge>
        </div>
      ))}
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

  const carded = stats.filter((s) => s.yellowCards > 0 || s.redCards > 0);

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">Estadísticas del torneo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <RankingList
          title="Goleadores"
          items={stats}
          valueKey="goals"
          emoji="⚽"
        />
        {carded.length > 0 && (
          <div className="space-y-4">
            <RankingList
              title="Tarjetas amarillas"
              items={stats}
              valueKey="yellowCards"
              emoji="🟨"
            />
            <RankingList
              title="Tarjetas rojas"
              items={stats}
              valueKey="redCards"
              emoji="🟥"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
