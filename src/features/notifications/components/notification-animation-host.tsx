"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  RelegationAnimation,
  type RelegationAnimData,
} from "@/features/notifications/components/relegation-animation";
import {
  TitleSurpassedAnimation,
  type TitleSurpassedAnimData,
} from "@/features/notifications/components/title-surpassed-animation";
import {
  ChampionAnimation,
  type ChampionAnimData,
} from "@/features/notifications/components/champion-animation";
import {
  ThrashingAnimation,
  type ThrashingAnimData,
} from "@/features/notifications/components/thrashing-animation";
import {
  StreakMilestoneAnimation,
  StreakBrokenAnimation,
  H2HRivalryAnimation,
  ChallengeWonAnimation,
  MatchHonorAnimation,
  TitleClinchedAnimation,
  CrewWelcomeAnimation,
  EloUpAnimation,
  type StreakMilestoneData,
  type StreakBrokenData,
  type H2HRivalryData,
  type ChallengeWonData,
  type MatchHonorData,
  type TitleClinchedData,
  type CrewWelcomeData,
  type EloUpData,
} from "@/features/notifications/components/moment-animations";

const ANIM_KINDS = new Set([
  "CHAMPION",
  "THRASHING",
  "STREAK_MILESTONE",
  "STREAK_BROKEN",
  "H2H_RIVALRY",
  "CHALLENGE_WON",
  "MATCH_HONOR",
  "TITLE_CLINCHED",
  "CREW_WELCOME",
  "ELO_UP",
]);

export function isAnimatableNotification(
  type: string,
  meta: Record<string, unknown>
) {
  if (meta.animate !== true) return false;
  if (type === "RELEGATION" || type === "TITLE_SURPASSED") return true;
  return typeof meta.kind === "string" && ANIM_KINDS.has(meta.kind);
}

type Active =
  | { kind: "RELEGATION"; data: RelegationAnimData }
  | { kind: "TITLE_SURPASSED"; data: TitleSurpassedAnimData }
  | { kind: "CHAMPION"; data: ChampionAnimData }
  | { kind: "THRASHING"; data: ThrashingAnimData }
  | { kind: "STREAK_MILESTONE"; data: StreakMilestoneData }
  | { kind: "STREAK_BROKEN"; data: StreakBrokenData }
  | { kind: "H2H_RIVALRY"; data: H2HRivalryData }
  | { kind: "CHALLENGE_WON"; data: ChallengeWonData }
  | { kind: "MATCH_HONOR"; data: MatchHonorData }
  | { kind: "TITLE_CLINCHED"; data: TitleClinchedData }
  | { kind: "CREW_WELCOME"; data: CrewWelcomeData }
  | { kind: "ELO_UP"; data: EloUpData };

