import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { SelectTeamView } from "@/features/tournaments/components/select-team-view";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TeamService } from "@/services/team-service";
import { getCurrentUser } from "@/lib/auth/session";
import type { SerializedTeam } from "@/server-actions/team-actions";

interface PageProps {
  params: Promise<{ id: string; teamId: string }>;
}

export default async function TournamentTeamDetailPage({ params }: PageProps) {
  const { id, teamId } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const [participant, teamResult, isTaken] = await Promise.all([
    TournamentRepository.getParticipant(id, user.id),
    TeamService.getOrSyncById(teamId),
    TournamentRepository.isTeamTaken(id, teamId, user.id),
  ]);

  if (!participant) notFound();

  const initialTeam: SerializedTeam = {
    id: teamResult.team.id,
    eaId: teamResult.team.fifaIndexId,
    fifaIndexId: teamResult.team.fifaIndexId,
    name: teamResult.team.name,
    shortName: teamResult.team.shortName,
    country: teamResult.team.country,
    crestUrl: teamResult.team.crestUrl,
    overall: teamResult.team.overall,
    attack: teamResult.team.attack,
    midfield: teamResult.team.midfield,
    defense: teamResult.team.defense,
    syncedAt: teamResult.team.syncedAt?.toISOString() ?? null,
    league: teamResult.team.league
      ? { id: teamResult.team.league.id, name: teamResult.team.league.name }
      : null,
    players: teamResult.team.players.map((p) => ({
      id: p.id,
      eaId: p.fifaIndexId,
      fifaIndexId: p.fifaIndexId,
      name: p.name,
      position: p.position,
      squadRole: p.squadRole,
      jerseyNumber: p.jerseyNumber,
      overall: p.overall,
      potential: p.potential,
      imageUrl: p.imageUrl,
      pace: p.pace,
      shooting: p.shooting,
      passing: p.passing,
      dribbling: p.dribbling,
      defending: p.defending,
      physic: p.physic,
    })),
  };

  return (
    <>
      <Header title={initialTeam.name} subtitle="Confirmar selección" />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="mx-auto max-w-lg">
          <SelectTeamView
            tournamentId={id}
            teamId={teamId}
            teamName={initialTeam.name}
            isTaken={isTaken}
            initialTeam={initialTeam}
            syncSource={teamResult.source}
          />
        </div>
      </div>
    </>
  );
}
