import { cn } from "@/lib/utils";

interface LeagueCoverProps {
  coverUrl: string | null;
  alt?: string;
  className?: string;
  overlayClassName?: string;
}

export function LeagueCover({
  coverUrl,
  alt = "",
  className,
  overlayClassName,
}: LeagueCoverProps) {
  if (!coverUrl) return null;

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={coverUrl}
        alt={alt}
        className={cn("absolute inset-0 h-full w-full object-cover", className)}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20",
          overlayClassName
        )}
      />
    </>
  );
}
