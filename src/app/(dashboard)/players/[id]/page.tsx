import { notFound } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/layout/header";
import { StatCard } from "@/components/shared/stat-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceChart } from "@/features/players/components/performance-chart";
import { HeadToHeadPanel } from "@/features/players/components/head-to-head-panel";
import { UserRepository } from "@/repositories/user-repository";
import { StatsRepository } from "@/repositories/stats-repository";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveTrophyImage } from "@/lib/fc-data/league-trophies";
import { getInitials } from "@/lib/utils";
import { positiveStreak } from "@/utils/match-stats";
import {
  Swords,
  Trophy,
  Target,
  TrendingUp,
  Award,
  Scale,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PlayerProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [player, currentUser] = await Promise.all([
    UserRepository.findProfileById(id),
    getCurrentUser(),
  ]);

  if (!player) notFound();

  const isOwnProfile = currentUser?.id === player.id;

  let h2hStats = null;
  let h2hMatches: never[] = [];

  if (currentUser && !isOwnProfile) {
    [h2hStats, h2hMatches] = await Promise.all([
      StatsRepository.getHeadToHead(currentUser.id, player.id),
      StatsRepository.getHeadToHeadMatches(currentUser.id, player.id, 5),
    ]) as [typeof h2hStats, typeof h2hMatches];
  }

  const performanceData = [
    { date: "Ene", elo: player.elo - 50, wins: 2, losses: 1 },
    { date: "Feb", elo: player.elo - 30, wins: 3, losses: 1 },
    { date: "Mar", elo: player.elo - 10, wins: 4, losses: 2 },
    { date: "Abr", elo: player.elo, wins: player.stats?.wins ?? 0, losses: player.stats?.losses ?? 0 },
  ];

  return (
    <>
      <Header
        title={player.nickname}
        subtitle={isOwnProfile ? "Tu perfil" : `Perfil de ${player.nickname}`}
      />
      <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <Card className="glass overflow-hidden">
          <div className="relative h-28 overflow-hidden sm:h-36">
            <Image
              src="/banners/stadium-night.png"
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 768px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/20" />
          </div>
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col items-start gap-4 -mt-10 sm:flex-row sm:items-end">
              <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                <AvatarImage src={player.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl">
                  {getInitials(player.nickname)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pt-2 sm:pb-1 sm:pt-0">
                <h2 className="text-2xl font-bold">{player.nickname}</h2>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Badge variant="outline">Nivel {player.level}</Badge>
                  <Badge>{player.elo} pts</Badge>
                  {player.country && (
                    <Badge variant="secondary">{player.country}</Badge>
                  )}
                  {player.favoriteTeam && (
                    <Badge variant="outline">{player.favoriteTeam.name}</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!isOwnProfile && currentUser && (
          <div className="flex flex-col gap-3">
            <Link
              href={`/players/compare?a=${currentUser.id}&b=${player.id}`}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
            >
              <Scale className="h-4 w-4" />
              Comparar contigo
            </Link>
            <HeadToHeadPanel
              opponentNickname={player.nickname}
              stats={h2hStats}
              recentMatches={h2hMatches}
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Partidos"
            value={player.stats?.matchesPlayed ?? 0}
            subtitle={`${player.stats?.wins ?? 0}V · ${player.stats?.draws ?? 0}E · ${player.stats?.losses ?? 0}D`}
            icon={Swords}
          />
          <StatCard
            title="Goles"
            value={player.stats?.goalsFor ?? 0}
            subtitle={`${(player.stats?.avgGoalsPerGame ?? 0).toFixed(1)} por partido`}
            icon={Target}
          />
          <StatCard
            title="Títulos"
            value={player.trophies.length}
            subtitle={`${player.stats?.seasonsPlayed ?? 0} temporadas`}
            icon={Trophy}
          />
          <StatCard
            title="Sin perder"
            value={player.stats?.bestStreak ?? 0}
            subtitle={
              positiveStreak(player.stats?.currentStreak ?? 0) > 0
                ? `Actual: ${positiveStreak(player.stats?.currentStreak ?? 0)}`
                : "Sin racha activa"
            }
            icon={TrendingUp}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <PerformanceChart data={performanceData} />

          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Trofeos
                {player.trophies.length > 0 && (
                  <span className="text-xs font-normal text-muted-foreground">
                    · {player.trophies.length}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[28rem] space-y-2 overflow-y-auto overscroll-contain pr-1">
              {player.trophies.length > 0 ? (
                player.trophies.map((trophy) => {
                  const league = trophy.tournament?.fcLeague;
                  const url = resolveTrophyImage(
                    trophy.imageUrl,
                    league?.fifaIndexId,
                    league?.name ?? trophy.tournament?.name ?? trophy.title
                  );
                  return (
                    <div
                      key={trophy.id}
                      className="flex items-center gap-3 rounded-lg bg-card-hover p-3"
                    >
                      <div className="relative flex h-14 w-12 shrink-0 items-end justify-center">
                        {url ? (
                          <Image
                            src={url}
                            alt={trophy.title}
                            width={48}
                            height={56}
                            className="h-14 w-auto object-contain"
                            unoptimized={url.startsWith("http")}
                          />
                        ) : (
                          <Trophy className="h-8 w-8 text-primary" />
                        )}
                        {trophy.clubCrestUrl && (
                          <div className="absolute -bottom-0.5 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card p-0.5">
                            <Image
                              src={trophy.clubCrestUrl}
                              alt={trophy.clubName ?? ""}
                              width={16}
                              height={16}
                              className="h-4 w-4 object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{trophy.title}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {trophy.clubName ?? league?.name ?? "Campeón"}
                        </p>
                      </div>
                      <Badge variant="outline">#{trophy.placement}</Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  Sin trofeos aún
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {player.stats?.goalDifference ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">Diferencia de Goles</p>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              {player.stats?.biggestWinFor ? (
                <>
                  <p className="text-2xl font-bold text-primary">
                    {player.stats.biggestWinFor}-{player.stats.biggestWinAgainst}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mayor Goleada
                    {player.stats.biggestWinOpponent?.nickname
                      ? ` vs ${player.stats.biggestWinOpponent.nickname}`
                      : ""}
                  </p>
                </>
              ) : player.stats?.biggestWin ? (
                <>
                  <p className="text-2xl font-bold text-primary">
                    +{player.stats.biggestWin}
                  </p>
                  <p className="text-xs text-muted-foreground">Mayor Goleada</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold text-primary">—</p>
                  <p className="text-xs text-muted-foreground">Mayor Goleada</p>
                </>
              )}
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {player.stats?.totalMvp ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">MVPs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
