import { Trophy, Swords, Clock } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { ActivityType } from "@prisma/client";

interface ActivityItemProps {
  type: ActivityType;
  title: string;
  createdAt: Date;
}

const iconMap: Record<string, typeof Trophy> = {
  MATCH_WON: Trophy,
  MATCH_LOST: Swords,
  MATCH_PLAYED: Swords,
  MATCH_DRAWN: Swords,
  default: Clock,
};

const colorMap: Record<string, string> = {
  MATCH_WON: "text-primary bg-primary/15",
  MATCH_LOST: "text-destructive bg-destructive/15",
  MATCH_DRAWN: "text-yellow-400 bg-yellow-400/15",
  default: "text-muted-foreground bg-muted",
};

export function ActivityItem({ type, title, createdAt }: ActivityItemProps) {
  const Icon = iconMap[type] ?? iconMap.default;
  const color = colorMap[type] ?? colorMap.default;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color}`}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatDateTime(createdAt)}
        </p>
      </div>
    </div>
  );
}
