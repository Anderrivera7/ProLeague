import Link from "next/link";
import { GoldenBootStage } from "@/features/titles/components/golden-boot-stage";
import { CrestBadgeClient } from "@/components/ui/crest-badge-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function GoldenBootAward({
  playerName,
  portraitUrl,
  goals,
  crestUrl,
  clubName,
  tournamentName,
  tournamentId,
}: {
  playerName: string;
  portraitUrl?: string | null;
  goals: number;
  crestUrl?: string | null;
  clubName?: string | null;
  tournamentName?: string | null;
  tournamentId?: string | null;
}) {
  const initials = playerName.slice(0, 2).toUpperCase();

  return (
    <article className="flex items-center gap-2 rounded-2xl border border-white/8 bg-black/35 py-2 pl-1 pr-3 sm:gap-4 sm:py-3 sm:pl-2 sm:pr-5">
      <GoldenBootStage compact className="h-28 w-24 shrink-0" />
      <Avatar className="h-16 w-16 shrink-0 border-2 border-amber-400/60 sm:h-[4.5rem] sm:w-[4.5rem]">
        {portraitUrl ? (
          <AvatarImage src={portraitUrl} alt={playerName} />
        ) : null}
        <AvatarFallback className="bg-amber-950 text-sm text-amber-100">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold sm:text-lg">{playerName}</p>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground sm:text-sm">
          {crestUrl ? (
            <CrestBadgeClient
              crestUrl={crestUrl}
              clubName={clubName}
              size={18}
              className="h-5 w-5 shrink-0"
            />
          ) : null}
          <span className="truncate">{clubName ?? "Equipo"}</span>
        </p>
        {tournamentName ? (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
            {tournamentId ? (
              <Link
                href={`/tournaments/${tournamentId}`}
                className="hover:text-amber-200"
              >
                {tournamentName}
              </Link>
            ) : (
              tournamentName
            )}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-4xl font-black leading-none tabular-nums text-amber-300 sm:text-5xl">
          {goals}
        </p>
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-200/70">
          {goals === 1 ? "gol" : "goles"}
        </p>
      </div>
    </article>
  );
}
