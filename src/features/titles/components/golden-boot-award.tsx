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
    <article className="flex w-[10.75rem] shrink-0 flex-col items-center rounded-3xl border border-amber-500/20 bg-gradient-to-b from-[#1c160c] to-black px-3 pb-4 pt-2 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GOLDEN_BOOT_IMAGE}
        alt=""
        className="h-40 w-auto object-contain drop-shadow-[0_14px_12px_rgba(0,0,0,0.45)]"
        draggable={false}
      />
      <Avatar className="-mt-2 h-[4.5rem] w-[4.5rem] border-2 border-amber-400/70">
        {portraitUrl ? <AvatarImage src={portraitUrl} alt={playerName} /> : null}
        <AvatarFallback className="bg-amber-950 text-sm text-amber-100">
          {initials}
        </AvatarFallback>
      </Avatar>
      <p className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold leading-5">
        {playerName}
      </p>
      <p className="mt-1 text-4xl font-black leading-none tabular-nums text-amber-300">
        {goals}
      </p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-amber-200/70">
        {goals === 1 ? "gol" : "goles"}
      </p>
      <p className="mt-3 flex max-w-full items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
        {crestUrl ? (
          <CrestBadgeClient
            crestUrl={crestUrl}
            clubName={clubName}
            size={16}
            className="h-4 w-4 shrink-0"
          />
        ) : null}
        <span className="truncate">{clubName ?? "Equipo"}</span>
      </p>
      {tournamentName ? (
        <p className="mt-1 max-w-full truncate text-[11px] text-muted-foreground">
          {tournamentId ? (
            <Link href={`/tournaments/${tournamentId}`} className="hover:text-amber-200">
              {tournamentName}
            </Link>
          ) : (
            tournamentName
          )}
        </p>
      ) : null}
    </article>
  );
}
