"use client";

import { useState } from "react";
import { GiSoccerBall } from "react-icons/gi";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCrest } from "@/components/shared/team-crest";
import { PlayerLeaderRow } from "@/components/shared/player-leader-row";
import { cn } from "@/lib/utils";

type Tab = "standings" | "scorers" | "cards";

interface StandingRow {
  id: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  points: number;
  nickname: string;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
}

interface ScorerRow {
  rank: number;
  playerName: string;
  nickname: string;
  goals: number;
  playerImageUrl?: string | null;
  playerEaId?: string | null;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
}

interface CardRow {
  rank: number;
  playerName: string;
  nickname: string;
  yellowCards: number;
  redCards: number;
  playerImageUrl?: string | null;
  playerEaId?: string | null;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
}

interface TournamentStatsPanelProps {
  standings: StandingRow[];
  scorers: ScorerRow[];
  cards: CardRow[];
}

const tabs: { id: Tab; label: string }[] = [
  { id: "standings", label: "Tabla" },
  { id: "scorers", label: "Goleadores" },
  { id: "cards", label: "Tarjetas" },
];

function TeamGamertagCell({
  teamName,
  teamCrestUrl,
  teamFifaIndexId,
  nickname,
  compact,
}: {
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  nickname: string;
  compact?: boolean;
}) {
  const label = teamName ?? "Sin equipo";
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5">
        <TeamCrest
          name={label}
          crestUrl={teamCrestUrl}
          fifaIndexId={teamFifaIndexId ?? undefined}
          size={compact ? 18 : 22}
          className="shrink-0"
        />
        <p
          className={cn(
            "truncate font-semibold text-foreground",
            compact ? "text-xs" : "text-sm"
          )}
        >
          {label}
        </p>
      </div>
      <p className="truncate text-[11px] text-muted-foreground">@{nickname}</p>
    </div>
  );
}

export function TournamentStatsPanel({
  standings,
  scorers,
  cards,
}: TournamentStatsPanelProps) {
  const [active, setActive] = useState<Tab>("standings");

  return (
    <Card className="glass lg:col-span-1 overflow-hidden">
      <CardContent className="flex p-0">
        <div className="flex shrink-0 flex-col border-r border-border bg-muted/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "px-3 py-4 text-[11px] font-medium leading-tight transition-colors",
                "border-l-2 border-transparent hover:bg-muted/40",
                active === tab.id &&
                  "border-l-primary bg-primary/10 text-primary"
              )}
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4">
          {active === "standings" && (
            <div className="space-y-2 text-sm">
              <p className="text-base font-semibold mb-3">Tabla de posiciones</p>
              {standings.length > 0 ? (
                <>
                  <div className="grid grid-cols-[minmax(0,1fr)_repeat(5,2rem)] gap-1 text-[10px] uppercase tracking-wide text-muted-foreground font-medium pb-2 border-b border-border">
                    <span>Equipo</span>
                    <span className="text-center">PJ</span>
                    <span className="text-center">G</span>
                    <span className="text-center">E</span>
                    <span className="text-center">P</span>
                    <span className="text-center">Pts</span>
                  </div>
                  {standings.map((s, i) => (
                    <div
                      key={s.id}
                      className={cn(
                        "grid grid-cols-[minmax(0,1fr)_repeat(5,2rem)] gap-1 items-center rounded-lg py-2 px-1",
                        i === 0 && "bg-primary/5 border border-primary/20"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-4 shrink-0 text-xs font-bold text-muted-foreground">
                          {i + 1}
                        </span>
                        <TeamGamertagCell
                          teamName={s.teamName}
                          teamCrestUrl={s.teamCrestUrl}
                          teamFifaIndexId={s.teamFifaIndexId}
                          nickname={s.nickname}
                          compact
                        />
                      </div>
                      <span className="text-center text-xs">{s.played}</span>
                      <span className="text-center text-xs">{s.won}</span>
                      <span className="text-center text-xs">{s.drawn}</span>
                      <span className="text-center text-xs">{s.lost}</span>
                      <span className="text-center text-sm font-bold text-primary">
                        {s.points}
                      </span>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Sin datos de tabla aún
                </p>
              )}
            </div>
          )}

          {active === "scorers" && (
            <div className="space-y-2">
              <p className="text-base font-semibold mb-3">Goleadores</p>
              {scorers.length > 0 ? (
                <div className="space-y-2">
                  {scorers.map((s) => (
                    <PlayerLeaderRow
                      key={`${s.rank}-${s.playerName}-${s.nickname}`}
                      rank={s.rank}
                      playerName={s.playerName}
                      playerImageUrl={s.playerImageUrl}
                      playerEaId={s.playerEaId}
                      teamName={s.teamName}
                      teamCrestUrl={s.teamCrestUrl}
                      teamFifaIndexId={s.teamFifaIndexId}
                      nickname={s.nickname}
                      stat={
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <GiSoccerBall
                              className={cn(
                                "h-4 w-4",
                                s.rank === 1 ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                            <span
                              className={cn(
                                "text-xl font-black tabular-nums",
                                s.rank === 1 ? "text-primary" : "text-foreground"
                              )}
                            >
                              {s.goals}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Goles
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay goles registrados
                </p>
              )}
            </div>
          )}

          {active === "cards" && (
            <div className="space-y-2">
              <p className="text-base font-semibold mb-3">Tarjetas</p>
              {cards.length > 0 ? (
                <div className="space-y-2">
                  {cards.map((c) => (
                    <PlayerLeaderRow
                      key={`${c.rank}-${c.playerName}-${c.nickname}`}
                      rank={c.rank}
                      playerName={c.playerName}
                      playerImageUrl={c.playerImageUrl}
                      playerEaId={c.playerEaId}
                      teamName={c.teamName}
                      teamCrestUrl={c.teamCrestUrl}
                      teamFifaIndexId={c.teamFifaIndexId}
                      nickname={c.nickname}
                      stat={
                        <div className="flex flex-col items-end gap-1">
                          {c.yellowCards > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="h-4 w-3 rounded-sm bg-yellow-400 shadow-sm" />
                              <span className="text-sm font-bold">{c.yellowCards}</span>
                            </div>
                          )}
                          {c.redCards > 0 && (
                            <div className="flex items-center gap-1.5">
                              <span className="h-4 w-3 rounded-sm bg-red-600 shadow-sm" />
                              <span className="text-sm font-bold">{c.redCards}</span>
                            </div>
                          )}
                          <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Tarjetas
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay tarjetas registradas
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
