import Link from "next/link";
import { GoldenBootStage } from "@/features/titles/components/golden-boot-stage";
import { CrestBadgeClient } from "@/components/ui/crest-badge-client";
import type { TrophyWithTournament } from "@/features/titles/lib/title-utils";

export function GoldenBootShelf({ boots }: { boots: TrophyWithTournament[] }) {
  if (boots.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-b from-[#1a1408] via-[#100e0a] to-[#0b0b0b]">
      <div className="border-b border-amber-500/15 px-4 py-3 sm:px-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-amber-300/90">
          Premios individuales
        </p>
        <h2 className="text-base font-semibold sm:text-lg">Botas de oro</h2>
        <p className="text-xs text-muted-foreground">
          Máximo goleador de cada torneo. No cuentan como título.
        </p>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {boots.map((boot) => {
          const tournamentName =
            boot.tournament?.name ??
            boot.title.replace(/^Bota de Oro\s*·\s*/i, "");
          return (
            <article
              key={boot.id}
              className="rounded-2xl border border-white/8 bg-black/30 px-3 py-3"
            >
              <GoldenBootStage compact />
              <div className="mt-1 flex items-center gap-2">
                {boot.clubCrestUrl ? (
                  <CrestBadgeClient
                    crestUrl={boot.clubCrestUrl}
                    clubName={boot.clubName}
                    size={18}
                    className="h-5 w-5"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {boot.clubName ?? "Bota de Oro"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {boot.tournament ? (
                      <Link
                        href={`/tournaments/${boot.tournament.id}`}
                        className="hover:text-amber-200"
                      >
                        {tournamentName}
                      </Link>
                    ) : (
                      tournamentName
                    )}
                    {boot.seasonName ? ` · ${boot.seasonName}` : ""}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
