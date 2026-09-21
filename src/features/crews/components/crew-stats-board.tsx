"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  Crown,
  Flame,
  Medal,
  Scale,
  Swords,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";
import { resolveTrophyImage } from "@/lib/fc-data/league-trophies";
import { cn } from "@/lib/utils";
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
  currentUserId?: string;
}

const TAB_META: Record<
  CrewBoardCategory["id"],
  { icon: typeof Trophy; label: string; tone: string; soft: string }
> = {
  titles: {
    icon: Trophy,
    label: "Títulos",
    tone: "text-primary",
    soft: "border-primary bg-primary text-primary-foreground",
  },
  relegations: {
    icon: ArrowDownToLine,
    label: "Descensos",
    tone: "text-rose-400",
    soft: "border-rose-500 bg-rose-500 text-white",
  },
  thrashings: {
    icon: Swords,
    label: "Goleadas",
    tone: "text-amber-400",
    soft: "border-amber-500 bg-amber-500 text-black",
  },
  wins: {
    icon: Medal,
    label: "Victorias",
    tone: "text-sky-400",
    soft: "border-sky-500 bg-sky-500 text-white",
  },
};

function shortLabel(title: string) {
  return title.replace(/^Campeón\s*·\s*/i, "").trim();
}

function MiniStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-black/55 px-2 py-2.5 backdrop-blur-md sm:px-3",
        accent ? "border-primary/40" : "border-white/10"
      )}
    >
      <div className="mb-1 flex items-center gap-1 text-white/55">
        {icon}
        <span className="truncate text-[8px] font-semibold uppercase tracking-[0.14em] sm:text-[9px]">
          {label}
        </span>
      </div>
      <p
        className={cn(
          "text-base font-bold tabular-nums sm:text-xl",
          accent && "text-primary"
        )}
      >
        {value}
      </p>
      {accent ? (
        <div className="mt-1.5 h-0.5 w-full rounded-full bg-primary" />
      ) : null}
    </div>
  );
}

function RankMedal({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center">
        <Crown className="absolute -top-2.5 h-3.5 w-3.5 text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-yellow-300 to-amber-500 text-xs font-black text-black shadow-[0_0_18px_rgba(250,204,21,0.45)]">
          1
        </span>
      </div>
    );
  }
  return (
    <span
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black",
        rank === 2 && "bg-zinc-300 text-zinc-900",
        rank === 3 && "bg-amber-700 text-amber-50",
        rank > 3 && "bg-white/10 text-muted-foreground"
      )}
    >
      {rank}
    </span>
  );
}

function TrophyTile({
  trophy,
}: {
  trophy: CrewPodiumEntry["recentTrophies"][number];
}) {
  const url = resolveTrophyImage(
    trophy.imageUrl,
    trophy.leagueFifaId,
    trophy.title
  );
  const label = shortLabel(trophy.title);

  return (
    <div
      title={label}
      className="flex w-[5.1rem] shrink-0 flex-col items-center gap-1.5 rounded-2xl border border-white/10 bg-[#121212] px-1.5 py-2.5"
    >
      <div className="flex h-11 w-11 items-center justify-center">
        {url ? (
          <Image
            src={url}
            alt={label}
            width={44}
            height={44}
            className="max-h-11 max-w-11 object-contain drop-shadow-md"
            unoptimized
          />
        ) : (
          <Trophy className="h-5 w-5 text-primary" />
        )}
      </div>
      <span className="line-clamp-2 w-full text-center text-[8px] leading-tight text-white/55">
        {label}
      </span>
    </div>
  );
}

