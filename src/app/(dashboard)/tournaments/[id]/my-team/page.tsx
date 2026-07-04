import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TeamSquadView } from "@/features/tournaments/components/team-squad-view";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { StatsRepository } from "@/repositories/stats-repository";
import { TeamService } from "@/services/team-service";
import { getCurrentUser } from "@/actions/auth-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MyTeamPage({ params }: PageProps) {
  const { id } = await params;
  const [tournament, user] = await Promise.all([
    TournamentRepository.findById(id),
    getCurrentUser(),
  ]);

  if (!tournament || !user) notFound();

  const myParticipant = tournament.participants.find((p) => p.userId === user.id);
  if (!myParticipant?.fcTeamId) {
    redirect(`/tournaments/${id}/select-team`);
  }

  const { team } = await TeamService.getOrSyncById(myParticipant.fcTeamId);
  const tournamentPlayerStats = await StatsRepository.getTournamentPlayerStats(
    id,
    user.id
  );

  return (
    <>
      <Header
        title="Mi plantilla"
        subtitle={`${team.name} · ${tournament.name}`}
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <TeamSquadView
          team={team}
          backHref={`/tournaments/${id}`}
          subtitle={`${tournament.name} · ${user.nickname}`}
          tournamentPlayerStats={tournamentPlayerStats}
        />
      </div>
    </>
  );
}
