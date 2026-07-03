import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTournamentForm } from "@/features/tournaments/components/create-tournament-form";
import { FifaDbRepository } from "@/repositories/fifa-db-repository";

export default async function CreateTournamentPage() {
  const leagues = await FifaDbRepository.getLeagues();

  return (
    <>
      <Header title="Crear torneo" subtitle="Configura tu competición EA FC" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24">
        <Card className="mx-auto max-w-2xl glass">
          <CardHeader>
            <CardTitle>Detalles del torneo</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTournamentForm leagues={leagues} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