function HeroCard({
  entry,
  crewName,
}: {
  entry: CrewPodiumEntry;
  crewName: string;
}) {
  const trophyUrl = resolveTrophyImage(
    entry.recentTrophies[0]?.imageUrl,
    entry.recentTrophies[0]?.leagueFifaId,
    entry.recentTrophies[0]?.title ?? "Trofeo"
  );

  return (
    <section className="relative overflow-hidden rounded-[1.6rem] border border-primary/35 bg-[#050505] shadow-[0_0_48px_rgba(57,255,20,0.12)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/leagues/intl.png"
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(57,255,20,0.22),transparent_45%),linear-gradient(135deg,#000_20%,rgba(0,0,0,0.75)_55%,rgba(10,40,10,0.7)_100%)]" />

      <div className="relative p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <UserAvatar
                nickname={entry.nickname}
                avatarUrl={entry.avatarUrl}
                size={52}
                className="ring-2 ring-primary/60 ring-offset-2 ring-offset-black"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="truncate text-base font-bold sm:text-lg">
                    {entry.nickname}
                  </p>
                  <Badge className="rounded-full bg-primary px-2 py-0 text-[10px] font-semibold text-black">
                    Tú
                  </Badge>
                </div>
                <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                  Título {entry.titlesWon}
                </p>
              </div>
            </div>

            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Tu posición en la liga
            </p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-5xl font-black leading-none tracking-tight text-white sm:text-6xl">
                #{entry.rank}
              </p>
            </div>
            <p className="mt-2 text-xs text-white/55">
              {entry.currentStreak > 0
                ? `${entry.currentStreak} partido${entry.currentStreak === 1 ? "" : "s"} sin perder`
                : entry.rank === 1
                  ? "El esfuerzo también se premia"
                  : `Compites en ${crewName}`}
            </p>
          </div>

          <div className="flex h-[6.5rem] w-[5.2rem] shrink-0 items-center justify-center sm:h-32 sm:w-28">
            {trophyUrl ? (
              <Image
                src={trophyUrl}
                alt=""
                width={112}
                height={128}
                className="max-h-full max-w-full object-contain drop-shadow-[0_12px_30px_rgba(0,0,0,0.75)]"
                unoptimized
              />
            ) : (
              <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-[0_0_24px_rgba(250,204,21,0.5)]" />
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2">
          <MiniStat
            icon={<Trophy className="h-3 w-3 text-primary" />}
            label="Títulos"
            value={entry.titlesWon}
            accent
          />
          <MiniStat
            icon={<Flame className="h-3 w-3 text-orange-300" />}
            label="Sin perder"
            value={entry.currentStreak}
          />
          <MiniStat
            icon={<Target className="h-3 w-3 text-amber-300" />}
            label="Goles"
            value={entry.goalsFor}
          />
          <MiniStat
            icon={<Swords className="h-3 w-3 text-amber-400" />}
            label="Goleada"
            value={entry.biggestWin > 0 ? `+${entry.biggestWin}` : 0}
          />
        </div>
      </div>
    </section>
  );
}

function BoardLeaderRow({
  entry,
  unitSingular,
  unitPlural,
  highlight,
  categoryId,
}: {
  entry: CrewBoardEntry;
  unitSingular: string;
  unitPlural: string;
  highlight?: boolean;
  categoryId?: CrewBoardCategory["id"];
}) {
  const isThrashing = categoryId === "thrashings";
  const displayValue = isThrashing
    ? entry.value > 0
      ? `+${entry.value}`
      : "0"
    : entry.value;
  const humiliation = isThrashing && entry.value >= 5;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-3 py-3",
        highlight
          ? "border-primary/50 bg-primary/10 shadow-[0_0_24px_rgba(57,255,20,0.12)]"
          : "border-white/8 bg-white/[0.03]"
      )}
    >
      <RankMedal rank={entry.rank} />
      <UserAvatar
        nickname={entry.nickname}
        avatarUrl={entry.avatarUrl}
        size={40}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold">{entry.nickname}</p>
          {entry.isCurrentUser && (
            <Badge className="rounded-full bg-primary px-1.5 py-0 text-[9px] text-black">
              Tú
            </Badge>
          )}
          {humiliation && (
            <Badge className="rounded-full bg-amber-500/20 px-1.5 py-0 text-[9px] font-semibold text-amber-300">
              Humillación
            </Badge>
          )}
        </div>
        {entry.detail ? (
          <p className="truncate text-[11px] text-muted-foreground">
            {entry.detail}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            {entry.value} {entry.value === 1 ? unitSingular : unitPlural}
          </p>
        )}
      </div>
      <p
        className={cn(
          "text-xl font-black tabular-nums",
          isThrashing ? "text-amber-300" : "text-white"
        )}
      >
        {displayValue}
      </p>
    </div>
  );
}

