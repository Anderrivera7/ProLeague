"use client";

import {
  Flame,
  Snowflake,
  Swords,
  Trophy,
  Star,
  Crown,
  Users,
  TrendingUp,
  Zap,
} from "lucide-react";
import { MomentOverlay } from "./moment-overlay";

export type StreakMilestoneData = { streak: number };
export type StreakBrokenData = {
  brokenStreak: number;
  byNickname?: string;
};
export type H2HRivalryData = {
  opponentNickname: string;
  yourWins: number;
  theirWins: number;
  mode: "tied" | "lead";
};
export type ChallengeWonData = {
  opponentNickname: string;
  scoreLabel: string;
  crewName?: string;
};
export type MatchHonorData = {
  kind: "HAT_TRICK" | "MVP";
  goals?: number;
  opponentNickname?: string;
};
export type TitleClinchedData = {
  tournamentName: string;
  pointsLead?: number;
};
export type CrewWelcomeData = {
  crewName: string;
};
export type EloUpData = {
  elo: number;
  level: number;
  previousElo?: number;
};

export function StreakMilestoneAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: StreakMilestoneData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="fire"
      icon={Flame}
      eyebrow="Racha sin perder"
      bigNumber={`${data.streak}`}
      title="¡Imparable!"
      subtitle={`${data.streak} partidos seguidos sin perder`}
      cta="Seguir así"
    />
  );
}

export function StreakBrokenAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: StreakBrokenData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="cold"
      icon={Snowflake}
      eyebrow="Racha cortada"
      bigNumber={`${data.brokenStreak}`}
      title="Se acabó la racha"
      subtitle={
        data.byNickname
          ? `${data.byNickname} te cortó ${data.brokenStreak} sin perder`
          : `Se cortó tu racha de ${data.brokenStreak}`
      }
      cta="A reconstruir"
    />
  );
}

export function H2HRivalryAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: H2HRivalryData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  const score = `${data.yourWins}-${data.theirWins}`;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="rival"
      icon={Swords}
      eyebrow="Rivalidad"
      bigNumber={score}
      title={data.mode === "tied" ? "¡Empate en el historial!" : "¡Tomas la delantera!"}
      subtitle={
        data.mode === "tied"
          ? `Ahora vas ${score} vs ${data.opponentNickname}`
          : `Ahora vas ${score} vs ${data.opponentNickname}`
      }
      cta="Ver rivalidad"
    />
  );
}

export function ChallengeWonAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: ChallengeWonData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="win"
      icon={Zap}
      eyebrow="Reto Amigos"
      title="¡Reto ganado!"
      subtitle={`${data.scoreLabel} vs ${data.opponentNickname}${data.crewName ? ` · ${data.crewName}` : ""}`}
      cta="Ver Amigos"
    />
  );
}

export function MatchHonorAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: MatchHonorData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  const isHat = data.kind === "HAT_TRICK";
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="honor"
      icon={isHat ? Star : Trophy}
      eyebrow={isHat ? "Hat-trick" : "MVP"}
      bigNumber={isHat ? `${data.goals ?? 3}` : undefined}
      title={isHat ? "¡Hat-trick!" : "¡MVP del partido!"}
      subtitle={
        isHat
          ? `${data.goals ?? 3} goles en el partido`
          : data.opponentNickname
            ? `Elegido MVP vs ${data.opponentNickname}`
            : "El mejor del encuentro"
      }
      cta="Brutal"
    />
  );
}

export function TitleClinchedAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: TitleClinchedData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="gold"
      icon={Crown}
      eyebrow="Título matemático"
      title="¡Ya eres campeón!"
      subtitle={`Nadie te alcanza en ${data.tournamentName}${
        data.pointsLead != null ? ` · +${data.pointsLead} pts de ventaja` : ""
      }`}
      cta="A celebrar"
    />
  );
}

export function CrewWelcomeAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: CrewWelcomeData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="welcome"
      icon={Users}
      eyebrow="Bienvenido"
      title={`¡Hola, ${data.crewName}!`}
      subtitle="Ya formas parte del grupo. Reta, compara y pelea el podio."
      cta="Explorar Amigos"
    />
  );
}

export function EloUpAnimation({
  open,
  data,
  onClose,
}: {
  open: boolean;
  data: EloUpData | null;
  onClose: () => void;
}) {
  if (!data) return null;
  return (
    <MomentOverlay
      open={open}
      onClose={onClose}
      tone="elo"
      icon={TrendingUp}
      eyebrow="Subes de nivel"
      bigNumber={`Nv.${data.level}`}
      title="¡Nivel arriba!"
      subtitle={`Elo ${data.elo}${
        data.previousElo != null ? ` · venías de ${data.previousElo}` : ""
      }`}
      cta="A por más"
    />
  );
}
