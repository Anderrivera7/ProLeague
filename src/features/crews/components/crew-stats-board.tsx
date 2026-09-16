import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowDownToLine,
  Crown,
  Medal,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLeagueTrophyUrl } from "@/lib/fc-data/league-trophies";
import { cn, getInitials } from "@/lib/utils";
import type {
  CrewBoardCategory,
  CrewBoardEntry,
  CrewPodiumEntry,
} from "@/services/crew-service";

interface CrewStatsBoardProps {
  boards: CrewBoardCategory[];
  titlesDetail: CrewPodiumEntry[];
  crewName: string;
  memberCount: number;
}

const podiumOrder = [1, 0, 2] as const;
const podiumHeights = ["h-28", "h-36", "h-24"] as const;

const boardMeta = {
  titles: {
    icon: Trophy,
    accent: "text-primary",
    bar: "from-primary/25 via-primary/10 to-transparent",
    medal: "bg-primary/15 text-primary border-primary/30",
  },
  relegations: {
    icon: ArrowDownToLine,
    accent: "text-rose-400",
    bar: "from-rose-500/20 via-rose-500/5 to-transparent",
    medal: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  thrashings: {
    icon: Swords,
    accent: "text-amber-400",
    bar: "from-amber-500/20 via-amber-500/5 to-transparent",
    medal: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  wins: {
    icon: Medal,
    accent: "text-sky-400",
    bar: "from-sky-500/20 via-sky-500/5 to-transparent",
    medal: "bg-sky-500/15 text-sky-400 border-sky-500/30",
  },
} as const;

const rankStyles = {
  1: {
    shell: "border-yellow-400/35 bg-gradient-to-b from-yellow-400/15 to-transparent",
    glow: "bg-yellow-400/25",
    badge: "bg-yellow-400 text-black",
  },
  2: {
    shell: "border-zinc-300/30 bg-gradient-to-b from-zinc-300/10 to-transparent",
    glow: "bg-zinc-300/20",
    badge: "bg-zinc-300 text-zinc-900",
  },
  3: {
    shell: "border-amber-700/35 bg-gradient-to-b from-amber-700/15 to-transparent",
    glow: "bg-amber-700/25",
    badge: "bg-amber-700 text-amber-50",
  },
} as const;

function AvatarBubble({
  nickname,
  avatarUrl,
  size = "md",
}: {
  nickname: string;
  avatarUrl?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "h-12 w-12 text-sm" : size === "sm" ? "h-8 w-8 text-[10px]" : "h-10 w-10 text-xs";

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={nickname}
        width={48}
        height={48}
        className={cn("rounded-full object-cover ring-2 ring-border/60", dim)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-primary/15 font-bold text-primary ring-2 ring-border/60",
        dim
      )}
    >
      {getInitials(nickname)}
    </div>
  );
}

function MiniPodium({ board }: { board: CrewBoardCategory }) {
  const topThree = board.entries.slice(0, 3);
  const meta = boardMeta[board.id];
  const Icon = meta.icon;
  const empty = topThree.every((e) => e.value === 0);

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#161616] via-[#101010] to-[#0b0b0b]">
      <div className={cn("border-b border-border/50 bg-gradient-to-r px-4 py-3", meta.bar)}>
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl border",
              meta.medal
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{board.title}</h3>
            <p className="truncate text-[11px] text-muted-foreground">
              {board.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="px-3 pb-4 pt-5">
        {empty ? (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            <Icon className={cn("h-6 w-6 opacity-40", meta.accent)} />
            <p className="text-xs text-muted-foreground">
              Sin datos todavía en esta rivalidad
            </p>
          </div>
        ) : (
          <div className="flex items-end justify-center gap-2">
            {podiumOrder.map((idx, i) => (
              <PodiumSlot
                key={`${board.id}-${idx}`}
                entry={topThree[idx]}
                heightClass={podiumHeights[i]}
                unitSingular={board.unitSingular}
                unitPlural={board.unitPlural}
                showDetail={board.id === "thrashings"}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function PodiumSlot({
  entry,
  heightClass,
  unitSingular,
  unitPlural,
  showDetail,
}: {
  entry: CrewBoardEntry | undefined;
  heightClass: string;
  unitSingular: string;
  unitPlural: string;
  showDetail?: boolean;
}) {
  if (!entry) return <div className={cn("w-full", heightClass)} />;

  const style = rankStyles[entry.rank as 1 | 2 | 3] ?? rankStyles[3];

  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <AvatarBubble
        nickname={entry.nickname}
        avatarUrl={entry.avatarUrl}
        size={entry.rank === 1 ? "lg" : "md"}
      />
      <div
        className={cn(
          "relative flex w-full flex-col items-center justify-end overflow-hidden rounded-2xl border px-1.5 pb-3 pt-4 transition-transform duration-300",
          heightClass,
          style.shell,
          entry.isCurrentUser && "ring-2 ring-primary/70 ring-offset-2 ring-offset-background"
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -bottom-2 h-10 w-16 rounded-full blur-xl",
            style.glow
          )}
        />
        <span
          className={cn(
            "absolute left-1/2 top-2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-bold",
            style.badge
          )}
        >
          #{entry.rank}
        </span>
        <p className="relative z-10 mt-4 max-w-full truncate px-1 text-center text-xs font-semibold">
          {entry.nickname}
          {entry.isCurrentUser ? (
            <span className="ml-1 text-[9px] text-primary">tú</span>
          ) : null}
        </p>
        <p className="relative z-10 text-2xl font-black tabular-nums tracking-tight">
          {entry.value}
        </p>
        {showDetail && entry.detail ? (
          <p className="relative z-10 max-w-full truncate px-0.5 text-center text-[10px] text-muted-foreground">
            {entry.detail}
          </p>
        ) : (
          <p className="relative z-10 text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
            {entry.value === 1 ? unitSingular : unitPlural}
          </p>
        )}
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 px-3 py-3 sm:px-4">
      <div className="mb-2 flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide sm:text-[11px]">
          {label}
        </span>
      </div>
      <p className="truncate text-xl font-bold tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}

export function CrewStatsBoard({
  boards,
  titlesDetail,
  crewName,
  memberCount,
}: CrewStatsBoardProps) {
  const currentUser = titlesDetail.find((e) => e.isCurrentUser);
  const leader = titlesDetail[0];
  const titlesBoard = boards.find((b) => b.id === "titles");
  const gap =
    currentUser && leader && currentUser.userId !== leader.userId
      ? Math.max(0, leader.titlesWon - currentUser.titlesWon)
      : 0;

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatPill
          icon={<Users className="h-4 w-4 text-sky-400" />}
          label="Miembros"
          value={memberCount}
        />
        <StatPill
          icon={<Crown className="h-4 w-4 text-primary" />}
          label="Líder"
          value={leader?.nickname ?? "—"}
        />
        <StatPill
          icon={<Trophy className="h-4 w-4 text-amber-400" />}
          label="Títulos top"
          value={titlesBoard?.entries[0]?.value ?? 0}
        />
      </section>

      {currentUser && leader && (
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-r from-primary/10 via-card to-transparent px-4 py-4 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
                Tu rivalidad
              </p>
              <p className="mt-1 text-sm font-semibold sm:text-base">
                #{currentUser.rank} · {currentUser.titlesWon}{" "}
                {currentUser.titlesWon === 1 ? "título" : "títulos"}
              </p>
            </div>
            <Badge className="bg-primary/15 text-primary">
              {currentUser.userId === leader.userId
                ? "Lideras el grupo"
                : gap > 0
                  ? `${gap} para alcanzar a ${leader.nickname}`
                  : `Empate con ${leader.nickname}`}
            </Badge>
          </div>
        </div>
      )}

      <section>
        <div className="mb-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
            Rivalidades
          </p>
          <h2 className="text-base font-semibold sm:text-lg">
            Podios · {crewName}
          </h2>
          <p className="text-xs text-muted-foreground">
            Top 3 en títulos, descensos, goleadas y victorias
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {boards.map((board) => (
            <MiniPodium key={board.id} board={board} />
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-[#161616] via-[#101010] to-[#0b0b0b]">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary/85">
              Ranking
            </p>
            <h2 className="text-base font-semibold sm:text-lg">
              Clasificación de títulos
            </h2>
          </div>
          <Badge className="bg-primary/15 text-primary">
            {titlesDetail.length} jugadores
          </Badge>
        </div>

        <div className="space-y-2 p-3 sm:p-4">
          {titlesDetail.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "rounded-2xl border border-border/70 bg-white/[0.02] p-3 transition-colors hover:border-primary/30 hover:bg-white/[0.04]",
                entry.isCurrentUser && "border-primary/40 bg-primary/[0.06]"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
                    entry.rank === 1
                      ? "bg-yellow-400/15 text-yellow-400"
                      : entry.rank === 2
                        ? "bg-zinc-300/15 text-zinc-300"
                        : entry.rank === 3
                          ? "bg-amber-700/15 text-amber-600"
                          : "bg-muted text-muted-foreground"
                  )}
                >
                  {entry.rank}
                </span>
                <AvatarBubble
                  nickname={entry.nickname}
                  avatarUrl={entry.avatarUrl}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Link
                      href={`/players/${entry.userId}`}
                      className="truncate text-sm font-semibold hover:text-primary"
                    >
                      {entry.nickname}
                    </Link>
                    {entry.isOwner && (
                      <Badge variant="outline" className="text-[10px]">
                        Creador
                      </Badge>
                    )}
                    {entry.isCurrentUser && (
                      <Badge className="bg-primary/15 text-[10px] text-primary">
                        Tú
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {entry.wins}V · {entry.matchesPlayed} PJ · {entry.elo} ELO
                  </p>
                </div>
                <div className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-1.5">
                  <Crown className="h-3.5 w-3.5 text-primary" />
                  <span className="text-base font-bold tabular-nums">
                    {entry.titlesWon}
                  </span>
                </div>
              </div>

              {entry.recentTrophies.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5 pl-11">
                  {entry.recentTrophies.map((trophy) => {
                    const url = getLeagueTrophyUrl(
                      trophy.leagueFifaId,
                      trophy.leagueName
                    );
                    return (
                      <div
                        key={trophy.id}
                        className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/40 px-2 py-1"
                        title={trophy.title}
                      >
                        {url ? (
                          <Image
                            src={url}
                            alt={trophy.title}
                            width={18}
                            height={22}
                            className="h-4 w-auto object-contain"
                            unoptimized
                          />
                        ) : (
                          <Trophy className="h-3.5 w-3.5 text-primary" />
                        )}
                        <span className="max-w-[110px] truncate text-[10px] text-muted-foreground">
                          {trophy.title.replace("Campeón · ", "")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {titlesDetail.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Users className="h-8 w-8 opacity-50" />
              <p className="text-sm">Invita amigos para llenar el ranking</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