function TitlesRankingCard({
  entry,
  currentUserId,
}: {
  entry: CrewPodiumEntry;
  currentUserId?: string;
}) {
  const canCompare =
    Boolean(currentUserId) && !entry.isCurrentUser && currentUserId !== entry.userId;
  const trophies = entry.recentTrophies.slice(0, 8);

  return (
    <article
      className={cn(
        "rounded-[1.35rem] border p-3.5 sm:p-4",
        entry.isCurrentUser
          ? "border-primary/60 bg-gradient-to-br from-primary/18 via-[#0b120b] to-[#090909] shadow-[0_0_32px_rgba(57,255,20,0.16)]"
          : "border-white/10 bg-[#0d0d0d]"
      )}
    >
      <div className="flex items-center gap-2.5">
        <RankMedal rank={entry.rank} />
        <UserAvatar
          nickname={entry.nickname}
          avatarUrl={entry.avatarUrl}
          size={42}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              href={`/players/${entry.userId}`}
              className="truncate text-sm font-semibold hover:text-primary"
            >
              {entry.nickname}
            </Link>
            {entry.isCurrentUser && (
              <Badge className="rounded-full bg-primary px-1.5 py-0 text-[9px] text-black">
                Tú
              </Badge>
            )}
            {entry.isOwner && (
              <Badge
                variant="outline"
                className="rounded-full border-white/15 text-[9px] text-white/50"
              >
                Creador
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-white/45">
            {entry.wins}V · {entry.matchesPlayed} PJ · {entry.elo} ELO
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1">
          <Crown className="h-3 w-3 text-primary" />
          <span className="text-sm font-bold tabular-nums">
            {entry.titlesWon}
          </span>
        </div>
      </div>

      {canCompare && (
        <Link
          href={`/players/compare?a=${currentUserId}&b=${entry.userId}`}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/35 bg-primary/10 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
        >
          <Scale className="h-3.5 w-3.5" />
          Comparar contigo
        </Link>
      )}

      {trophies.length > 0 ? (
        <div className="mt-3">
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/40">
            Últimos títulos
          </p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trophies.map((trophy) => (
              <TrophyTile key={trophy.id} trophy={trophy} />
            ))}
            {entry.titlesWon > trophies.length && (
              <div className="flex w-[5.1rem] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-white/15 bg-[#121212] px-1.5 py-2.5">
                <span className="text-sm font-bold text-primary">
                  +{entry.titlesWon - trophies.length}
                </span>
                <span className="text-[8px] text-white/45">más</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-white/35">Sin títulos todavía</p>
      )}
    </article>
  );
}

function VacantCard({ rank }: { rank: number }) {
  return (
    <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2.5">
        <RankMedal rank={rank} />
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/15 text-white/25">
          —
        </div>
        <div>
          <p className="text-sm font-medium text-white/35">Vacante</p>
          <p className="text-[11px] text-white/25">Sin datos</p>
        </div>
      </div>
    </div>
  );
}

export function CrewStatsBoard({
  boards,
  titlesDetail,
  crewName,
  memberCount,
  currentUserId,
}: CrewStatsBoardProps) {
  const [activeId, setActiveId] = useState<CrewBoardCategory["id"]>("titles");
  const activeBoard = boards.find((b) => b.id === activeId) ?? boards[0];
  const currentUser = titlesDetail.find((e) => e.isCurrentUser);

  const rankingRows = useMemo(() => {
    const slots = Math.max(3, titlesDetail.length);
    return Array.from({ length: slots }, (_, i) => titlesDetail[i] ?? null);
  }, [titlesDetail]);

  if (!activeBoard) return null;

  const topEntries = activeBoard.entries.filter((e) => e.value > 0).slice(0, 5);

  return (
    <div className="space-y-4 pb-6 sm:space-y-5">
      {currentUser ? <HeroCard entry={currentUser} crewName={crewName} /> : null}

      {/* Categorías */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {boards.map((board) => {
          const meta = TAB_META[board.id];
          const Icon = meta.icon;
          const active = board.id === activeId;
          return (
            <button
              key={board.id}
              type="button"
              onClick={() => setActiveId(board.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.98] sm:text-sm",
                active
                  ? meta.soft
                  : "border-white/10 bg-[#121212] text-white/55 hover:text-white"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Podio / ranking de la categoría activa */}
      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0a0a0a]">
        <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/80">
              Podio
            </p>
            <h3 className="truncate text-base font-semibold">
              {activeBoard.title}
            </h3>
            <p className="truncate text-[11px] text-muted-foreground">
              {activeBoard.subtitle}
            </p>
          </div>
          <Badge className="shrink-0 rounded-full bg-white/5 text-[10px] text-white/45">
            {memberCount} en el grupo
          </Badge>
        </div>

        <div className="space-y-2 p-3 sm:p-4">
          {activeId === "titles" ? (
            rankingRows.map((entry, i) =>
              entry ? (
                <TitlesRankingCard
                  key={entry.userId}
                  entry={entry}
                  currentUserId={currentUserId}
                />
              ) : (
                <VacantCard key={`vacant-${i}`} rank={i + 1} />
              )
            )
          ) : topEntries.length > 0 ? (
            topEntries.map((entry) => (
              <BoardLeaderRow
                key={entry.userId}
                entry={entry}
                unitSingular={activeBoard.unitSingular}
                unitPlural={activeBoard.unitPlural}
                highlight={entry.isCurrentUser || entry.rank === 1}
                categoryId={activeBoard.id}
              />
            ))
          ) : (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Trophy className="h-8 w-8 text-white/20" />
              <p className="text-sm text-muted-foreground">
                Aún no hay datos en esta categoría
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
