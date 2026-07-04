import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchCard } from "@/features/matches/components/match-card";
import { JoinCodeCard } from "@/features/tournaments/components/join-code-card";
import { TournamentStatsPanel } from "@/features/tournaments/components/tournament-stats-panel";
import { TournamentBracketLoader } from "@/features/tournaments/components/tournament-bracket-loader";
import { TournamentAlertsPanel } from "@/features/tournaments/components/tournament-alerts-panel";
import { TournamentParticipantsPanel } from "@/features/tournaments/components/tournament-participants-panel";
import { TournamentMyTeamCard } from "@/features/tournaments/components/tournament-my-team-card";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { StatsRepository } from "@/repositories/stats-repository";
import { TournamentService } from "@/services/tournament-service";
import { TOURNAMENT_TYPES } from "@/constants";
import { Shield, Trophy, UserPlus } from "lucide-react";
import { GenerateFixtureButton } from "@/features/tournaments/components/generate-fixture-button";
import { DeleteTournamentButton } from "@/features/tournaments/components/delete-tournament-button";
import { getCurrentUser } from "@/actions/auth-actions";
import { LeagueCover } from "@/components/shared/league-cover";
import { getLeagueCoverUrl } from "@/lib/fc-data/club-ids";
import {
  buildTournamentBracket,
  shouldShowBracket,
} from "@/lib/tournament-bracket";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  let tournament = await TournamentRepository.findById(id);

  if (!tournament) notFound();

  const isCreator = user?.id === tournament.creatorId;
  if (isCreator && user && !tournament.participants.some((p) => p.userId === user.id)) {
    await TournamentService.ensureCreatorEnrolled(id, user.id);
    tournament = await TournamentRepository.findById(id);
    if (!tournament) notFound();
  }
  const myParticipant = tournament.participants.find((p) => p.userId === user?.id);
  const needsTeam = myParticipant && !myParticipant.fcTeamId;
  const typeInfo = TOURNAMENT_TYPES[tournament.type];

  const [scorers, cards, alerts] = await Promise.all([
    StatsRepository.getTournamentScorerRanking(id),
    StatsRepository.getTournamentCardRanking(id),
    StatsRepository.getTournamentAlerts(id),
  ]);

  const standingsRows = tournament.standings.map((s) => ({
    id: s.id,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    points: s.points,
    nickname: s.participant.user.nickname,
    teamName: s.participant.fcTeam?.name ?? s.participant.fcTeam?.country ?? null,
    teamCrestUrl: s.participant.fcTeam?.crestUrl ?? null,
    teamFifaIndexId: s.participant.fcTeam?.fifaIndexId ?? null,
  }));

  const showStatsPanel =
    standingsRows.length > 0 ||
    scorers.length > 0 ||
    cards.length > 0 ||
    tournament.matches.some((m) => m.status === "COMPLETED");

  const coverUrl = tournament.fcLeague
    ? getLeagueCoverUrl(tournament.fcLeague.fifaIndexId, tournament.fcLeague.name)
    : null;

  const statusLabel: Record<string, string> = {
    DRAFT: "Borrador",
    REGISTRATION: "Inscripción abierta",
    ACTIVE: "En curso",
    COMPLETED: "Finalizado",
    CANCELLED: "Cancelado",
  };

  const bracketParticipants = tournament.participants.map((p) => ({
    id: p.id,
    seed: p.seed,
    nickname: p.user.nickname,
    teamName: p.fcTeam?.name ?? p.fcTeam?.country ?? null,
    teamCrestUrl: p.fcTeam?.crestUrl ?? null,
    teamFifaIndexId: p.fcTeam?.fifaIndexId ?? null,
  }));

  const bracket = shouldShowBracket(tournament.type)
    ? buildTournamentBracket(
        bracketParticipants,
        tournament.matches.map((m) => ({
          id: m.id,
          round: m.round,
          groupName: m.groupName,
          bracketPosition: m.bracketPosition,
          status: m.status,
          homeScore: m.homeScore,
          awayScore: m.awayScore,
          homeParticipant: {
            id: m.homeParticipant.id,
            seed: m.homeParticipant.seed,
            nickname: m.homeParticipant.user.nickname,
            teamName:
              m.homeParticipant.fcTeam?.name ??
              m.homeParticipant.fcTeam?.country ??
              null,
            teamCrestUrl: m.homeParticipant.fcTeam?.crestUrl ?? null,
            teamFifaIndexId: m.homeParticipant.fcTeam?.fifaIndexId ?? null,
          },
          awayParticipant: {
            id: m.awayParticipant.id,
            seed: m.awayParticipant.seed,
            nickname: m.awayParticipant.user.nickname,
            teamName:
              m.awayParticipant.fcTeam?.name ??
              m.awayParticipant.fcTeam?.country ??
              null,
            teamCrestUrl: m.awayParticipant.fcTeam?.crestUrl ?? null,
            teamFifaIndexId: m.awayParticipant.fcTeam?.fifaIndexId ?? null,
          },
        })),
        { maxParticipants: tournament.maxParticipants,
          standings: tournament.standings.map((s) => ({
            participantId: s.participantId,
            points: s.points,
            played: s.played,
          })),
        }
      )
    : null;

  const participantRows = tournament.participants.map((p) => ({
    id: p.id,
    userId: p.userId,
    nickname: p.user.nickname,
    elo: p.user.elo,
    teamName: p.fcTeam?.name ?? p.fcTeam?.country ?? null,
    teamCrestUrl: p.fcTeam?.crestUrl ?? null,
    teamFifaIndexId: p.fcTeam?.fifaIndexId ?? null,
    fcTeamId: p.fcTeamId,
  }));

  const recentMatches = tournament.matches.slice(0, 5);

  return (
    <>
      {!coverUrl && (
        <Header title={tournament.name} subtitle={typeInfo.label} />
      )}
      <div className="flex-1 overflow-y-auto pb-24">
        {coverUrl && tournament.fcLeague ? (
          <div className="relative h-44 overflow-hidden border-b border-border sm:h-52">
            <LeagueCover
              coverUrl={coverUrl}
              alt={tournament.fcLeague.name}
              overlayClassName="from-background via-background/60 to-background/20"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge className="text-[10px] uppercase tracking-wider">
                  {statusLabel[tournament.status] ?? tournament.status}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  {typeInfo.label}
                </Badge>
              </div>
              <h1 className="text-2xl font-bold sm:text-3xl">{tournament.name}</h1>
              <p className="text-sm text-muted-foreground">
                {tournament.fcLeague.name} ·{" "}
                {tournament._count.participants}/{tournament.maxParticipants}{" "}
                participantes
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-6 p-4 lg:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">
              Organizado por{" "}
              <span className="font-medium text-foreground">
                {tournament.creator.nickname}
              </span>
              {isCreator && " (tú)"}
            </span>
            <span className="text-sm text-muted-foreground">
              {tournament._count.matches} partidos
            </span>
            {isCreator && tournament._count.matches === 0 && (
              <GenerateFixtureButton tournamentId={tournament.id} />
            )}
            {isCreator && <DeleteTournamentButton tournamentId={tournament.id} />}
          </div>

          {!coverUrl && (
            <div className="flex flex-wrap items-center gap-3">
              <Badge>{statusLabel[tournament.status] ?? tournament.status}</Badge>
              <Badge variant="outline">{typeInfo.label}</Badge>
              {tournament.fcLeague && (
                <Badge variant="secondary">{tournament.fcLeague.name}</Badge>
              )}
            </div>
          )}

          <div
            className={`grid gap-4 ${myParticipant?.fcTeamId && tournament.joinCode ? "lg:grid-cols-2" : ""}`}
          >
            {tournament.joinCode && (
              <JoinCodeCard
                joinCode={tournament.joinCode}
                tournamentName={tournament.name}
              />
            )}
            {myParticipant?.fcTeamId && myParticipant.fcTeam && (
              <TournamentMyTeamCard
                tournamentId={id}
                teamName={myParticipant.fcTeam.name}
                teamCrestUrl={myParticipant.fcTeam.crestUrl}
                teamFifaIndexId={myParticipant.fcTeam.fifaIndexId}
                leagueLabel={
                  myParticipant.fcTeam.country
                    ? `Selección Nacional`
                    : myParticipant.fcTeam.league?.name ?? null
                }
              />
            )}
          </div>

          {!myParticipant && tournament.status === "REGISTRATION" && (
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">¿Quieres jugar este torneo?</p>
                  <p className="text-sm text-muted-foreground">
                    Únete con el código y elige tu selección
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/tournaments/join?code=${tournament.joinCode ?? ""}`}>
                    Unirme al torneo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {needsTeam && (
            <Card className="overflow-hidden border-primary/40">
              <div className="bg-gradient-to-r from-primary/15 via-primary/5 to-transparent px-4 py-3 sm:px-6">
                <CardContent className="flex flex-col gap-4 p-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Aún no has elegido equipo</p>
                      <p className="text-sm text-muted-foreground">
                        Elige un club con plantilla completa
                      </p>
                    </div>
                  </div>
                  <Button asChild className="shrink-0">
                    <Link href={`/tournaments/${id}/select-team`}>
                      Elegir equipo
                    </Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          )}

          {tournament.description && (
            <p className="text-muted-foreground">{tournament.description}</p>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            {showStatsPanel && (
              <TournamentStatsPanel
                standings={standingsRows}
                scorers={scorers}
                cards={cards}
              />
            )}

            <div className={showStatsPanel ? "lg:col-span-2" : "lg:col-span-3"}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Partidos</h2>
                {tournament.matches.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    Mostrando los últimos 5
                  </span>
                )}
              </div>
              {recentMatches.length > 0 ? (
                <div className="space-y-3">
                  {recentMatches.map((match) => {
                    const canReportMatch =
                      isCreator ||
                      match.homeParticipant.userId === user?.id ||
                      match.awayParticipant.userId === user?.id;

                    return (
                      <MatchCard
                        key={match.id}
                        match={match as never}
                        tournament={{ id: tournament.id, name: tournament.name }}
                        canReport={canReportMatch}
                      />
                    );
                  })}
                </div>
              ) : (
                <Card className="glass">
                  <CardContent className="py-8 text-center text-sm text-muted-foreground">
                    {isCreator
                      ? "Genera el fixture para crear los partidos"
                      : "El organizador aún no ha generado el fixture"}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <TournamentParticipantsPanel
              participants={participantRows}
              maxParticipants={tournament.maxParticipants}
              tournamentId={id}
              currentUserId={user?.id}
              isCreator={isCreator}
              isViewerInTournament={!!myParticipant}
              joinCode={tournament.joinCode}
            />
            <TournamentAlertsPanel alerts={alerts} />
          </div>

          {bracket && bracket.rounds.length > 0 && (
            <TournamentBracketLoader
              rounds={bracket.rounds}
              champion={bracket.champion}
            />
          )}

          {isCreator && tournament.joinCode && (
            <Card className="glass border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-transparent">
              <CardContent className="flex flex-col items-center gap-4 py-5 sm:flex-row sm:justify-between">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu torneo como un profesional. Invita jugadores,
                    revisa estadísticas y lleva tu torneo al siguiente nivel.
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link href={`/tournaments/join?code=${tournament.joinCode}`}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invitar jugadores
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
