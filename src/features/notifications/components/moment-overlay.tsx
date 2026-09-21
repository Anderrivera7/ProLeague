"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MomentOverlay({
  open,
  onClose,
  tone,
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  cta = "Continuar",
  bigNumber,
}: {
  open: boolean;
  onClose: () => void;
  tone: "fire" | "cold" | "rival" | "win" | "gold" | "welcome" | "elo" | "honor";
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle?: string;
  cta?: string;
  bigNumber?: string;
}) {
  const tones: Record<
    typeof tone,
    { glow: string; stripe: string; badge: string; iconBox: string; title: string; btn: string }
  > = {
    fire: {
      glow: "rgba(249,115,22,0.32)",
      stripe: "via-orange-400/30",
      badge: "border-orange-400/50 bg-orange-500/15 text-orange-200",
      iconBox: "border-orange-400/50 bg-orange-500/15 text-orange-300",
      title: "from-orange-100 via-amber-300 to-orange-500",
      btn: "bg-gradient-to-r from-orange-400 to-amber-500 font-bold text-black hover:from-orange-300 hover:to-amber-400",
    },
    cold: {
      glow: "rgba(148,163,184,0.28)",
      stripe: "via-slate-400/25",
      badge: "border-slate-400/40 bg-slate-500/15 text-slate-200",
      iconBox: "border-slate-400/40 bg-slate-500/15 text-slate-300",
      title: "from-slate-100 via-slate-300 to-slate-500",
      btn: "bg-gradient-to-r from-slate-400 to-slate-600 font-bold text-white hover:from-slate-300 hover:to-slate-500",
    },
    rival: {
      glow: "rgba(244,63,94,0.3)",
      stripe: "via-rose-400/30",
      badge: "border-rose-400/50 bg-rose-500/15 text-rose-200",
      iconBox: "border-rose-400/50 bg-rose-500/15 text-rose-300",
      title: "from-rose-100 via-pink-300 to-rose-500",
      btn: "bg-gradient-to-r from-rose-400 to-pink-500 font-bold text-white hover:from-rose-300 hover:to-pink-400",
    },
    win: {
      glow: "rgba(57,255,20,0.22)",
      stripe: "via-primary/30",
      badge: "border-primary/50 bg-primary/15 text-primary",
      iconBox: "border-primary/50 bg-primary/15 text-primary",
      title: "from-primary via-emerald-200 to-lime-300",
      btn: "bg-primary font-bold text-black hover:bg-primary/90",
    },
    gold: {
      glow: "rgba(250,204,21,0.3)",
      stripe: "via-yellow-400/30",
      badge: "border-yellow-400/50 bg-yellow-500/10 text-yellow-200",
      iconBox: "border-yellow-400/50 bg-yellow-500/15 text-yellow-300",
      title: "from-yellow-100 via-yellow-300 to-amber-500",
      btn: "bg-gradient-to-r from-yellow-400 to-amber-500 font-bold text-black hover:from-yellow-300 hover:to-amber-400",
    },
    welcome: {
      glow: "rgba(56,189,248,0.28)",
      stripe: "via-sky-400/30",
      badge: "border-sky-400/50 bg-sky-500/15 text-sky-200",
      iconBox: "border-sky-400/50 bg-sky-500/15 text-sky-300",
      title: "from-sky-100 via-cyan-200 to-sky-400",
      btn: "bg-gradient-to-r from-sky-400 to-cyan-500 font-bold text-black hover:from-sky-300 hover:to-cyan-400",
    },
    elo: {
      glow: "rgba(167,139,250,0.32)",
      stripe: "via-violet-400/30",
      badge: "border-violet-400/50 bg-violet-500/15 text-violet-200",
      iconBox: "border-violet-400/50 bg-violet-500/15 text-violet-300",
      title: "from-violet-100 via-purple-200 to-violet-400",
      btn: "bg-gradient-to-r from-violet-500 to-purple-600 font-bold text-white hover:from-violet-400 hover:to-purple-500",
    },
    honor: {
      glow: "rgba(251,191,36,0.3)",
      stripe: "via-amber-400/30",
      badge: "border-amber-400/50 bg-amber-500/15 text-amber-200",
      iconBox: "border-amber-400/50 bg-amber-500/15 text-amber-300",
      title: "from-amber-100 via-yellow-300 to-amber-500",
      btn: "bg-gradient-to-r from-amber-400 to-yellow-500 font-bold text-black hover:from-amber-300 hover:to-yellow-400",
    },
  };

  const t = tones[tone];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/94 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${t.glow}, transparent 55%)`,
            }}
          />
          <motion.div
            className={cn(
              "absolute inset-x-0 top-1/3 h-28 bg-gradient-to-r from-transparent to-transparent blur-2xl",
              t.stripe
            )}
            animate={{ scaleX: [0.85, 1.15, 0.85] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          />

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
            <motion.p
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "mb-4 rounded-full border px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                t.badge
              )}
            >
              {eyebrow}
            </motion.p>

            <motion.div
              initial={{ scale: 0.45, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className={cn(
                "mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border shadow-[0_0_36px_rgba(0,0,0,0.35)]",
                t.iconBox
              )}
            >
              <Icon className="h-8 w-8" />
            </motion.div>

            {bigNumber && (
              <motion.p
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
                className={cn(
                  "mb-1 bg-gradient-to-b bg-clip-text text-6xl font-black tabular-nums text-transparent",
                  t.title
                )}
              >
                {bigNumber}
              </motion.p>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={cn(
                "bg-gradient-to-b bg-clip-text text-2xl font-black uppercase tracking-tight text-transparent sm:text-3xl",
                t.title
              )}
            >
              {title}
            </motion.h2>

            {subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-3 text-sm text-white/55"
              >
                {subtitle}
              </motion.p>
            )}

            <Button
              onClick={onClose}
              className={cn("mt-8 h-12 w-full rounded-full", t.btn)}
            >
              {cta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
