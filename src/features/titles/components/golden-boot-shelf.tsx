import Link from "next/link";
import { GoldenBootStage } from "@/features/titles/components/golden-boot-stage";
import { CrestBadgeClient } from "@/components/ui/crest-badge-client";
import type { TrophyWithTournament } from "@/features/titles/lib/title-utils";

function goalCount(seasonName: string | null | undefined) {
  const match = seasonName?.match(/\d+/);
  return match ? Number(match[0]) : null;
}

export function GoldenBootShelf({
  boots,
  playerName,
}: {
  boots: TrophyWithTournament[];
  playerName?: string | null;
}) {
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
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        {boots.map((boot) => {
          const tournamentName =
            boot.tournament?.name ??
            boot.title.replace(/^Bota de Oro\s*·\s*/i, "");
          const goals = goalCount(boot.seasonName);
          const scorer = playerName?.trim() || boot.clubName || "Goleador";
          return (
            <article
              key={boot.id}
              className="flex items-center gap-2 rounded-2xl border border-white/8 bg-black/35 py-2 pl-1 pr-3 sm:gap-4 sm:py-3 sm:pl-2 sm:pr-5"
            >
              <GoldenBootStage compact className="h-[5.5rem] w-[4.75rem] shrink-0 sm:h-28 sm:w-24" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-amber-300/80">
                  Goleador
                </p>
                <p className="truncate text-base font-semibold sm:text-lg">{scorer}</p>
                <p className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                  {boot.clubCrestUrl ? (
                    <CrestBadgeClient
                      crestUrl={boot.clubCrestUrl}
                      clubName={boot.clubName}
                      size={16}
                      className="h-4 w-4 shrink-0"
                    />
                  ) : null}
                  <span className="truncate">
                    {playerName && boot.clubName ? `${boot.clubName} · ` : ""}
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
                  </span>
                </p>
              </div>
              {goals != null && (
                <div className="shrink-0 text-right">
                  <p className="text-4xl font-black leading-none tabular-nums text-amber-300 sm:text-5xl">
                    {goals}
                  </p>
                  <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-200/70">
                    {goals === 1 ? "gol" : "goles"}
                  </p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
