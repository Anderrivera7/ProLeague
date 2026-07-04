import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchCard } from "@/features/matches/components/match-card";
import { JoinCodeCard } from "@/features/tournaments/components/join-code-card";
import { TournamentStatsPanel } from "@/features/tournaments/components/tournament-stats-panel";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { StatsRepository } from "@/repositories/stats-repository";
import { TournamentService } from "@/services/tournament-service";
import { TOURNAMENT_TYPES } from "@/constants";
import { Shield } from "lucide-react";
import { GenerateFixtureButton } from "@/features/tournaments/components/generate-fixture-button";
import { DeleteTournamentButton } from "@/features/tournaments/components/delete-tournament-button";
import { getCurrentUser } from "@/actions/auth-actions";
import { LeagueCover } from "@/components/shared/league-cover";
import { getLeagueCoverUrl } from "@/lib/fc-data/club-ids";

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

  const [scorers, cards] = await Promise.all([
    StatsRepository.getTournamentScorerRanking(id),
    StatsRepository.getTournamentCardRanking(id),
  ]);

  const standingsRows = tournament.standings.map((s) => ({
    id: s.id,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    points: s.points,
    nickname: s.participant.user.nickname,
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

  return (
    <>
      {!coverUrl && (
        <Header title={tournament.name} subtitle={typeInfo.label} />
      )}
      <div className="flex-1 overflow-y-auto pb-24">
        {coverUrl && tournament.fcLeague ? (
          <div className="relative h-44 sm:h-52 overflow-hidden border-b border-border">
            <LeagueCover
              coverUrl={coverUrl}
              alt={tournament.fcLeague.name}
              overlayClassName="from-background via-background/60 to-background/20"
            />
            <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-2">
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
        {coverUrl && (
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
        )}

        {!coverUrl && (
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{tournament.status}</Badge>
          <Badge variant="outline">{typeInfo.label}</Badge>
          {tournament.fcLeague && (
            <Badge variant="secondary">{tournament.fcLeague.name}</Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Organizado por{" "}
            <span className="font-medium text-foreground">
              {tournament.creator.nickname}
            </span>
            {isCreator && " (tú)"}
          </span>
          <span className="text-sm text-muted-foreground">
            {tournament._count.participants}/{tournament.maxParticipants}{" "}
            participantes · {tournament._count.matches} partidos
          </span>
          {isCreator && tournament._count.matches === 0 && (
            <GenerateFixtureButton tournamentId={tournament.id} />
          )}
          {isCreator && <DeleteTournamentButton tournamentId={tournament.id} />}
        </div>
        )}

        {tournament.joinCode && (
          <JoinCodeCard
            joinCode={tournament.joinCode}
            tournamentName={tournament.name}
          />
        )}

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

        {myParticipant?.fcTeamId && (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  Tu equipo: {myParticipant.fcTeam?.name ?? "Selección"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Consulta tu plantilla, formación inicial y stats de jugadores
                </p>
              </div>
              <Button asChild>
                <Link href={`/tournaments/${id}/my-team`}>Ver plantilla</Link>
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
                      Elige un club con plantilla completa: titulares, suplentes
                      y reservas
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
            <h2 className="mb-4 text-lg font-semibold">Partidos</h2>
            {tournament.matches.length > 0 ? (
              <div className="space-y-3">
                {tournament.matches.map((match) => {
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

        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-base">Participantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {tournament.participants.map((p) => {
                const isMe = p.userId === user?.id;
                const canViewSquad = p.fcTeamId && (isMe || isCreator);
                const href = canViewSquad
                  ? isMe
                    ? `/tournaments/${id}/my-team`
                    : `/tournaments/${id}/squads/${p.fcTeamId}`
                  : `/players/${p.user.id}`;

                return (
                <Link
                  key={p.id}
                  href={href}
                  className="flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-card-hover transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {p.fcTeam?.name?.slice(0, 2).toUpperCase() ??
                      p.user.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{p.user.nickname}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.fcTeam?.name ?? "Sin equipo"} · {p.user.elo} pts
                    </p>
                  </div>
                  {canViewSquad && (
                    <span className="text-xs text-primary shrink-0">Ver plantilla →</span>
                  )}
                </Link>
              );
              })}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
