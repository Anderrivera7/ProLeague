"use client";

import { memo, useEffect, useState } from "react";
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
  const candidates = getTeamCrestCandidates(crestUrl, fifaIndexId, name);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [crestUrl, fifaIndexId, name]);
  const src = candidates[index] ?? null;

  if (!src || index >= candidates.length) {
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center text-muted-foreground",
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
    <span
      className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden", className)}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        style={{ width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
        onError={() => setIndex((current) => current + 1)}
      />
    </span>
  );
}

export const TeamCrest = memo(TeamCrestInner);
