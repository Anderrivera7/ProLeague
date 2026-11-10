"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Shield } from "lucide-react";
import { getTeamCrestCandidates } from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";

type CrestBadgeClientProps = {
  crestUrl?: string | null;
  clubName?: string | null;
  className?: string;
  size?: number;
};

/** Fallback en cliente si el PNG cache no existe aún. */
export function CrestBadgeClient({
  crestUrl,
  clubName,
  className,
  size = 20,
}: CrestBadgeClientProps) {
  const candidates = useMemo(
    () => getTeamCrestCandidates(crestUrl, undefined, clubName),
    [crestUrl, clubName]
  );
  const [index, setIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);
  const failedSrc = useRef<string | null>(null);
  const candidateKey = candidates.join("|");

  useEffect(() => {
    setIndex(0);
    setExhausted(false);
    failedSrc.current = null;
  }, [candidateKey]);

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
        if (!src || failedSrc.current === src) return;
        failedSrc.current = src;
        if (index + 1 < candidates.length) setIndex(index + 1);
        else setExhausted(true);
      }}
    />
  );
}
