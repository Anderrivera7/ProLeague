import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FcPlayerStat {
  fcPlayer: { name: string };
  goals: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
}

interface MatchEventsSummaryProps {
  playerStats: FcPlayerStat[];
  mvpNickname?: string | null;
  penaltiesHome?: number | null;
  penaltiesAway?: number | null;
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

  const scorers = playerStats.filter((p) => p.goals > 0);
  const yellows = playerStats.filter((p) => p.yellowCards > 0);
  const reds = playerStats.filter((p) => p.redCards > 0);

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
      <CardContent className="space-y-4">
        {hasPenalties && (
          <p className="text-sm text-muted-foreground text-center">
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
            <p className="text-sm font-medium">Goleadores</p>
            {scorers.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span className="font-medium">{s.fcPlayer.name}</span>
                <Badge variant="outline">⚽ {s.goals}</Badge>
              </div>
            ))}
          </div>
        )}

        {yellows.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tarjetas amarillas</p>
            {yellows.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{s.fcPlayer.name}</span>
                <Badge variant="outline">🟨 {s.yellowCards}</Badge>
              </div>
            ))}
          </div>
        )}

        {reds.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Tarjetas rojas</p>
            {reds.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
              >
                <span>{s.fcPlayer.name}</span>
                <Badge variant="outline">🟥 {s.redCards}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
