import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBiggestWin, positiveStreak } from "@/utils/match-stats";
import { formatDateTime } from "@/lib/utils";
import type { HeadToHeadStats } from "@/types";

interface H2HMatch {
  id: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  playedAt?: Date | null;
  scheduledAt?: Date | null;
  homeParticipant: { user: { nickname: string } };
  awayParticipant: { user: { nickname: string } };
}

interface Props {
  opponentNickname: string;
  stats: HeadToHeadStats | null;
  recentMatches: H2HMatch[];
}

function H2HMatchRow({ match }: { match: H2HMatch }) {
  const isCompleted = match.status === "COMPLETED";
  const date = match.playedAt ?? match.scheduledAt;

  return (
    <Link
      href={`/matches/${match.id}`}
      className="block rounded-lg border border-border px-3 py-2 transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="truncate font-medium">
          {match.homeParticipant.user.nickname}
        </span>
        <span className="shrink-0 rounded-md bg-muted px-3 py-1 font-mono font-bold">
          {isCompleted ? (
            <>
              {match.homeScore} — {match.awayScore}
            </>
          ) : (
            "vs"
          )}
        </span>
        <span className="truncate text-right font-medium">
          {match.awayParticipant.user.nickname}
        </span>
      </div>
      {date && (
        <p className="mt-1 text-center text-xs text-muted-foreground">
          {formatDateTime(date)}
        </p>
      )}
    </Link>
  );
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
            Historial vs {opponentNickname}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No habéis jugado ningún partido juntos
        </CardContent>
      </Card>
    );
  }

  const winRate = ((stats.wins / stats.matchesPlayed) * 100).toFixed(0);
  const streak = positiveStreak(stats.currentStreak);
  const biggestWinLabel =
    stats.biggestWinFor > 0
      ? formatBiggestWin(
          stats.biggestWinFor,
          stats.biggestWinAgainst,
          opponentNickname
        )
      : stats.biggestWin > 0
        ? `+${stats.biggestWin} vs ${opponentNickname}`
        : null;

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
          {biggestWinLabel && (
            <Badge variant="outline">Mayor goleada: {biggestWinLabel}</Badge>
          )}
          {streak > 0 && (
            <Badge variant="outline">Racha: +{streak}</Badge>
          )}
        </div>

        {recentMatches.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Últimos enfrentamientos</p>
            {recentMatches.map((match) => (
              <H2HMatchRow key={match.id} match={match} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
