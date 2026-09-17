import Link from "next/link";
import { Plus, Trophy } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/features/tournaments/components/tournament-card";
import { TournamentFilters } from "@/features/tournaments/components/tournament-filters";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { getSessionUser } from "@/actions/auth-actions";

export default async function TournamentsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await getSessionUser();
  const { filter } = await searchParams;
  const activeFilter =
    filter === "mine" || filter === "open" ? filter : "all";

  const tournaments =
    activeFilter === "mine" && session
      ? await TournamentRepository.findAll({
          participantUserId: session.id,
          limit: 40,
        })
      : activeFilter === "open"
        ? await TournamentRepository.findAll({
            status: "REGISTRATION",
            limit: 40,
          })
        : await TournamentRepository.findAll({ limit: 40 });

  return (
    <>
      <Header
        title="Torneos"
        subtitle="Compite, inscribete o crea tu propia liga"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {tournaments.length} torneo
              {tournaments.length !== 1 ? "s" : ""}
              {activeFilter === "mine"
                ? " tuyos"
                : activeFilter === "open"
                  ? " abiertos"
                  : ""}
            </p>
            <TournamentFilters active={activeFilter} />
          </div>
          <Button asChild className="w-full shrink-0 rounded-full sm:w-auto">
            <Link href="/tournaments/create">
              <Plus className="h-4 w-4" />
              Crear Torneo
            </Link>
          </Button>
        </div>

        {tournaments.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament as never}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-card to-background px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">
              {activeFilter === "mine"
                ? "No estás en ningún torneo"
                : activeFilter === "open"
                  ? "No hay inscripciones abiertas"
                  : "No hay torneos"}
            </h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              {activeFilter === "mine"
                ? "Únete a uno abierto o crea el tuyo para empezar a jugar."
                : "Crea el primero y invita a tus amigos."}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {activeFilter === "mine" && (
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/tournaments?filter=open">Ver abiertos</Link>
                </Button>
              )}
              <Button className="rounded-full" asChild>
                <Link href="/tournaments/create">Crear Torneo</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
