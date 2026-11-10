import Link from "next/link";
import { CrestBadgeClient } from "@/components/ui/crest-badge-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BALLON_DOR_IMAGE } from "@/lib/awards/ballon-dor";

export function BallonDorAward({
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
    <article className="relative inline-flex max-w-full overflow-hidden rounded-[1.35rem] border border-[#f6e2a4] bg-gradient-to-br from-[#fff1c4] via-[#e2b045] to-[#8a5a12] p-[1.5px] shadow-[0_16px_36px_-18px_rgba(226,176,69,0.95)]">
      <div className="relative inline-flex items-center gap-3 rounded-[1.25rem] bg-gradient-to-br from-[#3a280c] via-[#6b4a16] to-[#24180a] py-3.5 pl-2 pr-4 sm:gap-4 sm:py-4 sm:pr-5">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,226,150,0.42),transparent_42%),radial-gradient(circle_at_100%_100%,rgba(120,72,12,0.45),transparent_40%)]"
          aria-hidden
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BALLON_DOR_IMAGE}
          alt=""
          className="relative z-10 shrink-0 object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.45)]"
          style={{ height: 108, width: "auto", maxHeight: 108, maxWidth: 92 }}
          draggable={false}
        />
        <Avatar className="relative z-10 h-[4.5rem] w-[4.5rem] shrink-0 border-2 border-[#ffe7a8] shadow-[0_0_0_3px_rgba(90,58,12,0.55),0_8px_16px_-8px_rgba(255,214,120,0.9)]">
          {portraitUrl ? <AvatarImage src={portraitUrl} alt={playerName} /> : null}
          <AvatarFallback className="bg-[#5a3c10] text-sm text-[#ffe7a8]">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="relative z-10 min-w-0 max-w-[11rem]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ffe3a1]">
            Balón de Oro
          </p>
          <p className="truncate text-base font-semibold text-[#fff6dd] sm:text-lg">
            {playerName}
          </p>
          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-[#f3d48a]">
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
            <p className="truncate text-[11px] text-[#e7c56b]/80">
              {tournamentId ? (
                <Link href={`/tournaments/${tournamentId}`} className="hover:text-[#fff1c4]">
                  {tournamentName}
                </Link>
              ) : (
                tournamentName
              )}
            </p>
          ) : null}
        </div>
        <div className="relative z-10 shrink-0 pl-1 text-right">
          <p className="text-5xl font-black leading-none tabular-nums text-[#ffe7a3] [text-shadow:0_2px_0_rgba(70,42,8,0.55)]">
            {goals}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#ffe3a1]">
            {goals === 1 ? "gol" : "goles"}
          </p>
        </div>
      </div>
    </article>
  );
}
