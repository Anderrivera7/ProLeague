import { Shield } from "lucide-react";
import { resolveTeamCrestUrl } from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";

type CrestBadgeProps = {
  crestUrl?: string | null;
  clubName?: string | null;
  className?: string;
  imgClassName?: string;
  size?: number;
};

/** Escudo en servidor: URL estática / cache / api (sin icono roto en SSR). */
export function CrestBadge({
  crestUrl,
  clubName,
  className,
  imgClassName,
  size = 20,
}: CrestBadgeProps) {
  const src = resolveTeamCrestUrl(crestUrl, undefined, clubName);
  if (!src) {
    return (
      <Shield
        className={cn("shrink-0 text-muted-foreground", imgClassName)}
        style={{ width: size, height: size }}
        aria-hidden
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      decoding="async"
      className={cn("shrink-0 object-contain", imgClassName, className)}
    />
  );
}
