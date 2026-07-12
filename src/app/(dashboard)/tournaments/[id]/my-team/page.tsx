import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TeamSquadView } from "@/features/tournaments/components/team-squad-view";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { StatsRepository } from "@/repositories/stats-repository";
import { TeamService } from "@/services/team-service";
import { getCurrentUser } from "@/lib/auth/session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MyTeamPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const [tournament, participant, tournamentPlayerStats] = await Promise.all([
    TournamentRepository.findByIdMeta(id),
    TournamentRepository.getParticipant(id, user.id),
    StatsRepository.getTournamentPlayerStats(id, user.id),
  ]);

  if (!tournament || !participant?.fcTeamId) {
    redirect(`/tournaments/${id}/select-team`);
  }

  const { team } = await TeamService.getOrSyncById(participant.fcTeamId);

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
          compactHeader
          tournamentPlayerStats={tournamentPlayerStats}
        />
      </div>
    </>
  );
}
