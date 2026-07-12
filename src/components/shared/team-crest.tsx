"use client";

import { memo, useState } from "react";
import { resolveTeamCrestUrl } from "@/lib/fc-data/club-ids";
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
  const [failed, setFailed] = useState(false);
  const src = resolveTeamCrestUrl(crestUrl, fifaIndexId);

  if (!src || failed) {
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
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

export const TeamCrest = memo(TeamCrestInner);
