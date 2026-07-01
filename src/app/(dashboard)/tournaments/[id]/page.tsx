import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MatchCard } from "@/features/matches/components/match-card";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { TOURNAMENT_TYPES } from "@/constants";
import { GenerateFixtureButton } from "@/features/tournaments/components/generate-fixture-button";
import { DeleteTournamentButton } from "@/features/tournaments/components/delete-tournament-button";
import { getCurrentUser } from "@/actions/auth-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TournamentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [tournament, user] = await Promise.all([
    TournamentRepository.findById(id),
    getCurrentUser(),
  ]);

  if (!tournament) notFound();

  const isCreator = user?.id === tournament.creatorId;
  const typeInfo = TOURNAMENT_TYPES[tournament.type];

  return (
    <>
      <Header title={tournament.name} subtitle={typeInfo.label} />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{tournament.status}</Badge>
          <Badge variant="outline">{typeInfo.label}</Badge>
          <span className="text-sm text-muted-foreground">
            {tournament._count.participants} participantes ·{" "}
            {tournament._count.matches} partidos
          </span>
          {isCreator && tournament._count.matches === 0 && (
            <GenerateFixtureButton tournamentId={tournament.id} />
          )}
          {isCreator && (
            <DeleteTournamentButton tournamentId={tournament.id} />
          )}
        </div>

        {tournament.description && (
          <p className="text-muted-foreground">{tournament.description}</p>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {tournament.standings.length > 0 && (
            <Card className="glass lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base">Tabla de Posiciones</CardTitle>
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
                {tournament.matches.map((match) => (
                  <MatchCard key={match.id} match={match as never} />
                ))}
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
              {tournament.participants.map((p) => (
                <Link
                  key={p.id}
                  href={`/players/${p.user.id}`}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-card-hover transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                    {p.user.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{p.user.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      ELO {p.user.elo}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
