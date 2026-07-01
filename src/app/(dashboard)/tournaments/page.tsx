import Link from "next/link";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/features/tournaments/components/tournament-card";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { Trophy } from "lucide-react";

export default async function TournamentsPage() {
  const tournaments = await TournamentRepository.findAll();

  return (
    <>
      <Header
        title="Torneos"
        subtitle="Gestiona y participa en competiciones"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {tournaments.length} torneo{tournaments.length !== 1 ? "s" : ""}
          </p>
          <Button asChild>
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
          <div className="flex flex-col items-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Trophy className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No hay torneos</h3>
            <p className="mb-6 max-w-sm text-sm text-muted-foreground">
              Crea tu primer torneo y empieza a competir con la comunidad.
            </p>
            <Button asChild>
              <Link href="/tournaments/create">Crear Torneo</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
