import Link from "next/link";
import { CrestBadgeClient } from "@/components/ui/crest-badge-client";
import {
  GOLDEN_BOOT_IMAGE,
  TOTY_CARD_IMAGE,
} from "@/lib/awards/golden-boot";

export function GoldenBootCard({
  playerName,
  goals,
  crestUrl,
  clubName,
  tournamentName,
  tournamentId,
}: {
  playerName: string;
  goals: number;
  crestUrl?: string | null;
  clubName?: string | null;
  tournamentName?: string | null;
  tournamentId?: string | null;
}) {
  return (
    <article className="w-[12.5rem] shrink-0">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={TOTY_CARD_IMAGE}
          alt=""
          className="block h-auto w-full select-none"
          draggable={false}
        />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[9%] top-[15%] text-center">
            <p className="text-[1.85rem] font-black leading-none tabular-nums text-[#f6e3a6] [text-shadow:0_2px_0_rgba(0,0,0,0.7)]">
              {goals}
            </p>
            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-[0.18em] text-[#e8c97a]">
              {goals === 1 ? "gol" : "goles"}
            </p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={GOLDEN_BOOT_IMAGE}
            alt=""
            className="absolute left-1/2 top-[22%] w-[88%] -translate-x-1/2 drop-shadow-[0_12px_10px_rgba(0,0,0,0.55)]"
            draggable={false}
          />
          <div className="absolute bottom-[7%] left-[8%] right-[8%] flex items-center justify-center gap-1.5">
            {crestUrl ? (
              <CrestBadgeClient
                crestUrl={crestUrl}
                clubName={clubName}
                size={22}
                className="h-[22px] w-[22px] shrink-0"
              />
            ) : null}
            <p className="truncate text-[13px] font-black uppercase tracking-[0.08em] text-[#f8e7b0] [text-shadow:0_2px_2px_rgba(0,0,0,0.85)]">
              {playerName}
            </p>
          </div>
        </div>
      </div>
      {tournamentName ? (
        <p className="mt-1.5 truncate text-center text-[11px] text-muted-foreground">
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
