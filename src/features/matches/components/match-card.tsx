"use client";

import Link from "next/link";
import { Calendar } from "lucide-react";
import { formatDateTime, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TeamCrest } from "@/components/shared/team-crest";
import type { MatchWithParticipants } from "@/types";
import { ClipboardEdit } from "lucide-react";

interface MatchCardProps {
  match: MatchWithParticipants;
  tournament?: { id: string; name: string };
  canReport?: boolean;
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

export function MatchCard({ match, tournament, canReport }: MatchCardProps) {
  const isCompleted = match.status === "COMPLETED";
  const t = tournament ?? match.tournament;
  const showReport = canReport && match.status === "SCHEDULED";

  const homeTeam = match.homeParticipant.fcTeam;
  const awayTeam = match.awayParticipant.fcTeam;
  const homeName = homeTeam?.name ?? match.homeParticipant.user.nickname;
  const awayName = awayTeam?.name ?? match.awayParticipant.user.nickname;

  return (
    <Card className="glass overflow-hidden transition-all hover:border-primary/20">
      <CardContent className="p-4">
        <div className="mb-4 flex items-center justify-between">
          {t ? (
            <Link
              href={`/tournaments/${t.id}`}
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
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

        <Link href={`/matches/${match.id}`} className="block">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 flex-col items-end gap-1.5">
              <Avatar className="h-9 w-9 border-2 border-border">
                <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                  {getInitials(match.homeParticipant.user.nickname)}
                </AvatarFallback>
              </Avatar>
              <p className="truncate text-sm font-semibold">
                {match.homeParticipant.user.nickname}
              </p>
              <div className="flex items-center gap-1">
                <TeamCrest
                  name={homeName}
                  crestUrl={homeTeam?.crestUrl}
                  fifaIndexId={homeTeam?.fifaIndexId ?? undefined}
                  size={18}
                />
                <span className="truncate text-[11px] text-muted-foreground">
                  {homeName}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-0.5">
              <div className="flex items-center gap-2 rounded-xl bg-muted px-5 py-2.5 font-mono text-2xl font-bold">
                {isCompleted ? (
                  <>
                    <span>{match.homeScore}</span>
                    <span className="text-lg text-muted-foreground">—</span>
                    <span>{match.awayScore}</span>
                  </>
                ) : (
                  <span className="text-base text-muted-foreground">vs</span>
                )}
              </div>
              {isCompleted && (
                <span className="text-[10px] text-muted-foreground">
                  Resultado final
                </span>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5">
              <Avatar className="h-9 w-9 border-2 border-border">
                <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                  {getInitials(match.awayParticipant.user.nickname)}
                </AvatarFallback>
              </Avatar>
              <p className="truncate text-sm font-semibold">
                {match.awayParticipant.user.nickname}
              </p>
              <div className="flex items-center gap-1">
                <TeamCrest
                  name={awayName}
                  crestUrl={awayTeam?.crestUrl}
                  fifaIndexId={awayTeam?.fifaIndexId ?? undefined}
                  size={18}
                />
                <span className="truncate text-[11px] text-muted-foreground">
                  {awayName}
                </span>
              </div>
            </div>
          </div>

          {match.playedAt && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateTime(match.playedAt)}
            </div>
          )}
          {match.scheduledAt && !match.playedAt && (
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {formatDateTime(match.scheduledAt)}
            </div>
          )}
        </Link>

        {showReport && (
          <div className="mt-3 flex justify-center">
            <Button size="sm" variant="outline" asChild>
              <Link href={`/matches/${match.id}?report=1`}>
                <ClipboardEdit className="mr-1 h-3.5 w-3.5" />
                Anotar resultado
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
