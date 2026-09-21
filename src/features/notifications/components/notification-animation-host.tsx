"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChampionAnimation,
  type ChampionAnimData,
} from "@/features/notifications/components/champion-animation";

export function isAnimatableNotification(
  _type: string,
  meta: Record<string, unknown>
) {
  if (meta.animate !== true) return false;
  // Solo el campeón ve la animación a pantalla completa.
  return meta.kind === "CHAMPION" && meta.youAreChampion === true;
}

type Active = { kind: "CHAMPION"; data: ChampionAnimData };

export function parseNotificationAnimation(
  _type: string,
  meta: Record<string, unknown>
): Active | null {
  if (meta.kind !== "CHAMPION" || meta.youAreChampion !== true) return null;

  return {
    kind: "CHAMPION",
    data: {
      leagueName:
        typeof meta.leagueName === "string"
          ? meta.leagueName
          : "la competición",
      leagueId: typeof meta.leagueId === "string" ? meta.leagueId : null,
      trophyUrl: typeof meta.trophyUrl === "string" ? meta.trophyUrl : null,
      tournamentName:
        typeof meta.tournamentName === "string" ? meta.tournamentName : null,
      tournamentId:
        typeof meta.tournamentId === "string" ? meta.tournamentId : null,
      titlesCount:
        typeof meta.titlesCount === "number" ? meta.titlesCount : undefined,
      youAreChampion: meta.youAreChampion === true,
      championNickname:
        typeof meta.championNickname === "string"
          ? meta.championNickname
          : null,
      championTeamName:
        typeof meta.championTeamName === "string"
          ? meta.championTeamName
          : null,
      championCrestUrl:
        typeof meta.championCrestUrl === "string"
          ? meta.championCrestUrl
          : null,
      championFifaIndexId:
        typeof meta.championFifaIndexId === "string"
          ? meta.championFifaIndexId
          : null,
    },
  };
}

export function NotificationAnimationHost({
  active,
  onClose,
}: {
  active: Active | null;
  onClose: () => void;
}) {
  const router = useRouter();

  function closeAndGo(href?: string) {
    onClose();
    if (href) router.push(href);
  }

  return (
    <ChampionAnimation
      open={active?.kind === "CHAMPION"}
      data={active?.kind === "CHAMPION" ? active.data : null}
      onClose={() => {
        if (active?.kind === "CHAMPION" && !active.data.youAreChampion) {
          const tid = active.data.tournamentId;
          closeAndGo(tid ? `/tournaments/${tid}` : "/tournaments");
          return;
        }
        closeAndGo("/titles");
      }}
    />
  );
}

export function useNotificationAnimationState() {
  const [active, setActive] = useState<Active | null>(null);
  return { active, setActive };
}

export type NotificationActiveAnim = Active;
