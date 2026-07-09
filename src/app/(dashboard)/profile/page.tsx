import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/actions/auth-actions";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { ActivityItem } from "@/components/home/activity-item";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementService } from "@/services/achievement-service";
import { prisma } from "@/lib/prisma";
import { UserRepository } from "@/repositories/user-repository";
import { formatTimeAgo, getInitials } from "@/lib/utils";
import { getLevelProgress } from "@/utils/points";
import {
  Award,
  BarChart3,
  ChevronRight,
  Gamepad2,
  Medal,
  Pencil,
  Shield,
  Star,
  Swords,
  Trophy,
  User,
  Users,
} from "lucide-react";

const menuItems = [
  { href: "/players", label: "Mis equipos", icon: Users, color: "text-primary bg-primary/15" },
  { href: "/profile/achievements", label: "Logros", icon: Award, color: "text-amber-400 bg-amber-400/15" },
  { href: "/stats", label: "Estadísticas", icon: BarChart3, color: "text-sky-400 bg-sky-400/15" },
  { href: "/matches", label: "Historial", icon: Gamepad2, color: "text-violet-400 bg-violet-400/15" },
  { href: "/rankings", label: "Ranking", icon: Medal, color: "text-amber-400 bg-amber-400/15" },
];

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const [user, rankInfo, recentActivities] = await Promise.all([
    AchievementService.syncForUser(session.id, prisma).then(() =>
      UserRepository.findProfileCardById(session.id)
    ),
    UserRepository.getRankInfo(session.elo),
    prisma.activity.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, type: true, title: true, createdAt: true },
    }),
  ]);

  if (!user) redirect("/login");

  const progress = getLevelProgress(user.elo);
  const matches = user.stats?.matchesPlayed ?? 0;
  const wins = user.stats?.wins ?? 0;
  const winRate = matches > 0 ? Math.round((wins / matches) * 100) : 0;
  const topPercent =
    rankInfo.total > 0
      ? Math.max(1, Math.round((rankInfo.rank / rankInfo.total) * 100))
      : 100;

  const statCards = [
    {
      label: "Victorias",
      value: wins,
      sub: matches > 0 ? `Win rate ${winRate}%` : "Sin partidos",
      icon: Trophy,
      accent: "text-primary",
    },
    {
      label: "Partidos",
      value: matches,
      sub: `${user.stats?.draws ?? 0}E · ${user.stats?.losses ?? 0}D`,
      icon: Swords,
      accent: "text-sky-400",
    },
    {
      label: "Puntos",
      value: user.elo,
      sub: `Ranking #${rankInfo.rank}`,
      icon: Star,
      accent: "text-amber-400",
    },
    {
      label: "Títulos",
      value: user.stats?.titlesWon ?? 0,
      sub: `${user.stats?.seasonsPlayed ?? 0} temporadas`,
      icon: BarChart3,
      accent: "text-violet-400",
    },
  ];

  return (
    <div className="flex min-h-full flex-col pb-24">
      <div className="space-y-6 px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-center glow-primary">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
          <div className="relative mx-auto w-fit">
            <Avatar className="h-24 w-24 border-4 border-primary/40 shadow-[0_0_24px_rgba(57,255,20,0.25)]">
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                {getInitials(user.nickname)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-primary/40 bg-card px-2.5 py-0.5 text-xs font-bold text-primary">
              Nv. {user.level}
            </div>
          </div>

          <h1 className="relative mt-5 text-2xl font-bold">{user.nickname}</h1>
          <div className="relative mt-2 flex flex-wrap items-center justify-center gap-2">
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              Jugador activo
            </Badge>
            {user.country && <Badge variant="outline">{user.country}</Badge>}
          </div>

          <p className="relative mt-2 text-sm text-muted-foreground">
            Nivel {progress.level} · {user.elo} XP
          </p>

          <div className="relative mx-auto mt-4 max-w-xs">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>{progress.xpInLevel} XP</span>
              <span>{progress.percent}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {progress.xpRemaining} XP para llegar a Nivel {progress.level + 1}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {statCards.map((stat) => (
            <Card key={stat.label} className="glass border-border/80">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{stat.sub}</p>
                  </div>
                  <div className="rounded-xl bg-muted p-2">
                    <stat.icon className={`h-4 w-4 ${stat.accent}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-primary" />
                Logros
              </CardTitle>
              <Link href="/profile/achievements" className="text-xs text-primary">
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="space-y-2">
              {user.achievements.length > 0 ? (
                user.achievements.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2"
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Trophy className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {entry.achievement.title}
                    </span>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  Aún no has desbloqueado logros
                </p>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Última actividad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      type={activity.type}
                      title={activity.title}
                      createdAt={activity.createdAt}
                    />
                  ))
                ) : (
                  <p className="py-2 text-sm text-muted-foreground">
                    Sin actividad reciente. Juega un partido para empezar.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="glass overflow-hidden">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/15">
                  <Shield className="h-6 w-6 text-violet-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">Ranking #{rankInfo.rank}</p>
                  <p className="text-xs text-muted-foreground">
                    Top {topPercent}% de jugadores
                  </p>
                  {user.lastActiveAt && (
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Activo {formatTimeAgo(user.lastActiveAt)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <nav className="space-y-1 rounded-2xl border border-border bg-card p-2">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-card-hover"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${item.color}`}>
                <item.icon className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
          <div className="px-1 pt-1">
            <SignOutButton />
          </div>
        </nav>

        <div className="space-y-2">
          <Button className="w-full" asChild>
            <Link href={`/players/${user.id}`}>
              <User className="mr-2 h-4 w-4" />
              Ver perfil completo
            </Link>
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" asChild>
            <Link href="/profile/edit">
              <Pencil className="mr-2 h-4 w-4" />
              Editar perfil
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
