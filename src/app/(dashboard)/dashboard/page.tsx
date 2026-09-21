import Link from "next/link";
import { Suspense } from "react";
import { getSessionUser } from "@/actions/auth-actions";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TournamentSlide } from "@/components/home/tournament-slide";
import { QuickActions } from "@/components/home/quick-actions";
import { ActivityItem } from "@/components/home/activity-item";
import { PendingMatchesReminder } from "@/components/home/pending-matches-reminder";
import { OnboardingChecklist } from "@/components/home/onboarding-checklist";
import { RealFootballSection } from "@/features/football/components/real-football-section";
import { prisma } from "@/lib/prisma";
import { ChevronRight, KeyRound, Swords, Trophy } from "lucide-react";
import { getLeagueCoverUrl } from "@/lib/fc-data/club-ids";
import type { TournamentType } from "@prisma/client";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const tournamentSelect = {
    id: true,
    name: true,
    type: true,
    status: true,
    maxParticipants: true,
    createdAt: true,
    fcLeague: {
      select: { fifaIndexId: true, name: true },
    },
    _count: { select: { participants: true } },
    matches: {
      where: { status: "COMPLETED" as const },
      select: { round: true },
      orderBy: { round: "desc" as const },
      take: 1,
    },
  };

  const myTournamentWhere = {
    OR: [
      { creatorId: user.id },
      { participants: { some: { userId: user.id } } },
    ],
  };

  const [
    openTournaments,
    finishedTournaments,
    activities,
    pendingMatchRows,
    crewMemberships,
  ] = await Promise.all([
      prisma.tournament.findMany({
        where: {
          ...myTournamentWhere,
          status: { in: ["ACTIVE", "REGISTRATION"] },
        },
        select: tournamentSelect,
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
      prisma.tournament.findMany({
        where: {
          ...myTournamentWhere,
          status: "COMPLETED",
        },
        select: tournamentSelect,
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.activity.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          type: true,
          title: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.match.findMany({
        where: {
          status: { in: ["SCHEDULED", "PENDING_CONFIRMATION"] },
          OR: [
            { homeParticipant: { userId: user.id } },
            { awayParticipant: { userId: user.id } },
          ],
        },
        select: {
          id: true,
          status: true,
          homeScore: true,
          awayScore: true,
          proposedByUserId: true,
          tournament: { select: { name: true } },
          homeParticipant: {
            select: { user: { select: { nickname: true } } },
          },
          awayParticipant: {
            select: { user: { select: { nickname: true } } },
          },
        },
        orderBy: [{ scheduledAt: "asc" }, { createdAt: "desc" }],
        take: 5,
      }),
      prisma.crewMember.findMany({
        where: { userId: user.id },
        select: {
          crew: { select: { id: true, joinCode: true } },
        },
        take: 1,
      }),
    ]);

  const myTournaments = [...openTournaments, ...finishedTournaments];

  const pendingMatches = pendingMatchRows.length;
  const hasCrew = crewMemberships.length > 0;
  const firstCrew = crewMemberships[0]?.crew ?? null;

  const pendingReminders = pendingMatchRows.map((m) => ({
    id: m.id,
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    proposedByUserId: m.proposedByUserId,
    tournamentName: m.tournament.name,
    homeNickname: m.homeParticipant.user.nickname,
    awayNickname: m.awayParticipant.user.nickname,
    needsConfirm:
      m.status === "PENDING_CONFIRMATION" &&
      m.proposedByUserId !== null &&
      m.proposedByUserId !== user.id,
  }));

  const activeTournaments = openTournaments.filter((t) => t.status === "ACTIVE");
  const upcomingTournaments = openTournaments.filter(
    (t) => t.status === "REGISTRATION"
  );
  const completedTournaments = finishedTournaments;

  const slides: Array<{
    id: string;
    name: string;
    type: TournamentType;
    participants: number;
    maxParticipants: number;
    status: "ACTIVE" | "REGISTRATION" | "COMPLETED";
    variant: "active" | "upcoming" | "completed";
    roundLabel?: string;
    coverUrl?: string | null;
    leagueName?: string;
  }> = [];

  function slideFromTournament(
    t: (typeof myTournaments)[number],
    variant: "active" | "upcoming" | "completed",
    status: "ACTIVE" | "REGISTRATION" | "COMPLETED",
    roundLabel?: string
  ) {
    return {
      id: t.id,
      name: t.name,
      type: t.type,
      participants: t._count.participants,
      maxParticipants: t.maxParticipants,
      status,
      variant,
      roundLabel,
      coverUrl: t.fcLeague
        ? getLeagueCoverUrl(t.fcLeague.fifaIndexId, t.fcLeague.name)
        : null,
      leagueName: t.fcLeague?.name,
    };
  }

  for (const t of activeTournaments.slice(0, 3)) {
    const currentRound = t.matches?.[0]?.round ?? 1;
    slides.push(
      slideFromTournament(t, "active", "ACTIVE", `Jornada ${currentRound}`)
    );
  }

  for (const t of upcomingTournaments.slice(0, 2)) {
    if (slides.some((s) => s.id === t.id)) continue;
    slides.push(slideFromTournament(t, "upcoming", "REGISTRATION"));
  }

  for (const t of completedTournaments.slice(0, 3)) {
    if (slides.some((s) => s.id === t.id)) continue;
    slides.push(slideFromTournament(t, "completed", "COMPLETED", "Finalizado"));
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="flex min-h-full flex-col lg:pb-2">
      <MobileHeader nickname={user.nickname} />

      <div className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-3 pb-6 sm:space-y-6 sm:px-4 lg:px-8">
        <section className="rounded-3xl border border-white/8 bg-gradient-to-br from-primary/15 via-card to-background px-4 py-4 sm:px-5 sm:py-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/90">
            {greeting}
          </p>
          <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
            Hola, {user.nickname}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {slides.length > 0
              ? "Sigue tus torneos y partidos pendientes."
              : "Empieza uniéndote a un torneo o creando el tuyo."}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Link
              href="/tournaments"
              className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5 transition-colors hover:border-primary/30"
            >
              <Trophy className="mb-1 h-3.5 w-3.5 text-primary" />
              <p className="text-lg font-bold tabular-nums">{myTournaments.length}</p>
              <p className="text-[10px] text-muted-foreground">Mis torneos</p>
            </Link>
            <Link
              href="/matches"
              className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5 transition-colors hover:border-sky-500/30"
            >
              <Swords className="mb-1 h-3.5 w-3.5 text-sky-400" />
              <p className="text-lg font-bold tabular-nums">{pendingMatches}</p>
              <p className="text-[10px] text-muted-foreground">Pendientes</p>
            </Link>
            <Link
              href="/tournaments/join"
              className="rounded-2xl border border-white/8 bg-black/20 px-3 py-2.5 transition-colors hover:border-amber-500/30"
            >
              <KeyRound className="mb-1 h-3.5 w-3.5 text-amber-400" />
              <p className="text-lg font-bold">+</p>
              <p className="text-[10px] text-muted-foreground">Con código</p>
            </Link>
          </div>
        </section>

        <OnboardingChecklist
          hasCrew={hasCrew}
          crewInviteHref={firstCrew ? `/crews/${firstCrew.id}` : null}
          hasTournament={slides.length > 0 || myTournaments.length > 0}
        />

        <PendingMatchesReminder matches={pendingReminders} />

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Mis torneos</h2>
            <Link
              href="/tournaments"
              className="flex shrink-0 items-center gap-0.5 text-xs text-primary"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {slides.length > 0 ? (
            <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 scrollbar-none sm:-mx-4 sm:px-4 touch-pan-x">
              {slides.map((t) => (
                <TournamentSlide key={t.id} {...t} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center sm:p-6">
              <p className="text-sm text-muted-foreground">
                Aún no estás inscrito en ningún torneo. Entrá con un código de
                invitación.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/tournaments/join"
                  className="text-sm font-medium text-primary"
                >
                  Unirme con código
                </Link>
                <Link
                  href="/tournaments/create"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  Crear torneo
                </Link>
              </div>
            </div>
          )}
        </section>

        <QuickActions />

        <Suspense fallback={null}>
          <RealFootballSection userId={user.id} />
        </Suspense>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Actividad reciente
          </h2>
          {activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  type={activity.type}
                  title={activity.title}
                  createdAt={activity.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-4 text-center text-sm text-muted-foreground">
              Sin actividad reciente. ¡Juega tu primer partido!
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
