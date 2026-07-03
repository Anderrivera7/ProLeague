import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TeamSquadView } from "@/features/tournaments/components/team-squad-view";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TeamService } from "@/services/team-service";
import { getCurrentUser } from "@/actions/auth-actions";

interface PageProps {
  params: Promise<{ id: string; teamId: string }>;
}

export default async function TournamentSquadPage({ params }: PageProps) {
  const { id, teamId } = await params;
  const [tournament, user] = await Promise.all([
    TournamentRepository.findById(id),
    getCurrentUser(),
  ]);

  if (!tournament || !user) notFound();

  const isCreator = tournament.creatorId === user.id;
  const myParticipant = tournament.participants.find((p) => p.userId === user.id);
  const owner = tournament.participants.find((p) => p.fcTeamId === teamId);

  if (!owner?.fcTeamId) notFound();

  const isOwnTeam = owner.userId === user.id;
  if (!isOwnTeam && !isCreator) notFound();

  const { team } = await TeamService.getOrSyncById(teamId);

  return (
    <>
      <Header
        title={isOwnTeam ? "Mi plantilla" : `Plantilla de ${owner.user.nickname}`}
        subtitle={`${team.name} · ${tournament.name}`}
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <TeamSquadView
          team={team}
          backHref={`/tournaments/${id}`}
          subtitle={`${tournament.name} · ${owner.user.nickname} · ${team.name}`}
        />
      </div>
    </>
  );
}
