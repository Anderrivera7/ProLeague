import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LeagueCover } from "@/components/shared/league-cover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOURNAMENT_TYPES } from "@/constants";
import { getLeagueCoverUrl } from "@/lib/fc-data/club-ids";
import { formatDate } from "@/lib/utils";
import type { TournamentWithDetails } from "@/types";

interface TournamentCardProps {
  tournament: TournamentWithDetails;
}

const statusVariant = {
  DRAFT: "outline" as const,
  REGISTRATION: "warning" as const,
  ACTIVE: "success" as const,
  COMPLETED: "secondary" as const,
  CANCELLED: "destructive" as const,
};

const statusLabel = {
  DRAFT: "Borrador",
  REGISTRATION: "Inscripción",
  ACTIVE: "Activo",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const typeInfo = TOURNAMENT_TYPES[tournament.type];
  const coverUrl = tournament.fcLeague
    ? getLeagueCoverUrl(tournament.fcLeague.fifaIndexId, tournament.fcLeague.name)
    : null;

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <Card className="glass hover:border-primary/30 hover:glow-primary transition-all cursor-pointer h-full overflow-hidden">
        <div className="relative h-28">
          <LeagueCover
            coverUrl={coverUrl}
            alt={tournament.fcLeague?.name ?? tournament.name}
            overlayClassName="from-background via-background/60 to-background/20"
          />
          {!coverUrl && (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-muted to-background" />
          )}
          <div className="absolute right-3 top-3">
            <Badge variant={statusVariant[tournament.status]}>
              {statusLabel[tournament.status]}
            </Badge>
          </div>
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-base line-clamp-1">
            {tournament.name}
          </CardTitle>
          {tournament.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {tournament.description}
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {tournament._count.participants}/{tournament.maxParticipants}
            </span>
            {tournament.startDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(tournament.startDate)}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs">
              {typeInfo.label}
            </Badge>
            {tournament.fcLeague && (
              <Badge variant="secondary" className="text-xs">
                {tournament.fcLeague.name}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
