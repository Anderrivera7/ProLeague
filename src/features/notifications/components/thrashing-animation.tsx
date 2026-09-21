"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ThrashingAnimData = {
  margin: number;
  scoreLabel: string;
  winnerNickname: string;
  loserNickname: string;
  /** Si el usuario actual es el goleado */
  youWereThrashed?: boolean;
};

export function ThrashingAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: ThrashingAnimData | null;
  onClose: () => void;
}) {
  if (!data) return null;

  const isHumiliation = data.margin >= 5;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/94 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.28),transparent_55%)]" />
          <motion.div
            className="absolute inset-x-0 top-1/3 h-32 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent blur-2xl"
            animate={{ scaleX: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          />

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 14 }}
              className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-500/15 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
            >
              <Swords className="h-10 w-10 text-amber-300" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300"
            >
              {isHumiliation ? "Humillación" : "Goleada"}
            </motion.p>

            <motion.p
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.15 }}
              className="mt-3 text-6xl font-black tabular-nums text-amber-300 drop-shadow-[0_0_24px_rgba(245,158,11,0.55)] sm:text-7xl"
            >
              +{data.margin}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-2 font-mono text-lg font-bold text-white"
            >
              {data.scoreLabel}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-sm text-white/60"
            >
              {data.youWereThrashed ? (
                <>
                  <span className="font-semibold text-amber-300">
                    {data.winnerNickname}
                  </span>{" "}
                  te goleó en Amigos
                </>
              ) : (
                <>
                  Aplastaste a{" "}
                  <span className="font-semibold text-amber-300">
                    {data.loserNickname}
                  </span>
                </>
              )}
            </motion.p>

            {isHumiliation && (
              <p className="mt-2 text-xs italic text-white/40">
                Diferencia de {data.margin} goles · queda en el podio de goleadas
              </p>
            )}

            <Button
              onClick={onClose}
              className="mt-8 h-12 w-full rounded-full bg-amber-500 font-bold text-black hover:bg-amber-400"
            >
              Ver Amigos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
