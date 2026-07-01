import { Header } from "@/components/layout/header";
import { MatchCard } from "@/features/matches/components/match-card";
import { getCurrentUser } from "@/actions/auth-actions";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";

export default async function MatchesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { homeParticipant: { userId: user.id } },
        { awayParticipant: { userId: user.id } },
      ],
    },
    include: {
      homeParticipant: { include: { user: true } },
      awayParticipant: { include: { user: true } },
      tournament: true,
    },
    orderBy: { scheduledAt: "desc" },
    take: 50,
  });

  return (
    <>
      <Header title="Partidos" subtitle="Historial y próximos encuentros" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {matches.length > 0 ? (
          <div className="space-y-3 max-w-3xl">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match as never} />
            ))}
          </div>
        ) : (
          <Card className="glass">
            <CardContent className="py-12 text-center text-muted-foreground">
              No tienes partidos registrados
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
