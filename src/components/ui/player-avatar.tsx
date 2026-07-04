"use client";

import { useState } from "react";
import Image from "next/image";
import { getEaPlayerPortraitUrl } from "@/lib/fc-data/player-image";

interface PlayerAvatarProps {
  eaId: string;
  name: string;
  imageUrl?: string | null;
  size?: number;
  className?: string;
  fallback?: string | number;
}

export function PlayerAvatar({
  eaId,
  name,
  imageUrl,
  size = 40,
  className = "",
  fallback,
}: PlayerAvatarProps) {
  const eaUrl = getEaPlayerPortraitUrl(eaId);
  const preferEa =
    !imageUrl ||
    imageUrl.includes("sofifa.net") ||
    imageUrl.includes("fifaindex.com");
  const primarySrc = preferEa ? eaUrl : imageUrl;
  const [src, setSrc] = useState(primarySrc);
  const [failed, setFailed] = useState(false);

  const showImage = src && !failed;

  return (
    <div
      className={`relative overflow-hidden rounded-full bg-muted ${className}`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src}
          alt={name}
          fill
          className="object-cover object-top"
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => {
            if (src !== eaUrl) {
              setSrc(eaUrl);
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted-foreground">
          {fallback ?? name.slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  );
}
