import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchCard } from "@/features/matches/components/match-card";
import { JoinCodeCard } from "@/features/tournaments/components/join-code-card";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TournamentService } from "@/services/tournament-service";
import { TOURNAMENT_TYPES } from "@/constants";
import { GenerateFixtureButton } from "@/features/tournaments/components/generate-fixture-button";
import { DeleteTournamentButton } from "@/features/tournaments/components/delete-tournament-button";
import { getCurrentUser } from "@/actions/auth-actions";

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

  return (
    <>
      <Header title={tournament.name} subtitle={typeInfo.label} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 pb-24">
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
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">Aún no has elegido equipo</p>
                <p className="text-sm text-muted-foreground">
                  Selecciona tu selección o club para competir
                </p>
              </div>
              <Button asChild>
                <Link href={`/tournaments/${id}/select-team`}>
                  Elegir equipo
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {tournament.description && (
          <p className="text-muted-foreground">{tournament.description}</p>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {tournament.standings.length > 0 && (
            <Card className="glass lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Tabla de posiciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-8 gap-1 text-xs text-muted-foreground font-medium pb-2 border-b border-border">
                    <span className="col-span-3">Jugador</span>
                    <span className="text-center">PJ</span>
                    <span className="text-center">G</span>
                    <span className="text-center">E</span>
                    <span className="text-center">P</span>
                    <span className="text-center">Pts</span>
                  </div>
                  {tournament.standings.map((s, i) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-8 gap-1 items-center py-1"
                    >
                      <span className="col-span-3 truncate font-medium">
                        {i + 1}. {s.participant.user.nickname}
                      </span>
                      <span className="text-center">{s.played}</span>
                      <span className="text-center">{s.won}</span>
                      <span className="text-center">{s.drawn}</span>
                      <span className="text-center">{s.lost}</span>
                      <span className="text-center font-bold text-primary">
                        {s.points}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className={tournament.standings.length > 0 ? "lg:col-span-2" : "lg:col-span-3"}>
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
    </>
  );
}
