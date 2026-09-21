import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Badge } from "@/components/ui/badge";
import { HeadToHeadPanel } from "@/features/players/components/head-to-head-panel";
import { getSessionUser } from "@/actions/auth-actions";
import { prisma } from "@/lib/prisma";
import { StatsRepository } from "@/repositories/stats-repository";
import { Crown, Swords, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

async function loadPlayer(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nickname: true,
      avatarUrl: true,
      elo: true,
      level: true,
      _count: { select: { trophies: true } },
      stats: {
        select: {
          titlesWon: true,
          wins: true,
          draws: true,
          losses: true,
          matchesPlayed: true,
          goalsFor: true,
          goalsAgainst: true,
          biggestWin: true,
          relegations: true,
          currentStreak: true,
          bestStreak: true,
        },
      },
    },
  });
}

function StatRow({
  label,
  a,
  b,
  higherWins = true,
}: {
  label: string;
  a: number;
  b: number;
  higherWins?: boolean;
}) {
  const aWins = higherWins ? a > b : a < b;
  const bWins = higherWins ? b > a : b < a;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-white/5 py-2.5 last:border-0">
      <p
        className={cn(
          "text-right text-base font-bold tabular-nums",
          aWins && "text-primary"
        )}
      >
        {a}
      </p>
      <p className="min-w-[5.5rem] text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "text-left text-base font-bold tabular-nums",
          bWins && "text-primary"
        )}
      >
        {b}
      </p>
    </div>
  );
}

export default async function ComparePlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const { a, b } = await searchParams;
  const idA = a || session.id;
  const idB = b;
  if (!idB || idA === idB) notFound();

  const [playerA, playerB, h2h, recent] = await Promise.all([
    loadPlayer(idA),
    loadPlayer(idB),
    StatsRepository.getHeadToHead(idA, idB),
    StatsRepository.getHeadToHeadMatches(idA, idB, 5),
  ]);

  if (!playerA || !playerB) notFound();

  const sa = playerA.stats;
  const sb = playerB.stats;

  return (
    <>
      <Header
        title="Comparativa"
        subtitle={`${playerA.nickname} vs ${playerB.nickname}`}
      />
      <div className="mx-auto max-w-2xl space-y-4 px-3 py-4 sm:px-4 lg:px-6 lg:py-6">
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0a0a0a]">
          <div className="grid grid-cols-2 gap-2 border-b border-white/8 p-4">
            {[playerA, playerB].map((p, i) => (
              <Link
                key={p.id}
                href={`/players/${p.id}`}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl p-3",
                  i === 0 ? "bg-primary/10" : "bg-white/[0.03]"
                )}
              >
                <UserAvatar
                  nickname={p.nickname}
                  avatarUrl={p.avatarUrl}
                  size={56}
                />
                <p className="truncate text-sm font-bold">{p.nickname}</p>
                <div className="flex flex-wrap justify-center gap-1">
                  <Badge variant="outline" className="rounded-full text-[9px]">
                    Nv. {p.level}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[9px]">
                    {p.elo} pts
                  </Badge>
                  {p.id === session.id && (
                    <Badge className="rounded-full bg-primary text-[9px] text-black">
                      Tú
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>

          <div className="px-4 py-2">
            <StatRow
              label="Títulos"
              a={playerA._count.trophies}
              b={playerB._count.trophies}
            />
            <StatRow label="Victorias" a={sa?.wins ?? 0} b={sb?.wins ?? 0} />
            <StatRow label="Empates" a={sa?.draws ?? 0} b={sb?.draws ?? 0} />
            <StatRow
              label="Derrotas"
              a={sa?.losses ?? 0}
              b={sb?.losses ?? 0}
              higherWins={false}
            />
            <StatRow
              label="Partidos"
              a={sa?.matchesPlayed ?? 0}
              b={sb?.matchesPlayed ?? 0}
            />
            <StatRow
              label="Goles"
              a={sa?.goalsFor ?? 0}
              b={sb?.goalsFor ?? 0}
            />
            <StatRow
              label="Goleada"
              a={sa?.biggestWin ?? 0}
              b={sb?.biggestWin ?? 0}
            />
            <StatRow
              label="Descensos"
              a={sa?.relegations ?? 0}
              b={sb?.relegations ?? 0}
              higherWins={false}
            />
            <StatRow
              label="Sin perder"
              a={sa?.currentStreak ?? 0}
              b={sb?.currentStreak ?? 0}
            />
            <StatRow
              label="Mejor racha"
              a={sa?.bestStreak ?? 0}
              b={sb?.bestStreak ?? 0}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-white/8 p-3 text-center text-[10px] text-muted-foreground">
            <div className="flex flex-col items-center gap-1">
              <Trophy className="h-3.5 w-3.5 text-primary" />
              Títulos
            </div>
            <div className="flex flex-col items-center gap-1">
              <Swords className="h-3.5 w-3.5 text-sky-400" />
              Cara a cara
            </div>
            <div className="flex flex-col items-center gap-1">
              <Target className="h-3.5 w-3.5 text-amber-400" />
              Goles
            </div>
          </div>
        </section>

        <HeadToHeadPanel
          opponentNickname={playerB.nickname}
          stats={h2h}
          recentMatches={recent as never}
        />

        <p className="text-center text-xs text-muted-foreground">
          <Crown className="mr-1 inline h-3 w-3 text-primary" />
          Los números en verde van ganando esa fila
        </p>
      </div>
    </>
  );
}
