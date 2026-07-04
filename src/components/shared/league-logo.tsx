"use client";

import { useState } from "react";
import { resolveLeagueLogoUrl } from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";

interface LeagueLogoProps {
  name: string;
  logoUrl?: string | null;
  fifaIndexId?: string;
  size?: number;
  className?: string;
}

export function LeagueLogo({
  name,
  logoUrl,
  fifaIndexId,
  size = 28,
  className,
}: LeagueLogoProps) {
  const [failed, setFailed] = useState(false);
  const src = resolveLeagueLogoUrl(logoUrl, fifaIndexId, name);

  if (!src || failed) {
    return (
      <span
        className={cn("flex items-center justify-center text-lg", className)}
        style={{ width: size, height: size }}
        aria-hidden
      >
        🏆
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
      className={cn("object-contain", className)}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
