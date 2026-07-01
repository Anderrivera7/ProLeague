import Link from "next/link";
import { getCurrentUser } from "@/actions/auth-actions";
import { MobileHeader } from "@/components/layout/mobile-header";
import { TournamentSlide } from "@/components/home/tournament-slide";
import { QuickActions } from "@/components/home/quick-actions";
import { ActivityItem } from "@/components/home/activity-item";
import { TournamentRepository } from "@/repositories/tournament-repository";
import { prisma } from "@/lib/prisma";
import { ChevronRight } from "lucide-react";
import type { TournamentType } from "@prisma/client";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [myTournaments, activities] = await Promise.all([
    prisma.tournament.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          { participants: { some: { userId: user.id } } },
        ],
        status: { in: ["ACTIVE", "REGISTRATION"] },
      },
      include: {
        _count: { select: { participants: true, matches: true } },
        matches: {
          where: { status: "COMPLETED" },
          select: { round: true },
          orderBy: { round: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  const activeTournaments = myTournaments.filter((t) => t.status === "ACTIVE");
  const upcomingTournaments = myTournaments.filter(
    (t) => t.status === "REGISTRATION"
  );

  const fallbackActive = await TournamentRepository.findAll({
    status: "ACTIVE",
    limit: 1,
  });
  const fallbackUpcoming = await TournamentRepository.findAll({
    status: "REGISTRATION",
    limit: 1,
  });

  const slides: Array<{
    id: string;
    name: string;
    type: TournamentType;
    participants: number;
    maxParticipants: number;
    status: "ACTIVE" | "REGISTRATION";
    variant: "active" | "upcoming";
    roundLabel?: string;
  }> = [];

  const active =
    activeTournaments[0] ?? fallbackActive[0];
  if (active) {
    const currentRound =
      "matches" in active && active.matches[0]?.round
        ? active.matches[0].round
        : 1;
    slides.push({
      id: active.id,
      name: active.name,
      type: active.type,
      participants: active._count.participants,
      maxParticipants: active.maxParticipants,
      status: "ACTIVE",
      variant: "active",
      roundLabel: `Jornada ${currentRound}`,
    });
  }

  const upcoming =
    upcomingTournaments[0] ?? fallbackUpcoming[0];
  if (upcoming && upcoming.id !== active?.id) {
    slides.push({
      id: upcoming.id,
      name: upcoming.name,
      type: upcoming.type,
      participants: upcoming._count.participants,
      maxParticipants: upcoming.maxParticipants,
      status: "REGISTRATION",
      variant: "upcoming",
    });
  }

  return (
    <div className="flex min-h-full flex-col pb-20">
      <MobileHeader nickname={user.nickname} />

      <div className="flex-1 space-y-6 px-4 pb-6">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Mis torneos</h2>
            <Link
              href="/tournaments"
              className="flex items-center gap-0.5 text-xs text-primary"
            >
              Ver todos
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {slides.length > 0 ? (
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none">
              {slides.map((t) => (
                <TournamentSlide key={t.id} {...t} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Aún no tienes torneos activos
              </p>
              <Link
                href="/tournaments/create"
                className="mt-2 inline-block text-sm font-medium text-primary"
              >
                Crear tu primer torneo
              </Link>
            </div>
          )}
        </section>

        <QuickActions />

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
