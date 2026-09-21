"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getChampionTheme,
  type ChampionTheme,
} from "@/lib/fc-data/league-trophies";
import { getTeamCrestCandidates } from "@/lib/fc-data/club-ids";
import { cn } from "@/lib/utils";
import { useState } from "react";

export type ChampionAnimData = {
  leagueName: string;
  leagueId?: string | null;
  trophyUrl?: string | null;
  titlesCount?: number;
  tournamentName?: string | null;
  tournamentId?: string | null;
  youAreChampion?: boolean;
  championNickname?: string | null;
  championTeamName?: string | null;
  championCrestUrl?: string | null;
  championFifaIndexId?: string | null;
};

function ChampionTeamCrest({
  name,
  crestUrl,
  fifaIndexId,
}: {
  name: string;
  crestUrl?: string | null;
  fifaIndexId?: string | null;
}) {
  const candidates = getTeamCrestCandidates(
    crestUrl ?? undefined,
    fifaIndexId ?? undefined
  );
  const [index, setIndex] = useState(0);
  const src = candidates[index] ?? null;

  if (!src) {
    return (
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={72}
      height={72}
      className="h-16 w-16 object-contain drop-shadow-lg"
      unoptimized
      onError={() => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }}
    />
  );
}

export function ChampionAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: ChampionAnimData | null;
  onClose: () => void;
}) {
  if (!data) return null;

  const theme: ChampionTheme = getChampionTheme(
    data.leagueId,
    data.leagueName || data.tournamentName
  );
  const displayName = data.leagueName || data.tournamentName || "la competición";
  const teamName = data.championTeamName ?? data.championNickname ?? "Campeón";
  const youAreChampion = data.youAreChampion === true;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/95 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.glow}, transparent 55%)`,
            }}
          />
          <motion.div
            className={cn(
              "absolute inset-x-0 top-1/4 h-40 bg-gradient-to-r from-transparent to-transparent blur-2xl",
              theme.stripe
            )}
            animate={{ x: ["-15%", "15%", "-15%"] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          />

          {theme.confetti.map((color, i) => (
            <motion.span
              key={`${theme.id}-${i}`}
              className="pointer-events-none absolute h-2 w-2 rounded-[2px]"
              style={{
                left: `${4 + ((i * 17) % 92)}%`,
                background: color,
              }}
              initial={{ y: -30, opacity: 0, rotate: 0 }}
              animate={{
                y: ["0vh", "110vh"],
                opacity: [0, 1, 1, 0],
                rotate: [0, 180 + i * 20],
                x: [0, (i % 2 === 0 ? 1 : -1) * (10 + (i % 7) * 4)],
              }}
              transition={{
                duration: 2.8 + (i % 5) * 0.25,
                repeat: Infinity,
                delay: i * 0.1,
                ease: "linear",
              }}
            />
          ))}

          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={`extra-${i}`}
              className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
              style={{
                left: `${8 + ((i * 23) % 84)}%`,
                background: theme.confetti[i % theme.confetti.length],
              }}
              initial={{ y: -20, opacity: 0 }}
              animate={{
                y: ["0vh", "105vh"],
                opacity: [0, 0.9, 0],
                x: [0, (i % 2 === 0 ? -1 : 1) * (8 + i * 3)],
              }}
              transition={{
                duration: 3.2 + (i % 4) * 0.2,
                repeat: Infinity,
                delay: 0.4 + i * 0.12,
                ease: "linear",
              }}
            />
          ))}

          <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
            <motion.p
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "mb-5 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]",
                theme.badgeBorder,
                theme.badgeBg,
                theme.badgeText
              )}
            >
              {theme.eyebrow}
            </motion.p>

            <motion.div
              initial={{ scale: 0.35, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 180,
                damping: 14,
                delay: 0.15,
              }}
              className="relative mb-5 flex h-40 w-40 items-center justify-center"
            >
              <div
                className="absolute inset-0 scale-125 rounded-full blur-3xl"
                style={{ background: theme.glow }}
              />
              {data.trophyUrl ? (
                <Image
                  src={data.trophyUrl}
                  alt=""
                  width={160}
                  height={160}
                  className="relative z-10 max-h-36 max-w-36 object-contain drop-shadow-[0_12px_40px_rgba(0,0,0,0.55)]"
                  unoptimized
                />
              ) : (
                <Trophy className="relative z-10 h-24 w-24 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
              )}
            </motion.div>

            {(data.championTeamName || data.championNickname) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="mb-4 flex flex-col items-center gap-2"
              >
                <ChampionTeamCrest
                  name={teamName}
                  crestUrl={data.championCrestUrl}
                  fifaIndexId={data.championFifaIndexId}
                />
                <p className="text-lg font-bold text-white">{teamName}</p>
                {data.championNickname &&
                  data.championNickname !== teamName && (
                    <p className="text-xs text-white/50">
                      {data.championNickname}
                    </p>
                  )}
              </motion.div>
            )}

            <motion.h2
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 }}
              className={cn(
                "bg-gradient-to-b bg-clip-text text-3xl font-black uppercase tracking-tight text-transparent sm:text-4xl",
                theme.titleGradient
              )}
            >
              ¡Campeón de {displayName}!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 text-sm text-white/55"
            >
              {youAreChampion
                ? data.titlesCount != null
                  ? `Llevas ${data.titlesCount} título${data.titlesCount === 1 ? "" : "s"} en el palmarés`
                  : "La gloria es tuya"
                : `${teamName} se corona campeón del torneo`}
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 w-full"
            >
              <Button
                onClick={onClose}
                className={cn("h-12 w-full rounded-full", theme.buttonClass)}
              >
                {youAreChampion ? "¡A celebrar!" : "Ver torneo"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
