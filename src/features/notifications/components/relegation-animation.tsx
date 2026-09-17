"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type RelegationAnimData = {
  previousDivision: number;
  currentDivision: number;
  tournamentName?: string;
};

export function RelegationAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: RelegationAnimData | null;
  onClose: () => void;
}) {
  if (!data) return null;

  const prev = data.previousDivision;
  const curr = data.currentDivision;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/95 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Beams */}
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-red-600/25 to-transparent blur-2xl" />
            <div className="absolute -right-1/4 top-0 h-full w-1/2 -rotate-12 bg-gradient-to-l from-transparent via-red-500/20 to-transparent blur-2xl" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.25),transparent_60%)]" />
          </motion.div>

          {/* Particles */}
          {Array.from({ length: 18 }).map((_, i) => (
            <motion.span
              key={i}
              className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-red-500/70"
              style={{ left: `${8 + ((i * 17) % 84)}%` }}
              initial={{ y: -40, opacity: 0 }}
              animate={{
                y: ["0vh", "110vh"],
                opacity: [0, 1, 0.8, 0],
                x: [0, (i % 2 === 0 ? 1 : -1) * (12 + i)],
              }}
              transition={{
                duration: 3.2 + (i % 5) * 0.35,
                repeat: Infinity,
                delay: i * 0.12,
                ease: "linear",
              }}
            />
          ))}

          <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-500/60 bg-red-950/60 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white"
            >
              <ArrowDown className="h-3.5 w-3.5 text-red-400" />
              Nuevo descenso
            </motion.div>

            <motion.div
              initial={{ scale: 0.4, opacity: 0, y: -40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.25 }}
              className="relative mb-6"
            >
              <div className="absolute inset-0 scale-150 rounded-full bg-red-600/30 blur-3xl" />
              <div className="relative flex h-36 w-36 items-center justify-center sm:h-40 sm:w-40">
                <div className="absolute inset-0 rounded-[2rem] border-2 border-red-500/80 bg-gradient-to-b from-[#2a2a2a] to-[#0a0a0a] shadow-[0_0_40px_rgba(220,38,38,0.55)] [clip-path:polygon(50%_0%,95%_25%,95%_75%,50%_100%,5%_75%,5%_25%)]" />
                <div className="relative z-10 flex flex-col items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-300/80">
                    ★
                  </span>
                  <span className="text-5xl font-black text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
                    {curr}
                  </span>
                  <ArrowDown className="mt-1 h-5 w-5 text-red-400" />
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-sm font-semibold uppercase tracking-[0.18em] text-white/80"
            >
              Has descendido a
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-2 bg-gradient-to-b from-red-300 to-red-600 bg-clip-text text-4xl font-black uppercase tracking-tight text-transparent sm:text-5xl"
              style={{ textShadow: "0 0 30px rgba(220,38,38,0.45)" }}
            >
              División {curr}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-3 text-sm italic text-white/50"
            >
              No te rindas, ¡vuelve más fuerte!
            </motion.p>

            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-8 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md"
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-white/40">
                  Anterior
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 text-lg font-black text-sky-200">
                  {prev}
                </div>
                <span className="text-[10px] font-semibold text-white/70">
                  División {prev}
                </span>
              </div>
              <ChevronRight className="h-6 w-6 text-red-400" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] uppercase tracking-wider text-red-300/70">
                  Ahora
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/60 bg-red-500/15 text-lg font-black text-red-300 shadow-[0_0_16px_rgba(220,38,38,0.35)]">
                  {curr}
                </div>
                <span className="text-[10px] font-semibold text-red-300">
                  División {curr}
                </span>
              </div>
            </motion.div>

            {data.tournamentName && (
              <p className="mt-3 text-[11px] text-white/35">
                {data.tournamentName}
              </p>
            )}

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-8 w-full"
            >
              <Button
                onClick={onClose}
                className="h-12 w-full rounded-full bg-red-600 text-sm font-bold uppercase tracking-wide text-white hover:bg-red-500"
              >
                ¡Sigue adelante!
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
