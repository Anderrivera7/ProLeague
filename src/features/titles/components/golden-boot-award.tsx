import Link from "next/link";
import { CrestBadgeClient } from "@/components/ui/crest-badge-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GOLDEN_BOOT_IMAGE } from "@/lib/awards/golden-boot";

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
    <article className="flex w-full min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-black/40 py-2.5 pl-1.5 pr-3 sm:w-auto sm:gap-3.5 sm:py-3.5 sm:pr-5">
      <div className="h-16 w-14 shrink-0 sm:h-24 sm:w-[6.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GOLDEN_BOOT_IMAGE}
          alt=""
          className="object-contain"
          style={{ height: "100%", width: "100%", maxHeight: "100%", maxWidth: "100%" }}
          draggable={false}
        />
      </div>
      <Avatar className="h-12 w-12 shrink-0 border-2 border-amber-400/60 sm:h-16 sm:w-16">
        {portraitUrl ? <AvatarImage src={portraitUrl} alt={playerName} /> : null}
        <AvatarFallback className="bg-amber-950 text-xs text-amber-100">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 sm:max-w-[9.5rem] sm:flex-none">
        <p className="truncate text-sm font-semibold sm:text-base">{playerName}</p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
          {crestUrl ? (
            <CrestBadgeClient
              crestUrl={crestUrl}
              clubName={clubName}
              size={14}
              className="h-3.5 w-3.5 shrink-0"
            />
          ) : null}
          <span className="truncate">{clubName ?? "Equipo"}</span>
        </p>
        {tournamentName ? (
          <p className="truncate text-[11px] text-muted-foreground">
            {tournamentId ? (
              <Link href={`/tournaments/${tournamentId}`} className="hover:text-amber-200">
                {tournamentName}
              </Link>
            ) : (
              tournamentName
            )}
          </p>
        ) : null}
      </div>
      <div className="shrink-0 pl-1 text-right">
        <p className="text-3xl font-black leading-none tabular-nums text-amber-300 sm:text-4xl">
          {goals}
        </p>
        <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-amber-200/70">
          {goals === 1 ? "gol" : "goles"}
        </p>
      </div>
    </article>
  );
}
