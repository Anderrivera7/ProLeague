"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ReactNode } from "react";
import {
  ArrowDownToLine,
  Crown,
  Medal,
  Swords,
  Trophy,
  Users,
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
}

const podiumOrder = [1, 0, 2] as const;

const TAB_META: Record<
  CrewBoardCategory["id"],
  {
    icon: typeof Trophy;
    label: string;
    tone: string;
    active: string;
    glow: string;
    soft: string;
  }
> = {
  titles: {
    icon: Trophy,
    label: "Títulos",
    tone: "text-primary",
    active: "bg-primary text-primary-foreground",
    glow: "rgba(57,255,20,0.16)",
    soft: "border-primary/30 bg-primary/10",
  },
  relegations: {
    icon: ArrowDownToLine,
    label: "Descensos",
    tone: "text-rose-400",
    active: "bg-rose-500 text-white",
    glow: "rgba(244,63,94,0.16)",
    soft: "border-rose-500/30 bg-rose-500/10",
  },
  thrashings: {
    icon: Swords,
    label: "Goleadas",
    tone: "text-amber-400",
    active: "bg-amber-500 text-black",
    glow: "rgba(245,158,11,0.16)",
    soft: "border-amber-500/30 bg-amber-500/10",
  },
  wins: {
    icon: Medal,
    label: "Victorias",
    tone: "text-sky-400",
    active: "bg-sky-500 text-white",
    glow: "rgba(14,165,233,0.16)",
    soft: "border-sky-500/30 bg-sky-500/10",
  },
};

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
    <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.02] px-2.5 py-2.5 sm:px-4 sm:py-3">
      <div className="mb-1 flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[10px]">
          {label}
        </span>
      </div>
      <p className="truncate text-base font-bold tabular-nums sm:text-xl">
        {value}
      </p>
    </div>
  );
}

function PodiumStep({
  entry,
  rank,
  board,
}: {
  entry: CrewBoardEntry | undefined;
  rank: 1 | 2 | 3;
  board: CrewBoardCategory;
}) {
  const stepH = {
    1: "min-h-[8.5rem] sm:min-h-[11rem]",
    2: "min-h-[6.5rem] sm:min-h-[8.5rem]",
    3: "min-h-[5.5rem] sm:min-h-[7rem]",
  } as const;
  const face = {
    1: "border-yellow-400/45 from-yellow-400/35 via-yellow-400/10 to-[#101010]",
    2: "border-zinc-300/30 from-zinc-200/25 via-zinc-200/5 to-[#101010]",
    3: "border-amber-700/40 from-amber-700/30 via-amber-700/5 to-[#101010]",
  } as const;
  const badge = {
    1: "bg-yellow-400 text-black shadow-[0_8px_24px_rgba(250,204,21,0.35)]",
    2: "bg-zinc-200 text-zinc-900",
    3: "bg-amber-700 text-amber-50",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col items-center",
        rank === 1 ? "z-10 w-[40%]" : "w-[30%]"
      )}
    >
      <div className="mb-2 flex h-[4.25rem] flex-col items-center justify-end sm:mb-3 sm:h-[5rem]">
        {entry ? (
          <>
            {rank === 1 && (
              <Crown className="mb-1 h-5 w-5 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.7)] sm:h-6 sm:w-6" />
            )}
            <UserAvatar
              nickname={entry.nickname}
              avatarUrl={entry.avatarUrl}
              size={rank === 1 ? 56 : 44}
              className={cn(
                "ring-2 ring-offset-2 ring-offset-[#080808]",
                rank === 1 ? "ring-yellow-400/80" : "ring-white/25"
              )}
            />
          </>
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-dashed border-white/15 text-white/25 sm:h-12 sm:w-12">
            —
          </div>
        )}
      </div>

      <div
        className={cn(
          "relative flex w-full flex-col items-center rounded-t-[1.25rem] border border-b-0 bg-gradient-to-b px-1 pb-3 pt-3 sm:rounded-t-[1.5rem] sm:px-2 sm:pb-4 sm:pt-4",
          stepH[rank],
          entry ? face[rank] : "border-dashed border-white/10 from-white/[0.04] to-transparent",
          entry?.isCurrentUser && "ring-2 ring-inset ring-primary/55"
        )}
      >
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[9px] font-black sm:text-[10px]",
            entry ? badge[rank] : "bg-white/10 text-white/35"
          )}
        >
          #{rank}
        </span>

        {entry ? (
          <div className="mt-2 flex min-h-0 flex-1 flex-col items-center justify-between gap-1">
            <div className="w-full text-center">
              <p className="truncate px-0.5 text-[11px] font-semibold leading-tight sm:text-sm">
                {entry.nickname}
              </p>
              {entry.isCurrentUser && (
                <span className="text-[9px] font-semibold text-primary">tú</span>
              )}
            </div>
            <div className="text-center">
              <p className="text-[1.75rem] font-black leading-none tabular-nums sm:text-4xl">
                {entry.value}
              </p>
              {board.id === "thrashings" && entry.detail ? (
                <p className="mt-1 max-w-full truncate px-0.5 text-[9px] text-muted-foreground sm:text-[10px]">
                  {entry.detail}
                </p>
              ) : (
                <p className="mt-1 text-[8px] uppercase tracking-[0.14em] text-muted-foreground sm:text-[10px]">
                  {entry.value === 1 ? board.unitSingular : board.unitPlural}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-8 text-[10px] text-white/25">Vacante</p>
        )}
      </div>
    </div>
  );
}

