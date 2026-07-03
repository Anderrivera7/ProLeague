import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TeamPicker } from "@/features/tournaments/components/team-picker";
import { isLicensedEaId } from "@/lib/fc-data/national-teams";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TeamRepository } from "@/repositories/team-repository";
import { getCurrentUser } from "@/actions/auth-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SelectTeamPage({ params }: PageProps) {
  const { id } = await params;
  const [tournament, user] = await Promise.all([
    TournamentRepository.findById(id),
    getCurrentUser(),
  ]);

  if (!tournament || !user) notFound();

  const participant = tournament.participants.find((p) => p.userId === user.id);
  if (!participant) redirect("/tournaments/join");

  if (participant.fcTeamId) {
    redirect(`/tournaments/${id}`);
  }

  const teams = (await TeamRepository.search(
    "",
    tournament.fcLeagueId ?? undefined,
    100
  )).filter((team) => isLicensedEaId(team.fifaIndexId));

  const takenTeamIds = new Set(
    tournament.participants
      .filter((p) => p.fcTeamId)
      .map((p) => p.fcTeamId as string)
  );

  return (
    <>
      <Header
        title="Elige tu equipo"
        subtitle={`${tournament.name} · Lazy sync activo`}
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 space-y-4">
        <TeamPicker
          tournamentId={id}
          leagueId={tournament.fcLeagueId ?? undefined}
          takenTeamIds={[...takenTeamIds]}
          initialTeams={teams.map((t) => ({
            id: t.id,
            name: t.name,
            crestUrl: t.crestUrl,
            overall: t.overall,
            attack: t.attack,
            midfield: t.midfield,
            defense: t.defense,
            taken: takenTeamIds.has(t.id),
            playerCount: t._count.players,
          }))}
        />
        <Button variant="outline" asChild>
          <Link href={`/tournaments/${id}`}>Volver al torneo</Link>
        </Button>
      </div>
    </>
  );
}
