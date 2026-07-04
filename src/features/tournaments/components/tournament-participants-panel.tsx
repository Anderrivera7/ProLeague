"use client";

import Link from "next/link";
import { UserPlus, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TeamCrest } from "@/components/shared/team-crest";
import { getInitials } from "@/lib/utils";

interface Participant {
  id: string;
  userId: string;
  nickname: string;
  elo: number;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  fcTeamId?: string | null;
}

interface TournamentParticipantsPanelProps {
  participants: Participant[];
  maxParticipants: number;
  tournamentId: string;
  currentUserId?: string;
  isCreator?: boolean;
  isViewerInTournament?: boolean;
  joinCode?: string | null;
}

export function TournamentParticipantsPanel({
  participants,
  maxParticipants,
  tournamentId,
  currentUserId,
  isCreator,
  isViewerInTournament,
  joinCode,
}: TournamentParticipantsPanelProps) {
  const emptySlots = Math.max(0, maxParticipants - participants.length);

  return (
    <Card className="glass h-full">
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div>
          <CardTitle className="text-base">
            Participantes ({participants.length}/{maxParticipants})
          </CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Invita jugadores para completar el torneo
          </p>
        </div>
        {isCreator && joinCode && (
          <Button variant="outline" size="sm" className="shrink-0" asChild>
            <Link href={`/tournaments/join?code=${joinCode}`}>
              <UserPlus className="mr-1 h-3.5 w-3.5" />
              Invitar jugadores
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {participants.map((p) => {
          const isMe = p.userId === currentUserId;
          const canViewSquad =
            !!p.fcTeamId && (isMe || isCreator || isViewerInTournament);
          const href = canViewSquad
            ? isMe
              ? `/tournaments/${tournamentId}/my-team`
              : `/tournaments/${tournamentId}/squads/${p.fcTeamId}`
            : `/players/${p.userId}`;

          return (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 px-3 py-2.5"
            >
              {p.fcTeamId ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <TeamCrest
                    name={p.teamName ?? p.nickname}
                    crestUrl={p.teamCrestUrl}
                    fifaIndexId={p.teamFifaIndexId ?? undefined}
                    size={28}
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {getInitials(p.nickname)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {p.nickname}
                  {isMe && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (tú)
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {p.teamName ?? "Sin equipo"} · Puntos {p.elo}
                </p>
              </div>
              {canViewSquad && (
                <Button variant="ghost" size="sm" className="shrink-0 text-primary" asChild>
                  <Link href={href}>Ver plantilla</Link>
                </Button>
              )}
            </div>
          );
        })}

        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 px-3 py-2.5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Esperando jugador</p>
              <p className="text-xs text-muted-foreground/70">
                Invita a un jugador
              </p>
            </div>
            {isCreator && joinCode && (
              <Button variant="outline" size="sm" className="shrink-0" asChild>
                <Link href={`/tournaments/join?code=${joinCode}`}>Invitar</Link>
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