function ArenaPodium({ board }: { board: CrewBoardCategory }) {
  const top = board.entries.slice(0, 3);
  const meta = TAB_META[board.id];
  const Icon = meta.icon;
  const hasData = board.entries.some((e) => e.value > 0);

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080808] sm:rounded-[1.75rem]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 60% at 50% -10%, ${meta.glow}, transparent 65%)`,
        }}
      />

      <div className="relative flex items-center gap-3 border-b border-white/8 px-4 py-3.5 sm:px-5">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border",
            meta.soft,
            meta.tone
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold tracking-tight sm:text-lg">
            {board.title}
          </h3>
          <p className="truncate text-[11px] text-muted-foreground">
            {board.subtitle}
          </p>
        </div>
      </div>

      {hasData ? (
        <div className="relative px-2 pb-4 pt-5 sm:px-5 sm:pb-6 sm:pt-7">
          <div className="flex items-end justify-center gap-1 sm:gap-3">
            {podiumOrder.map((idx) => (
              <PodiumStep
                key={`${board.id}-${idx}`}
                entry={top[idx]}
                rank={(idx + 1) as 1 | 2 | 3}
                board={board}
              />
            ))}
          </div>
          <div className="mx-auto mt-0 h-2 w-[92%] rounded-b-2xl bg-gradient-to-b from-white/10 to-white/[0.02]" />
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-2 px-4 py-12 text-center">
          <Icon className={cn("h-8 w-8 opacity-40", meta.tone)} />
          <p className="text-sm text-muted-foreground">
            Aún no hay datos en esta categoría
          </p>
        </div>
      )}
    </div>
  );
}

export function CrewStatsBoard({
  boards,
  titlesDetail,
  crewName,
  memberCount,
}: CrewStatsBoardProps) {
  const [activeId, setActiveId] = useState<CrewBoardCategory["id"]>("titles");
  const activeBoard = boards.find((b) => b.id === activeId) ?? boards[0];
  const currentUser = titlesDetail.find((e) => e.isCurrentUser);
  const leader = titlesDetail[0];
  const gap =
    currentUser && leader && currentUser.userId !== leader.userId
      ? Math.max(0, leader.titlesWon - currentUser.titlesWon)
      : 0;

  if (!activeBoard) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      <section className="grid grid-cols-3 gap-2">
        <StatPill
          icon={<Users className="h-3.5 w-3.5 text-sky-400" />}
          label="Miembros"
          value={memberCount}
        />
        <StatPill
          icon={<Crown className="h-3.5 w-3.5 text-yellow-400" />}
          label="Líder"
          value={leader?.nickname ?? "—"}
        />
        <StatPill
          icon={<Trophy className="h-3.5 w-3.5 text-primary" />}
          label="Top"
          value={boards.find((b) => b.id === "titles")?.entries[0]?.value ?? 0}
        />
      </section>

      {currentUser && leader && (
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/15 via-primary/[0.06] to-transparent p-3.5 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                Tu rivalidad · {crewName}
              </p>
              <p className="mt-1 text-sm font-semibold">
                #{currentUser.rank} · {currentUser.titlesWon}{" "}
                {currentUser.titlesWon === 1 ? "título" : "títulos"}
              </p>
            </div>
            <Badge className="w-fit max-w-full truncate rounded-full bg-primary px-3 py-1 text-[11px] text-primary-foreground">
              {currentUser.userId === leader.userId
                ? "Lideras el grupo"
                : gap > 0
                  ? `${gap} para alcanzar a ${leader.nickname}`
                  : `Empate con ${leader.nickname}`}
            </Badge>
          </div>
        </div>
      )}

      <section className="space-y-3">
        {/* Mobile: grid 2x2 de categorías / Desktop: pills */}
        <div className="grid grid-cols-2 gap-2 sm:hidden">
          {boards.map((board) => {
            const meta = TAB_META[board.id];
            const Icon = meta.icon;
            const active = board.id === activeId;
            const leaderEntry = board.entries[0];
            return (
              <button
                key={board.id}
                type="button"
                onClick={() => setActiveId(board.id)}
                className={cn(
                  "rounded-2xl border p-3 text-left transition-all",
                  active
                    ? cn(meta.soft, "border-transparent ring-1 ring-white/10")
                    : "border-white/10 bg-white/[0.03]"
                )}
              >
                <div className="mb-2 flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", meta.tone)} />
                  <span className="text-xs font-semibold">{meta.label}</span>
                </div>
                <p className="truncate text-[11px] text-muted-foreground">
                  {leaderEntry && leaderEntry.value > 0
                    ? `${leaderEntry.nickname} · ${leaderEntry.value}`
                    : "Sin datos"}
                </p>
              </button>
            );
          })}
        </div>

        <div className="hidden gap-2 overflow-x-auto sm:flex">
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
                  "inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition-all",
                  active
                    ? cn(meta.active, "border-transparent shadow-lg")
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </button>
            );
          })}
        </div>

        <ArenaPodium board={activeBoard} />
      </section>

      <section className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#0b0b0b] sm:rounded-[1.75rem]">
        <div className="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/85">
              Ranking
            </p>
            <h2 className="truncate text-sm font-semibold sm:text-lg">
              Clasificación de títulos
            </h2>
          </div>
          <Badge className="shrink-0 rounded-full bg-white/5 text-[10px] text-muted-foreground">
            {titlesDetail.length}
          </Badge>
        </div>

        <div className="divide-y divide-white/5">
          {titlesDetail.map((entry) => (
            <div
              key={entry.userId}
              className={cn(
                "px-3 py-3.5 sm:px-5 sm:py-4",
                entry.isCurrentUser && "bg-primary/[0.06]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black",
                    entry.rank === 1
                      ? "bg-yellow-400 text-black"
                      : entry.rank === 2
                        ? "bg-zinc-300 text-zinc-900"
                        : entry.rank === 3
                          ? "bg-amber-700 text-amber-50"
                          : "bg-white/5 text-muted-foreground"
                  )}
                >
                  {entry.rank}
                </span>
                <UserAvatar
                  nickname={entry.nickname}
                  avatarUrl={entry.avatarUrl}
                  size={36}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <Link
                      href={`/players/${entry.userId}`}
                      className="truncate text-sm font-semibold hover:text-primary"
                    >
                      {entry.nickname}
                    </Link>
                    {entry.isOwner && (
                      <Badge variant="outline" className="rounded-full text-[9px]">
                        Creador
                      </Badge>
                    )}
                    {entry.isCurrentUser && (
                      <Badge className="rounded-full bg-primary/20 text-[9px] text-primary">
                        Tú
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {entry.wins}V · {entry.matchesPlayed} PJ · {entry.elo} ELO
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-xl border border-primary/20 bg-primary/10 px-2 py-1">
                  <Crown className="h-3 w-3 text-primary" />
                  <span className="text-sm font-bold tabular-nums">
                    {entry.titlesWon}
                  </span>
                </div>
              </div>

              {entry.recentTrophies.length > 0 ? (
                <div className="mt-3 pl-9 sm:pl-10">
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Últimos títulos
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {entry.recentTrophies.map((trophy) => {
                      const url = resolveTrophyImage(
                        trophy.imageUrl,
                        trophy.leagueFifaId,
                        trophy.title
                      );
                      const label = trophy.title.replace(/^Campeón\s*·\s*/i, "");
                      return (
                        <div
                          key={trophy.id}
                          title={label}
                          className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1 rounded-xl border border-white/8 bg-white/[0.03] px-1.5 py-2"
                        >
                          <div className="relative flex h-9 w-9 items-center justify-center">
                            {url ? (
                              <Image
                                src={url}
                                alt={label}
                                width={36}
                                height={36}
                                className="max-h-9 max-w-9 object-contain"
                                unoptimized
                              />
                            ) : (
                              <Trophy className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <span className="line-clamp-2 w-full text-center text-[8px] leading-tight text-muted-foreground">
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-2 pl-9 text-[11px] text-muted-foreground sm:pl-10">
                  Sin títulos todavía
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
