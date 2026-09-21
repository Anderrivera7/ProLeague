"use client";

import { memo, useState } from "react";
import { getTeamCrestCandidates } from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";
import { Shield } from "lucide-react";

interface TeamCrestProps {
  name: string;
  crestUrl?: string | null;
  fifaIndexId?: string;
  size?: number;
  className?: string;
}

function TeamCrestInner({
  name,
  crestUrl,
  fifaIndexId,
  size = 36,
  className,
}: TeamCrestProps) {
  const candidates = getTeamCrestCandidates(crestUrl, fifaIndexId);
  const [index, setIndex] = useState(0);
  const src = candidates[index] ?? null;

  if (!src) {
    return (
      <span
        className={cn(
          "flex items-center justify-center text-muted-foreground",
          className
        )}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <Shield style={{ width: size * 0.55, height: size * 0.55 }} />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={cn("object-contain", className)}
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}

export const TeamCrest = memo(TeamCrestInner);
