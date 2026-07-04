"use client";

import { GiSoccerBall } from "react-icons/gi";
import { cn } from "@/lib/utils";

export function YellowCardIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-3.5 w-2.5 rounded-sm bg-yellow-400 shadow-sm", className)}
      aria-hidden
    />
  );
}

export function RedCardIcon({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-block h-3.5 w-2.5 rounded-sm bg-red-600 shadow-sm", className)}
      aria-hidden
    />
  );
}

export function GoalStat({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <GiSoccerBall className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <span className="font-bold tabular-nums">{count}</span>
    </span>
  );
}

export function YellowCardStat({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <YellowCardIcon />
      <span className="font-bold tabular-nums">{count}</span>
    </span>
  );
}

export function RedCardStat({ count, className }: { count: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <RedCardIcon />
      <span className="font-bold tabular-nums">{count}</span>
    </span>
  );
}
