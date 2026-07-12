import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { TeamPicker } from "@/features/tournaments/components/team-picker";
import { INTL_LEAGUE_EA_ID, getLeagueCoverUrl } from "@/lib/fc-data/club-ids";
import { isLicensedEaId } from "@/lib/fc-data/national-teams";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TeamRepository } from "@/repositories/team-repository";
import { getCurrentUser } from "@/lib/auth/session";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SelectTeamPage({ params }: PageProps) {
  const { id } = await params;
  const [tournament, user] = await Promise.all([
    TournamentRepository.findByIdForSelectTeam(id),
    getCurrentUser(),
  ]);

  if (!tournament || !user) notFound();

  const participant = tournament.participants.find((p) => p.userId === user.id);
  if (!participant) redirect("/tournaments/join");

  if (participant.fcTeamId) {
    redirect(`/tournaments/${id}`);
  }

  const isNationalLeague =
    tournament.fcLeague?.fifaIndexId === INTL_LEAGUE_EA_ID;

  const teams = (
    await TeamRepository.search("", tournament.fcLeagueId ?? undefined, 200)
  ).filter((team) => !isNationalLeague || isLicensedEaId(team.fifaIndexId));

  const takenTeamIds = new Set(
    tournament.participants
      .filter((p) => p.fcTeamId)
      .map((p) => p.fcTeamId as string)
  );

  const coverUrl = tournament.fcLeague
    ? getLeagueCoverUrl(tournament.fcLeague.fifaIndexId, tournament.fcLeague.name)
    : null;

  return (
    <>
      <Header
        title="Elige tu equipo"
        subtitle={`${tournament.name} · ${tournament.fcLeague?.name ?? "Competición"}`}
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24">
        <TeamPicker
          tournamentId={id}
          tournamentName={tournament.name}
          leagueId={tournament.fcLeagueId ?? undefined}
          leagueName={tournament.fcLeague?.name}
          leagueFifaIndexId={tournament.fcLeague?.fifaIndexId}
          coverUrl={coverUrl}
          takenTeamIds={[...takenTeamIds]}
          initialTeams={teams.map((t) => ({
            id: t.id,
            name: t.name,
            crestUrl: t.crestUrl,
            fifaIndexId: t.fifaIndexId,
            overall: t.overall,
            attack: t.attack,
            midfield: t.midfield,
            defense: t.defense,
            taken: takenTeamIds.has(t.id),
            playerCount: t._count.players,
          }))}
        />
        <div className="mx-auto mt-6 max-w-3xl">
          <Button variant="outline" asChild>
            <Link href={`/tournaments/${id}`}>Volver al torneo</Link>
          </Button>
        </div>
      </div>
    </>
  );
}
