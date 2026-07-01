import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TOURNAMENT_TYPES } from "@/constants";
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

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <Card className="glass hover:border-primary/30 hover:glow-primary transition-all cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base line-clamp-1">
              {tournament.name}
            </CardTitle>
            <Badge variant={statusVariant[tournament.status]}>
              {statusLabel[tournament.status]}
            </Badge>
          </div>
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
          <Badge variant="outline" className="text-xs">
            {typeInfo.label}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
