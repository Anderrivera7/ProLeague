"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type TitleSurpassedAnimData = {
  byNickname: string;
  titles: number;
};

export function TitleSurpassedAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: TitleSurpassedAnimData | null;
  onClose: () => void;
}) {
  if (!data) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/92 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(57,255,20,0.18),transparent_55%)]" />
          <motion.div
            className="absolute inset-x-0 top-1/3 h-32 bg-gradient-to-r from-transparent via-primary/20 to-transparent blur-2xl"
            animate={{ x: ["-20%", "20%", "-20%"] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-10 flex w-full max-w-sm flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              className="mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-primary/40 bg-primary/15 shadow-[0_0_40px_rgba(57,255,20,0.35)]"
            >
              <Crown className="h-10 w-10 text-primary" />
            </motion.div>

            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Rivalidad
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Te superaron en títulos
            </h2>
            <p className="mt-3 text-sm text-white/60">
              <span className="font-semibold text-primary">
                {data.byNickname}
              </span>{" "}
              ahora tiene{" "}
              <span className="font-bold text-white">{data.titles}</span>{" "}
              título{data.titles === 1 ? "" : "s"}
            </p>
            <p className="mt-2 text-xs italic text-white/40">
              La corona se disputa — a recuperar el trono
            </p>

            <Button
              onClick={onClose}
              className="mt-8 h-12 w-full rounded-full font-bold"
            >
              Ver amigos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