export function parseNotificationAnimation(
  type: string,
  meta: Record<string, unknown>
): Active | null {
  if (type === "RELEGATION") {
    return {
      kind: "RELEGATION",
      data: {
        previousDivision: Number(meta.previousDivision ?? 1),
        currentDivision: Number(meta.currentDivision ?? 2),
        tournamentName:
          typeof meta.tournamentName === "string"
            ? meta.tournamentName
            : undefined,
      },
    };
  }
  if (type === "TITLE_SURPASSED") {
    return {
      kind: "TITLE_SURPASSED",
      data: {
        byNickname:
          typeof meta.byNickname === "string" ? meta.byNickname : "Rival",
        titles: Number(meta.titles ?? 1),
      },
    };
  }

  switch (meta.kind) {
    case "CHAMPION":
      return {
        kind: "CHAMPION",
        data: {
          leagueName:
            typeof meta.leagueName === "string"
              ? meta.leagueName
              : "la competición",
          leagueId: typeof meta.leagueId === "string" ? meta.leagueId : null,
          trophyUrl:
            typeof meta.trophyUrl === "string" ? meta.trophyUrl : null,
          tournamentName:
            typeof meta.tournamentName === "string"
              ? meta.tournamentName
              : null,
          tournamentId:
            typeof meta.tournamentId === "string" ? meta.tournamentId : null,
          titlesCount:
            typeof meta.titlesCount === "number"
              ? meta.titlesCount
              : undefined,
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
    case "THRASHING":
      return {
        kind: "THRASHING",
        data: {
          margin: Number(meta.margin ?? 5),
          scoreLabel:
            typeof meta.scoreLabel === "string" ? meta.scoreLabel : "5-0",
          winnerNickname:
            typeof meta.winnerNickname === "string"
              ? meta.winnerNickname
              : "Rival",
          loserNickname:
            typeof meta.loserNickname === "string"
              ? meta.loserNickname
              : "Rival",
          youWereThrashed: meta.youWereThrashed === true,
        },
      };
    case "STREAK_MILESTONE":
      return {
        kind: "STREAK_MILESTONE",
        data: { streak: Number(meta.streak ?? 3) },
      };
    case "STREAK_BROKEN":
      return {
        kind: "STREAK_BROKEN",
        data: {
          brokenStreak: Number(meta.brokenStreak ?? 3),
          byNickname:
            typeof meta.byNickname === "string" ? meta.byNickname : undefined,
        },
      };
    case "H2H_RIVALRY":
      return {
        kind: "H2H_RIVALRY",
        data: {
          opponentNickname:
            typeof meta.opponentNickname === "string"
              ? meta.opponentNickname
              : "Rival",
          yourWins: Number(meta.yourWins ?? 0),
          theirWins: Number(meta.theirWins ?? 0),
          mode: meta.mode === "lead" ? "lead" : "tied",
        },
      };
    case "CHALLENGE_WON":
      return {
        kind: "CHALLENGE_WON",
        data: {
          opponentNickname:
            typeof meta.opponentNickname === "string"
              ? meta.opponentNickname
              : "Rival",
          scoreLabel:
            typeof meta.scoreLabel === "string" ? meta.scoreLabel : "1-0",
          crewName:
            typeof meta.crewName === "string" ? meta.crewName : undefined,
        },
      };
    case "MATCH_HONOR":
      return {
        kind: "MATCH_HONOR",
        data: {
          kind: meta.honorKind === "MVP" ? "MVP" : "HAT_TRICK",
          goals:
            typeof meta.goals === "number" ? meta.goals : undefined,
          opponentNickname:
            typeof meta.opponentNickname === "string"
              ? meta.opponentNickname
              : undefined,
        },
      };
    case "TITLE_CLINCHED":
      return {
        kind: "TITLE_CLINCHED",
        data: {
          tournamentName:
            typeof meta.tournamentName === "string"
              ? meta.tournamentName
              : "el torneo",
          pointsLead:
            typeof meta.pointsLead === "number" ? meta.pointsLead : undefined,
        },
      };
    case "CREW_WELCOME":
      return {
        kind: "CREW_WELCOME",
        data: {
          crewName:
            typeof meta.crewName === "string" ? meta.crewName : "Amigos",
        },
      };
    case "ELO_UP":
      return {
        kind: "ELO_UP",
        data: {
          elo: Number(meta.elo ?? 0),
          level: Number(meta.level ?? 1),
          previousElo:
            typeof meta.previousElo === "number"
              ? meta.previousElo
              : undefined,
        },
      };
    default:
      return null;
  }
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
    <>
      <RelegationAnimation
        open={active?.kind === "RELEGATION"}
        data={active?.kind === "RELEGATION" ? active.data : null}
        onClose={onClose}
      />
      <TitleSurpassedAnimation
        open={active?.kind === "TITLE_SURPASSED"}
        data={active?.kind === "TITLE_SURPASSED" ? active.data : null}
        onClose={() => closeAndGo("/crews")}
      />
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
      <ThrashingAnimation
        open={active?.kind === "THRASHING"}
        data={active?.kind === "THRASHING" ? active.data : null}
        onClose={() => closeAndGo("/crews")}
      />
      <StreakMilestoneAnimation
        open={active?.kind === "STREAK_MILESTONE"}
        data={active?.kind === "STREAK_MILESTONE" ? active.data : null}
        onClose={onClose}
      />
      <StreakBrokenAnimation
        open={active?.kind === "STREAK_BROKEN"}
        data={active?.kind === "STREAK_BROKEN" ? active.data : null}
        onClose={onClose}
      />
      <H2HRivalryAnimation
        open={active?.kind === "H2H_RIVALRY"}
        data={active?.kind === "H2H_RIVALRY" ? active.data : null}
        onClose={() => closeAndGo("/crews")}
      />
      <ChallengeWonAnimation
        open={active?.kind === "CHALLENGE_WON"}
        data={active?.kind === "CHALLENGE_WON" ? active.data : null}
        onClose={() => closeAndGo("/crews")}
      />
      <MatchHonorAnimation
        open={active?.kind === "MATCH_HONOR"}
        data={active?.kind === "MATCH_HONOR" ? active.data : null}
        onClose={onClose}
      />
      <TitleClinchedAnimation
        open={active?.kind === "TITLE_CLINCHED"}
        data={active?.kind === "TITLE_CLINCHED" ? active.data : null}
        onClose={() => closeAndGo("/tournaments")}
      />
      <CrewWelcomeAnimation
        open={active?.kind === "CREW_WELCOME"}
        data={active?.kind === "CREW_WELCOME" ? active.data : null}
        onClose={() => closeAndGo("/crews")}
      />
      <EloUpAnimation
        open={active?.kind === "ELO_UP"}
        data={active?.kind === "ELO_UP" ? active.data : null}
        onClose={onClose}
      />
    </>
  );
}

export function useNotificationAnimationState() {
  const [active, setActive] = useState<Active | null>(null);
  return { active, setActive };
}

export type NotificationActiveAnim = Active;
