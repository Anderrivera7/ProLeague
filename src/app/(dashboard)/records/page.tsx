import Link from "next/link";
import { Medal } from "lucide-react";
import { Header } from "@/components/layout/header";
import { UserAvatar } from "@/components/ui/user-avatar";
import { StatsRepository } from "@/repositories/stats-repository";

export default async function RecordsPage() {
  const { competitionRecords, mostClubs, mostCompetitions } =
    await StatsRepository.getCompetitionRecords();

  return (
    <>
      <Header
        title="Records"
        subtitle="Los carteles de la liga"
      />
      <div className="space-y-6 p-4 lg:p-6">
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            Sala de records
          </h2>
          <div className="flex flex-col gap-4">
            {[
              { src: "/records/tridente.png", alt: "El mejor tridente" },
              { src: "/records/mejor-final.png", alt: "La mejor final, el derby" },
              { src: "/records/subcampeonatos.png", alt: "Más subcampeonatos" },
              { src: "/records/goleada-final.png", alt: "Mayor goleada en una final" },
              { src: "/records/primer-descendido.png", alt: "Primer descendido a la B" },
            ].map((poster) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={poster.src}
                src={poster.src}
                alt={poster.alt}
                className="w-full rounded-2xl border border-white/10"
              />
            ))}
          </div>
        </section>
        {(mostClubs || mostCompetitions) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {mostClubs && (
              <Link
                href={`/players/${mostClubs.user.id}`}
                className="rounded-2xl border border-primary/30 bg-primary/10 p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Récord de clubes
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Más equipos distintos con un título
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <UserAvatar
                    nickname={mostClubs.user.nickname}
                    avatarUrl={mostClubs.user.avatarUrl}
                    size={40}
                  />
                  <div>
                    <p className="font-semibold">{mostClubs.user.nickname}</p>
                    <p className="text-lg font-bold text-primary">
                      {mostClubs.count} clubes
                    </p>
                  </div>
                </div>
              </Link>
            )}
            {mostCompetitions && (
              <Link
                href={`/players/${mostCompetitions.user.id}`}
                className="rounded-2xl border border-white/10 bg-[#121212] p-4"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Récord de competiciones
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Más torneos distintos ganados
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <UserAvatar
                    nickname={mostCompetitions.user.nickname}
                    avatarUrl={mostCompetitions.user.avatarUrl}
                    size={40}
                  />
                  <div>
                    <p className="font-semibold">
                      {mostCompetitions.user.nickname}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {mostCompetitions.count} competiciones
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10">
          {competitionRecords.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Todavía no hay récords. El primero en ganar una competición lo
              deja escrito.
            </p>
          ) : (
            competitionRecords.map((record) => (
              <Link
                key={record.competition}
                href={`/players/${record.user.id}`}
                className="flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 hover:bg-white/[0.03]"
              >
                <Medal className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    Récord de {record.competition}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {record.user.nickname}
                    {record.clubs.length > 0
                      ? ` · ${record.clubs.slice(0, 3).join(", ")}`
                      : ""}
                    {record.shared ? " · compartido" : ""}
                  </p>
                </div>
                <p className="shrink-0 text-right text-sm font-bold tabular-nums text-primary">
                  {record.count}
                  <span className="ml-1 text-[10px] font-medium uppercase text-muted-foreground">
                    {record.count === 1 ? "título" : "títulos"}
                  </span>
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </>
  );
}
