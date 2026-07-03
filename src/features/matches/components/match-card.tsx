import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MatchWithParticipants } from "@/types";

interface MatchCardProps {
  match: MatchWithParticipants;
  /** Si el torneo no viene en el match (p. ej. vista dentro del torneo) */
  tournament?: { id: string; name: string };
}

const statusVariant = {
  SCHEDULED: "outline" as const,
  LIVE: "success" as const,
  COMPLETED: "secondary" as const,
  CANCELLED: "destructive" as const,
  WALKOVER: "warning" as const,
};

const statusLabel = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  WALKOVER: "Walkover",
};

export function MatchCard({ match, tournament }: MatchCardProps) {
  const isCompleted = match.status === "COMPLETED";
  const t = tournament ?? match.tournament;

  return (
    <Card className="glass hover:border-primary/20 transition-all">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          {t ? (
            <Link
              href={`/tournaments/${t.id}`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {t.name}
            </Link>
          ) : (
            <span className="text-xs text-muted-foreground">Partido</span>
          )}
          <Badge variant={statusVariant[match.status]}>
            {statusLabel[match.status]}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-right">
            <p className="font-semibold truncate">
              {match.homeParticipant.user.nickname}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 font-mono text-lg font-bold">
            {isCompleted ? (
              <>
                <span>{match.homeScore}</span>
                <span className="text-muted-foreground">-</span>
                <span>{match.awayScore}</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">vs</span>
            )}
          </div>

          <div className="flex-1 text-left">
            <p className="font-semibold truncate">
              {match.awayParticipant.user.nickname}
            </p>
          </div>
        </div>

        {match.scheduledAt && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {formatDateTime(match.scheduledAt)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
