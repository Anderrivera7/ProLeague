import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MatchCard } from "@/features/matches/components/match-card";
import type { HeadToHeadStats } from "@/types";

interface Props {
  opponentNickname: string;
  stats: HeadToHeadStats | null;
  recentMatches: Parameters<typeof MatchCard>[0]["match"][];
}

export function HeadToHeadPanel({
  opponentNickname,
  stats,
  recentMatches,
}: Props) {
  if (!stats || stats.matchesPlayed === 0) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle className="text-base">
            Head to Head vs {opponentNickname}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No habéis jugado ningún partido juntos
        </CardContent>
      </Card>
    );
  }

  const winRate = ((stats.wins / stats.matchesPlayed) * 100).toFixed(0);

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <CardTitle className="text-base">
          Head to Head vs {opponentNickname}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-3 text-center">
          <div>
            <p className="text-2xl font-bold text-primary">{stats.wins}</p>
            <p className="text-xs text-muted-foreground">Victorias</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.draws}</p>
            <p className="text-xs text-muted-foreground">Empates</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-destructive">{stats.losses}</p>
            <p className="text-xs text-muted-foreground">Derrotas</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{winRate}%</p>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            {stats.goalsFor}-{stats.goalsAgainst} goles
          </Badge>
          <Badge variant="outline">
            Mayor goleada: +{stats.biggestWin}
          </Badge>
          <Badge variant="outline">
            Racha: {stats.currentStreak > 0 ? "+" : ""}
            {stats.currentStreak}
          </Badge>
        </div>

        {recentMatches.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Últimos enfrentamientos</p>
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
