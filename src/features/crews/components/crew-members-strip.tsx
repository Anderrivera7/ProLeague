"use client";

import Link from "next/link";
import { Scale, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TeamCrest } from "@/components/shared/team-crest";
import { cn, getInitials } from "@/lib/utils";

export type CrewMemberRow = {
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  elo: number;
  titlesWon?: number;
  isOwner?: boolean;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  fcTeamId?: string | null;
  tournamentId?: string | null;
};

/** Misma fila visual que en torneos: escudo · equipo · puntos · Ver plantilla. */
export function CrewMembersStrip({
  currentUserId,
  members,
}: {
  currentUserId: string;
  members: CrewMemberRow[];
}) {
  if (members.length === 0) return null;

  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-[#0b0b0b] p-3.5 sm:rounded-3xl sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary/85">
            Plantilla
          </p>
          <h2 className="text-base font-semibold">Miembros del grupo</h2>
        </div>
        <Badge variant="outline" className="rounded-full text-[10px]">
          {members.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {members.map((m) => {
          const isYou = m.userId === currentUserId;
          const canViewSquad = Boolean(m.fcTeamId && m.tournamentId);
          const squadHref = canViewSquad
            ? isYou
              ? `/tournaments/${m.tournamentId}/my-team`
              : `/tournaments/${m.tournamentId}/squads/${m.fcTeamId}`
            : `/players/${m.userId}`;

          return (
            <div
              key={m.userId}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                isYou
                  ? "border-primary/35 bg-primary/10"
                  : "border-border/60 bg-card/40"
              )}
            >
              {m.teamCrestUrl || m.teamFifaIndexId || m.teamName ? (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <TeamCrest
                    name={m.teamName ?? m.nickname}
                    crestUrl={m.teamCrestUrl}
                    fifaIndexId={m.teamFifaIndexId ?? undefined}
                    size={28}
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {getInitials(m.nickname)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {m.nickname}
                  {isYou && (
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      (tú)
                    </span>
                  )}
                  {m.isOwner && (
                    <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                      · Creador
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {m.teamName ?? "Sin equipo"} · Puntos {m.elo}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {!isYou && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden h-8 px-2 text-muted-foreground sm:inline-flex"
                    asChild
                  >
                    <Link
                      href={`/players/compare?a=${currentUserId}&b=${m.userId}`}
                      aria-label="Comparar"
                    >
                      <Scale className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-primary"
                  asChild
                >
                  <Link href={squadHref}>
                    {canViewSquad ? "Ver plantilla" : "Ver perfil"}
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}

        {members.length < 2 && (
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/10 px-3 py-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground">Esperando amigo</p>
              <p className="text-xs text-muted-foreground/70">
                Comparte el código de invitación
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
