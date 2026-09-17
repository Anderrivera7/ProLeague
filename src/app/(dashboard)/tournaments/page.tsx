import Link from "next/link";
import { Plus, Trophy, KeyRound } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TournamentCard } from "@/features/tournaments/components/tournament-card";
import { JoinTournamentCard } from "@/features/tournaments/components/join-tournament-card";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { getSessionUser } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function TournamentsPage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const tournaments = await TournamentRepository.findAll({
    participantUserId: session.id,
    limit: 40,
  });

  return (
    <>
      <Header
        title="Torneos"
        subtitle="Solo ves los tuyos · únete con código de invitación"
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {tournaments.length} torneo
            {tournaments.length !== 1 ? "s" : ""} en los que participas
          </p>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" className="rounded-full" asChild>
              <Link href="/tournaments/join">
                <KeyRound className="h-4 w-4" />
                Unirme con código
              </Link>
            </Button>
            <Button className="rounded-full" asChild>
              <Link href="/tournaments/create">
                <Plus className="h-4 w-4" />
                Crear Torneo
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <JoinTournamentCard />
        </div>

        <section className="space-y-3">
          <div>
            <h2 className="text-base font-semibold">Mis torneos</h2>
            <p className="text-xs text-muted-foreground">
              Aparecen aquí cuando creas uno o te unes con invitación
            </p>
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
            <div className="flex flex-col items-center rounded-3xl border border-dashed border-border/80 bg-gradient-to-b from-card to-background px-6 py-14 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">
                Todavía no tienes torneos
              </h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Pide el código a quien organiza, o crea tu propio torneo e invita
                a tus amigos.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" className="rounded-full" asChild>
                  <Link href="/tournaments/join">Ingresar código</Link>
                </Button>
                <Button className="rounded-full" asChild>
                  <Link href="/tournaments/create">Crear Torneo</Link>
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
