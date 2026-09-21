import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/services/notification-service";

type Db = typeof prisma | Prisma.TransactionClient;

const STREAK_MILESTONES = [3, 5, 10] as const;

/** Notificaciones animadas (kind en metadata). Sin tocar schema. */
export class MomentService {
  static async notify(
    db: Db,
    input: {
      userId: string;
      kind: string;
      title: string;
      body?: string;
      href?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    return NotificationService.create(db, {
      userId: input.userId,
      type: "GENERAL",
      title: input.title,
      body: input.body ?? null,
      href: input.href ?? null,
      metadata: {
        animate: true,
        kind: input.kind,
        ...input.metadata,
      },
    });
  }

  static streakMilestoneKind(streak: number) {
    return STREAK_MILESTONES.includes(streak as (typeof STREAK_MILESTONES)[number]);
  }

  static async maybeStreakMoments(
    db: Db,
    input: {
      userId: string;
      previousStreak: number;
      nextStreak: number;
      lost: boolean;
      opponentNickname?: string;
    }
  ) {
    if (input.lost && input.previousStreak >= 3) {
      await this.notify(db, {
        userId: input.userId,
        kind: "STREAK_BROKEN",
        title: "Racha cortada",
        body: `Se cortó tu racha de ${input.previousStreak}`,
        href: "/dashboard",
        metadata: {
          brokenStreak: input.previousStreak,
          byNickname: input.opponentNickname,
        },
      });
      return;
    }

    if (this.streakMilestoneKind(input.nextStreak)) {
      await this.notify(db, {
        userId: input.userId,
        kind: "STREAK_MILESTONE",
        title: "¡Imparable!",
        body: `${input.nextStreak} partidos sin perder`,
        href: "/dashboard",
        metadata: { streak: input.nextStreak },
      });
    }
  }

  static async maybeEloUp(
    db: Db,
    input: {
      userId: string;
      previousElo: number;
      nextElo: number;
    }
  ) {
    const prevLevel = Math.floor(input.previousElo / 100) + 1;
    const nextLevel = Math.floor(input.nextElo / 100) + 1;
    if (nextLevel <= prevLevel) return;

    await this.notify(db, {
      userId: input.userId,
      kind: "ELO_UP",
      title: "¡Nivel arriba!",
      body: `Nivel ${nextLevel} · Elo ${input.nextElo}`,
      href: `/players/${input.userId}`,
      metadata: {
        elo: input.nextElo,
        level: nextLevel,
        previousElo: input.previousElo,
      },
    });
  }

  static async maybeMatchHonors(
    db: Db,
    input: {
      userId: string;
      goals: number;
      isMvp: boolean;
      opponentNickname?: string;
      href?: string;
    }
  ) {
    if (input.goals >= 3) {
      await this.notify(db, {
        userId: input.userId,
        kind: "MATCH_HONOR",
        title: "¡Hat-trick!",
        body: `${input.goals} goles en el partido`,
        href: input.href,
        metadata: {
          honorKind: "HAT_TRICK",
          goals: input.goals,
          opponentNickname: input.opponentNickname,
        },
      });
    } else if (input.isMvp) {
      await this.notify(db, {
        userId: input.userId,
        kind: "MATCH_HONOR",
        title: "¡MVP del partido!",
        body: input.opponentNickname
          ? `MVP vs ${input.opponentNickname}`
          : "Elegido MVP",
        href: input.href,
        metadata: {
          honorKind: "MVP",
          opponentNickname: input.opponentNickname,
        },
      });
    }
  }

  static async maybeH2HRivalry(
    db: Db,
    input: {
      userId: string;
      opponentId: string;
      opponentNickname: string;
      previousWins: number;
      previousOppWins: number;
      won: boolean;
      href?: string;
    }
  ) {
    if (!input.won) return;

    const yourWins = input.previousWins + 1;
    const theirWins = input.previousOppWins;

    const wasBehind = input.previousWins < input.previousOppWins;
    const wasTied = input.previousWins === input.previousOppWins;

    let mode: "tied" | "lead" | null = null;
    if (wasBehind && yourWins === theirWins) mode = "tied";
    else if ((wasBehind || wasTied) && yourWins > theirWins) mode = "lead";

    if (!mode) return;

    await this.notify(db, {
      userId: input.userId,
      kind: "H2H_RIVALRY",
      title: mode === "tied" ? "Empate en el historial" : "Tomas la delantera",
      body: `Ahora vas ${yourWins}-${theirWins} vs ${input.opponentNickname}`,
      href: input.href ?? `/players/compare?a=${input.userId}&b=${input.opponentId}`,
      metadata: {
        opponentNickname: input.opponentNickname,
        yourWins,
        theirWins,
        mode,
      },
    });
  }

  static async challengeWon(
    db: Db,
    input: {
      userId: string;
      opponentNickname: string;
      scoreLabel: string;
      crewId: string;
      crewName?: string;
    }
  ) {
    await this.notify(db, {
      userId: input.userId,
      kind: "CHALLENGE_WON",
      title: "¡Reto ganado!",
      body: `${input.scoreLabel} vs ${input.opponentNickname}`,
      href: `/crews/${input.crewId}`,
      metadata: {
        opponentNickname: input.opponentNickname,
        scoreLabel: input.scoreLabel,
        crewName: input.crewName,
      },
    });
  }

  static async crewWelcome(
    db: Db,
    input: { userId: string; crewId: string; crewName: string }
  ) {
    await this.notify(db, {
      userId: input.userId,
      kind: "CREW_WELCOME",
      title: `Bienvenido a ${input.crewName}`,
      body: "Ya formas parte del grupo",
      href: `/crews/${input.crewId}`,
      metadata: { crewName: input.crewName, crewId: input.crewId },
    });
  }

  /** Título matemático: líder inalcanzable con partidos restantes. */
  static async maybeTitleClinched(
    db: Db,
    input: {
      tournamentId: string;
      tournamentName: string;
      groupName?: string | null;
    }
  ) {
    const standings = await db.standing.findMany({
      where: {
        tournamentId: input.tournamentId,
        groupName: input.groupName ?? null,
      },
      include: {
        participant: { select: { userId: true } },
      },
      orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
    });

    if (standings.length < 2) return;
    const leader = standings[0];
    const second = standings[1];
    if (!leader?.participant?.userId || !second) return;

    const remaining = await db.match.count({
      where: {
        tournamentId: input.tournamentId,
        status: { in: ["SCHEDULED", "LIVE", "PENDING_CONFIRMATION"] },
        OR: [
          { homeParticipantId: second.participantId },
          { awayParticipantId: second.participantId },
        ],
        ...(input.groupName ? { groupName: input.groupName } : {}),
      },
    });

    const maxCatch = remaining * 3;
    const lead = leader.points - second.points;
    if (lead <= maxCatch) return;

    const recent = await db.notification.findMany({
      where: { userId: leader.participant.userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { metadata: true },
    });
    const dup = recent.some((n) => {
      const m = n.metadata as Record<string, unknown> | null;
      return (
        m?.kind === "TITLE_CLINCHED" && m?.tournamentId === input.tournamentId
      );
    });
    if (dup) return;

    await this.notify(db, {
      userId: leader.participant.userId,
      kind: "TITLE_CLINCHED",
      title: "¡Título matemático!",
      body: `Nadie te alcanza en ${input.tournamentName}`,
      href: `/tournaments/${input.tournamentId}`,
      metadata: {
        tournamentId: input.tournamentId,
        tournamentName: input.tournamentName,
        pointsLead: lead,
      },
    });
  }
}
