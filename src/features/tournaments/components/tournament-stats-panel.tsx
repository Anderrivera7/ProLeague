"use client";

import { useState } from "react";
import { GiSoccerBall } from "react-icons/gi";
import { Card, CardContent } from "@/components/ui/card";
import { TeamCrest } from "@/components/shared/team-crest";
import { PlayerLeaderRow } from "@/components/shared/player-leader-row";
import { cn } from "@/lib/utils";

type Tab = "standings" | "ballon" | "scorers" | "cards";

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

interface BallonRow {
  fcPlayerId: string;
  rank: number;
  playerName: string;
  nickname: string;
  points: number;
  portraitUrl?: string | null;
  playerEaId?: string | null;
  teamName?: string | null;
  crestUrl?: string | null;
  teamFifaIndexId?: string | null;
  detail: string;
}

interface TournamentStatsPanelProps {
  standings: StandingRow[];
  scorers: ScorerRow[];
  cards: CardRow[];
  ballon?: BallonRow[];
  showBallon?: boolean;
}

function AwardMark({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <span className="relative block h-7 w-6 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        style={{ height: "100%", width: "100%", maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
        draggable={false}
      />
    </span>
  );
}

function CardMarks() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      <span className="h-6 w-4 rounded-[3px] bg-gradient-to-b from-yellow-200 to-yellow-500 shadow-sm" />
      <span className="h-6 w-4 rounded-[3px] bg-gradient-to-b from-red-400 to-red-700 shadow-sm" />
    </span>
  );
}

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
  ballon = [],
  showBallon = false,
}: TournamentStatsPanelProps) {
  const [active, setActive] = useState<Tab>("standings");
  const tabs: { id: Tab; label: string }[] = [
    { id: "standings", label: "Tabla" },
    ...(showBallon ? [{ id: "ballon" as const, label: "Balón de Oro" }] : []),
    { id: "scorers", label: "Goleadores" },
    { id: "cards", label: "Tarjetas" },
  ];

  return (
    <Card className="glass lg:col-span-1 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid grid-cols-2 gap-1 border-b border-border bg-muted/20 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                "flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 py-1.5 text-[11px] font-semibold transition-colors",
                active === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background/60"
              )}
            >
              {tab.id === "ballon" && (
                <AwardMark src="/trophies/ballon-dor.png" alt="" />
              )}
              {tab.id === "scorers" && (
                <AwardMark src="/trophies/golden-boot.png" alt="" />
              )}
              {tab.id === "cards" && <CardMarks />}
              <span className="leading-tight">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="min-w-0 p-4">
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

          {active === "ballon" && (
            <div className="space-y-2">
              <div className="mb-3 flex items-center gap-2">
                <AwardMark src="/trophies/ballon-dor.png" alt="" />
                <div>
                  <p className="text-base font-semibold leading-none">Balón de Oro</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    MVP 1 · Final 2 · Goleador 3 al final · Subcampeón 3 · Campeón 5
                  </p>
                </div>
              </div>
              {ballon.length > 0 ? (
                <div className="space-y-2">
                  {ballon.map((row) => (
                    <PlayerLeaderRow
                      key={row.fcPlayerId}
                      rank={row.rank}
                      playerName={row.playerName}
                      playerImageUrl={row.portraitUrl}
                      playerEaId={row.playerEaId}
                      teamName={row.teamName}
                      teamCrestUrl={row.crestUrl}
                      teamFifaIndexId={row.teamFifaIndexId}
                      nickname={row.nickname}
                      stat={
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-black tabular-nums text-[#e2b045]">
                            {row.points}
                          </span>
                          <span className="max-w-24 text-right text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {row.detail}
                          </span>
                        </div>
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Todavía no hay puntos. El MVP se elige al cerrar cada partido.
                </p>
              )}
            </div>
          )}

          {active === "scorers" && (
            <div className="space-y-2">
              <div className="mb-3 flex items-center gap-2">
                <AwardMark src="/trophies/golden-boot.png" alt="" />
                <p className="text-base font-semibold">Goleadores</p>
              </div>
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
              <div className="mb-3 flex items-center gap-2">
                <CardMarks />
                <p className="text-base font-semibold">Tarjetas</p>
              </div>
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
