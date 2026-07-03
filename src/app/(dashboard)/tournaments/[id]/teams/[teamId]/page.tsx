import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SelectTeamView } from "@/features/tournaments/components/select-team-view";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TeamRepository } from "@/repositories/team-repository";
import { getCurrentUser } from "@/actions/auth-actions";

interface PageProps {
  params: Promise<{ id: string; teamId: string }>;
}

export default async function TournamentTeamDetailPage({ params }: PageProps) {
  const { id, teamId } = await params;
  const [tournament, team, user] = await Promise.all([
    TournamentRepository.findById(id),
    TeamRepository.findById(teamId),
    getCurrentUser(),
  ]);

  if (!tournament || !team || !user) notFound();

  const isParticipant = tournament.participants.some((p) => p.userId === user.id);
  if (!isParticipant) notFound();

  const isTaken = tournament.participants.some(
    (p) => p.fcTeamId === teamId && p.userId !== user.id
  );

  return (
    <>
      <Header title={team.name} subtitle="Sincronización inteligente" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-lg">
          <SelectTeamView
            tournamentId={id}
            teamId={teamId}
            teamName={team.name}
            isTaken={isTaken}
          />
        </div>
      </div>
    </>
  );
}
