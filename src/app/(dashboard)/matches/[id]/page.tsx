import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchEventsSummary } from "@/features/matches/components/match-events-summary";
import { ReportMatchResultForm } from "@/features/matches/components/report-match-result-form";
import { HeadToHeadPanel } from "@/features/players/components/head-to-head-panel";
import { MatchRepository } from "@/repositories/match-repository";
import { StatsRepository } from "@/repositories/stats-repository";
import { TeamService } from "@/services/team-service";
import { getCurrentUser } from "@/actions/auth-actions";
import { formatDateTime } from "@/lib/utils";
import { ArrowLeft, ClipboardEdit } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ report?: string }>;
}

const statusLabel = {
  SCHEDULED: "Programado",
  LIVE: "En vivo",
  COMPLETED: "Finalizado",
  CANCELLED: "Cancelado",
  WALKOVER: "Walkover",
};

export default async function MatchDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { report } = await searchParams;
  const [match, user] = await Promise.all([
    MatchRepository.findById(id),
    getCurrentUser(),
  ]);

  if (!match || !user) notFound();

  const homeUser = match.homeParticipant.user;
  const awayUser = match.awayParticipant.user;
  const homeTeam = match.homeParticipant.fcTeam;
  const awayTeam = match.awayParticipant.fcTeam;

  const isParticipant =
    homeUser.id === user.id || awayUser.id === user.id;
  const isCreator = match.tournament.creatorId === user.id;
  const canReport =
    match.status === "SCHEDULED" && (isParticipant || isCreator);
  const showForm = canReport && report === "1";

  const h2hPerspectiveId = isParticipant ? user.id : homeUser.id;
  const h2hOpponentId =
    h2hPerspectiveId === homeUser.id ? awayUser.id : homeUser.id;
  const h2hOpponentLabel =
    h2hPerspectiveId === homeUser.id
      ? awayTeam?.name ?? awayUser.nickname
      : homeTeam?.name ?? homeUser.nickname;

  const [h2hStats, h2hMatches, homeSquad, awaySquad] = await Promise.all([
    StatsRepository.getHeadToHead(h2hPerspectiveId, h2hOpponentId),
    StatsRepository.getHeadToHeadMatches(h2hPerspectiveId, h2hOpponentId, 5),
    homeTeam?.id
      ? TeamService.getOrSyncById(homeTeam.id).then((r) => r.team.players)
      : Promise.resolve([]),
    awayTeam?.id
      ? TeamService.getOrSyncById(awayTeam.id).then((r) => r.team.players)
      : Promise.resolve([]),
  ]);

  const isCompleted = match.status === "COMPLETED";
  const homeTeamName = homeTeam?.name ?? homeUser.nickname;
  const awayTeamName = awayTeam?.name ?? awayUser.nickname;

  return (
    <>
      <Header
        title={`${homeTeamName} vs ${awayTeamName}`}
        subtitle={`${homeUser.nickname} · ${awayUser.nickname} · ${match.tournament.name}`}
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6 pb-24">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/tournaments/${match.tournamentId}`}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              Torneo
            </Link>
          </Button>
          <Badge>{statusLabel[match.status]}</Badge>
          {match.round > 0 && (
            <Badge variant="outline">Ronda {match.round}</Badge>
          )}
          {match.groupName && (
            <Badge variant="secondary">Grupo {match.groupName}</Badge>
          )}
        </div>

        <Card className="glass">
          <CardContent className="py-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 text-right">
                <p className="text-lg font-bold">{homeTeamName}</p>
                <Link
                  href={`/players/${homeUser.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {homeUser.nickname}
                </Link>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-3 rounded-xl bg-muted px-6 py-3 font-mono text-3xl font-bold">
                  {isCompleted ? (
                    <>
                      <span>{match.homeScore}</span>
                      <span className="text-muted-foreground text-xl">—</span>
                      <span>{match.awayScore}</span>
                    </>
                  ) : (
                    <span className="text-lg text-muted-foreground">vs</span>
                  )}
                </div>
                {match.playedAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(match.playedAt)}
                  </p>
                )}
                {match.scheduledAt && !match.playedAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(match.scheduledAt)}
                  </p>
                )}
              </div>

              <div className="flex-1 text-left">
                <p className="text-lg font-bold">{awayTeamName}</p>
                <Link
                  href={`/players/${awayUser.id}`}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {awayUser.nickname}
                </Link>
              </div>
            </div>

            {canReport && !showForm && (
              <div className="mt-6 flex justify-center">
                <Button asChild>
                  <Link href={`/matches/${id}?report=1`}>
                    <ClipboardEdit className="mr-2 h-4 w-4" />
                    Anotar resultado
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <HeadToHeadPanel
          opponentNickname={h2hOpponentLabel}
          stats={h2hStats}
          recentMatches={h2hMatches as never[]}
        />

        {showForm && (
          <ReportMatchResultForm
            matchId={match.id}
            players={[
              {
                userId: homeUser.id,
                nickname: homeUser.nickname,
                teamName: homeTeamName,
                crestUrl: homeTeam?.crestUrl ?? null,
                side: "home",
                squad: homeSquad.map((p) => ({ id: p.id, name: p.name })),
              },
              {
                userId: awayUser.id,
                nickname: awayUser.nickname,
                teamName: awayTeamName,
                crestUrl: awayTeam?.crestUrl ?? null,
                side: "away",
                squad: awaySquad.map((p) => ({ id: p.id, name: p.name })),
              },
            ]}
          />
        )}

        {isCompleted && (
          <MatchEventsSummary
            playerStats={match.playerStats}
            mvpNickname={match.mvpUser?.nickname}
            penaltiesHome={match.penaltiesHome}
            penaltiesAway={match.penaltiesAway}
          />
        )}
      </div>
    </>
  );
}
