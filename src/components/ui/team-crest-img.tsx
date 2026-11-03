"use client";

import { useEffect, useMemo, useState } from "react";
import { Shield } from "lucide-react";
import { getTeamCrestCandidates } from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";

type TeamCrestImgProps = {
  crestUrl?: string | null;
  clubName?: string | null;
  fifaIndexId?: string;
  className?: string;
  size?: number;
};

export function TeamCrestImg({
  crestUrl,
  clubName,
  fifaIndexId,
  className,
  size = 20,
}: TeamCrestImgProps) {
  const candidates = useMemo(
    () => getTeamCrestCandidates(crestUrl, fifaIndexId, clubName),
    [crestUrl, fifaIndexId, clubName]
  );
  const [index, setIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  useEffect(() => {
    setIndex(0);
    setExhausted(false);
  }, [candidates]);

  const src = candidates[index];

  if (!src || exhausted) {
    return (
      <Shield
        className={cn("shrink-0 text-muted-foreground", className)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={src}
      src={src}
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={cn("shrink-0 object-contain", className)}
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex((i) => i + 1);
        } else {
          setExhausted(true);
        }
      }}
    />
  );
}
