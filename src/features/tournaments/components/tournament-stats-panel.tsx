"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
}

interface ScorerRow {
  rank: number;
  playerName: string;
  nickname: string;
  goals: number;
}

interface CardRow {
  rank: number;
  playerName: string;
  nickname: string;
  yellowCards: number;
  redCards: number;
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
                "px-3 py-4 text-[11px] font-medium leading-tight transition-colors writing-mode-vertical",
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
                  <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
                    <span className="col-span-3">Jugador</span>
                    <span className="text-center">PJ</span>
                    <span className="text-center">G</span>
                    <span className="text-center">E</span>
                    <span className="text-center">P</span>
                    <span className="text-center">Pts</span>
                  </div>
                  {standings.map((s, i) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-8 gap-1 items-center py-1"
                    >
                      <span className="col-span-3 truncate font-medium">
                        {i + 1}. {s.nickname}
                      </span>
                      <span className="text-center">{s.played}</span>
                      <span className="text-center">{s.won}</span>
                      <span className="text-center">{s.drawn}</span>
                      <span className="text-center">{s.lost}</span>
                      <span className="text-center font-bold text-primary">
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
            <div className="space-y-2 text-sm">
              <p className="text-base font-semibold mb-3">Goleadores</p>
              {scorers.length > 0 ? (
                scorers.map((s) => (
                  <div
                    key={`${s.rank}-${s.playerName}`}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {s.rank}. {s.playerName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {s.nickname}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-primary">
                      ⚽ {s.goals}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aún no hay goles registrados
                </p>
              )}
            </div>
          )}

          {active === "cards" && (
            <div className="space-y-2 text-sm">
              <p className="text-base font-semibold mb-3">Tarjetas</p>
              {cards.length > 0 ? (
                cards.map((c) => (
                  <div
                    key={`${c.rank}-${c.playerName}`}
                    className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50 last:border-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {c.rank}. {c.playerName}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.nickname}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2 text-xs font-bold">
                      {c.yellowCards > 0 && <span>🟨 {c.yellowCards}</span>}
                      {c.redCards > 0 && <span>🟥 {c.redCards}</span>}
                    </div>
                  </div>
                ))
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
