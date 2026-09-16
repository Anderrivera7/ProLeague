"use client";

import { useState } from "react";
import { cn, getInitials } from "@/lib/utils";

interface UserAvatarProps {
  nickname: string;
  avatarUrl?: string | null;
  className?: string;
  size?: number;
}

/** Avatar de usuario con fallback a iniciales si la foto falla. */
export function UserAvatar({
  nickname,
  avatarUrl,
  className,
  size = 36,
}: UserAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(avatarUrl) && !failed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-primary/15 ring-1 ring-white/10",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl!}
          alt={nickname}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-primary">
          {getInitials(nickname)}
        </div>
      )}
    </div>
  );
}
