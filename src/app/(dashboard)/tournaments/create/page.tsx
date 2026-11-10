import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateTournamentForm } from "@/features/tournaments/components/create-tournament-form";
import { FifaDbRepository } from "@/repositories/fifa-db-repository";
import { getCurrentUser } from "@/lib/auth/session";
import { isTournamentAdmin } from "@/lib/auth/tournament-admin";
import { prisma } from "@/lib/prisma";

export default async function CreateTournamentPage() {
  const [leagues, user] = await Promise.all([
    FifaDbRepository.getLeagues(),
    getCurrentUser(),
  ]);
  const isAdmin = isTournamentAdmin(user?.nickname);
  const players = isAdmin
    ? await prisma.user.findMany({
        select: { id: true, nickname: true, avatarUrl: true },
        orderBy: { nickname: "asc" },
      })
    : [];

  return (
    <>
      <Header
        title="Crear torneo"
        subtitle={
          isAdmin
            ? "Admin: arma el torneo y asigna equipos"
            : "Configura tu competición EA FC"
        }
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24">
        <Card className="mx-auto max-w-2xl glass">
          <CardHeader>
            <CardTitle>Detalles del torneo</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateTournamentForm
              leagues={leagues}
              isAdmin={isAdmin}
              currentUserId={user?.id}
              currentNickname={user?.nickname}
              users={players}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
