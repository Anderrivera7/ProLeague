"use client";

import { cn } from "@/lib/utils";
import { GOLDEN_BOOT_IMAGE } from "@/lib/awards/golden-boot";

/** Vitrina con giro 3D de la bota. La foto ya trae fondo transparente. */
export function GoldenBootStage({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "boot-stage relative flex items-center justify-center",
        compact ? "h-28 w-24" : "h-52 w-full",
        className
      )}
    >
      <style>{`
        @keyframes boot-turn {
          0%, 100% { transform: rotateY(-24deg) rotateX(8deg) translateZ(0); }
          50% { transform: rotateY(24deg) rotateX(4deg) translateZ(12px); }
        }
        @keyframes boot-glow {
          0%, 100% { opacity: .35; transform: scale(.85); }
          50% { opacity: .7; transform: scale(1); }
        }
        .boot-turn {
          animation: boot-turn 5.5s ease-in-out infinite;
          transform-style: preserve-3d;
        }
        .boot-glow {
          animation: boot-glow 5.5s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .boot-turn, .boot-glow { animation: none; }
        }
      `}</style>
      <div
        className="boot-glow pointer-events-none absolute bottom-3 h-8 w-2/3 rounded-full bg-amber-400/40 blur-xl"
        aria-hidden
      />
      <div className="relative z-10 [perspective:900px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={GOLDEN_BOOT_IMAGE}
          alt=""
          className={cn(
            "boot-turn object-contain drop-shadow-[0_18px_14px_rgba(0,0,0,0.55)]",
            compact ? "h-24 w-auto" : "h-44 w-auto max-w-full"
          )}
          draggable={false}
        />
      </div>
    </div>
  );
}
