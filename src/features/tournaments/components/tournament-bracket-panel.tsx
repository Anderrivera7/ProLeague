"use client";

import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamCrest } from "@/components/shared/team-crest";
import type {
  BracketChampion,
  BracketMatchView,
  BracketRoundView,
  BracketSlot,
} from "@/lib/tournament-bracket";
import { cn } from "@/lib/utils";

interface TournamentBracketPanelProps {
  rounds: BracketRoundView[];
  champion: BracketChampion;
}

function BracketPlayerRow({
  slot,
  showByeLabel = false,
}: {
  slot: BracketSlot;
  showByeLabel?: boolean;
}) {
  const isEmpty = !slot.nickname;
  const hasByeLabel = showByeLabel && !isEmpty && Number(slot.seed) === 1;

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {slot.seed != null && (
        <span className="w-5 shrink-0 text-[10px] font-bold text-muted-foreground">
          {slot.seed}°
        </span>
      )}
      {isEmpty ? (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <span className="text-xs">?</span>
        </div>
      ) : (
        <TeamCrest
          name={slot.teamName ?? slot.nickname ?? "—"}
          crestUrl={slot.teamCrestUrl}
          fifaIndexId={slot.teamFifaIndexId ?? undefined}
          size={28}
        />
      )}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-semibold",
            isEmpty && "text-muted-foreground font-normal"
          )}
        >
          {slot.nickname ?? slot.placeholder ?? "Por definir"}
        </p>
        {!isEmpty && (
          <p className="truncate text-[11px] text-muted-foreground">
            {slot.teamName ?? "—"}
          </p>
        )}
        {hasByeLabel && (
          <p className="text-[10px] font-medium text-primary">Pase a final</p>
        )}
        {isEmpty && slot.placeholder && (
          <p className="truncate text-[11px] text-muted-foreground/70">
            {slot.placeholder}
          </p>
        )}
      </div>
    </div>
  );
}

function BracketSlotsCard({ slots }: { slots: BracketSlot[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      {slots.map((slot, index) => (
        <div
          key={slot.participantId ?? slot.seed ?? index}
          className={cn(index > 0 && "border-t border-border/60")}
        >
          <BracketPlayerRow slot={slot} showByeLabel />
        </div>
      ))}
    </div>
  );
}
function BracketMatchCard({ match }: { match: BracketMatchView }) {
  const content = (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60">
      <BracketPlayerRow slot={match.home} />
      <div className="border-y border-border/60 bg-muted/20 px-3 py-0.5 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        vs
      </div>
      <BracketPlayerRow slot={match.away} />
      {match.status === "COMPLETED" &&
        match.homeScore != null &&
        match.awayScore != null && (
          <div className="border-t border-border/60 bg-primary/5 px-3 py-1.5 text-center font-mono text-sm font-bold">
            {match.homeScore} — {match.awayScore}
          </div>
        )}
    </div>
  );

  if (match.id) {
    return (
      <Link href={`/matches/${match.id}`} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}

export function TournamentBracketPanel({
  rounds,
  champion,
}: TournamentBracketPanelProps) {
  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Fixture</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {rounds.map((round, roundIndex) => (
            <div key={round.label} className="flex min-w-[200px] shrink-0 items-center gap-2">
              <div className="flex-1 space-y-3">
                <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {round.label}
                </p>
                {round.slots && round.slots.length > 0 && (
                  <BracketSlotsCard slots={round.slots} />
                )}
                {round.matches.map((match, i) => (
                  <BracketMatchCard key={match.id ?? `${round.label}-${i}`} match={match} />
                ))}
              </div>
              {roundIndex < rounds.length - 1 && (
                <ChevronRight className="h-4 w-4 shrink-0 text-primary/60" aria-hidden />
              )}
            </div>
          ))}

          {rounds.length > 0 && (
            <ChevronRight className="h-4 w-4 shrink-0 text-primary/60" aria-hidden />
          )}

          <div className="flex min-w-[140px] shrink-0 flex-col items-center justify-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Campeón
            </p>
            <div className="flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 px-6 py-5">
              {champion.nickname ? (
                <>
                  <TeamCrest
                    name={champion.teamName ?? champion.nickname}
                    crestUrl={champion.teamCrestUrl}
                    fifaIndexId={champion.teamFifaIndexId ?? undefined}
                    size={48}
                  />
                  <p className="text-center text-sm font-bold">{champion.teamName}</p>
                  <p className="text-center text-xs text-muted-foreground">
                    @{champion.nickname}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted">
                    <Trophy className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {champion.placeholder ?? "Por definir"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
