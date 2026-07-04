"use client";

import { FaMedal } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamCrest } from "@/components/shared/team-crest";
import { resolvePlayerImageUrl } from "@/lib/fc-data/player-image";
import { cn } from "@/lib/utils";

const medalColors: Record<number, string> = {
  1: "text-amber-400",
  2: "text-slate-300",
  3: "text-amber-700",
};

export function RankMedal({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <FaMedal
        className={cn("h-5 w-5 shrink-0", medalColors[rank])}
        aria-hidden
      />
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center text-xs font-bold text-muted-foreground">
      {rank}
    </span>
  );
}

export function PlayerLeaderRow({
  rank,
  playerName,
  playerImageUrl,
  playerEaId,
  teamName,
  teamCrestUrl,
  teamFifaIndexId,
  nickname,
  stat,
  showRank = true,
}: {
  rank: number;
  playerName: string;
  playerImageUrl?: string | null;
  playerEaId?: string | null;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  nickname: string;
  stat: React.ReactNode;
  showRank?: boolean;
}) {
  const isTop = showRank && rank <= 3;
  const portrait =
    playerEaId != null
      ? resolvePlayerImageUrl(playerEaId, playerImageUrl)
      : null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
        showRank && rank === 1 &&
          "border-primary/50 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent shadow-[0_0_20px_-8px] shadow-primary/40",
        showRank && rank === 2 && "border-border bg-muted/30",
        showRank && rank === 3 && "border-border bg-muted/20",
        (!showRank || rank > 3) && "border-border/60 bg-card/40"
      )}
    >
      {showRank ? <RankMedal rank={rank} /> : null}

      <Avatar
        className={cn(
          "h-11 w-11 border-2",
          showRank && rank === 1 &&
            "border-primary shadow-[0_0_12px_-2px] shadow-primary/60",
          showRank && rank === 2 && "border-slate-400/50",
          showRank && rank === 3 && "border-amber-700/50",
          !isTop && "border-border"
        )}
      >
        {portrait ? (
          <AvatarImage
            src={portrait}
            alt={playerName}
            referrerPolicy="no-referrer"
          />
        ) : null}
        <AvatarFallback className="text-xs">
          {playerName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{playerName}</p>
        <div className="mt-0.5 flex items-center gap-1.5">
          <TeamCrest
            name={teamName ?? "—"}
            crestUrl={teamCrestUrl}
            fifaIndexId={teamFifaIndexId ?? undefined}
            size={16}
          />
          <span className="truncate text-xs text-muted-foreground">
            {teamName ?? "—"}
          </span>
        </div>
        <p className="truncate text-[11px] text-muted-foreground/80">
          @{nickname}
        </p>
      </div>

      <div className="shrink-0 text-right">{stat}</div>
    </div>
  );
}
