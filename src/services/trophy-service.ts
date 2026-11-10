import type { Prisma, TournamentType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getCompetitionTitleLabel,
  getLeagueTrophyUrl,
} from "@/lib/fc-data/league-trophies";
import { calculateLevel } from "@/utils/points";
import { NotificationService } from "@/services/notification-service";
import { resolvePlayerImageUrl } from "@/lib/fc-data/player-image";
import {
  GOLDEN_BOOT_IMAGE,
  GOLDEN_BOOT_PREFIX,
  goldenBootGoalCount,
  goldenBootTitle,
} from "@/lib/awards/golden-boot";

type Db = typeof prisma | Prisma.TransactionClient;

type AwardMatch = Prisma.MatchGetPayload<{
  include: {
    tournament: { include: { fcLeague: true; season: true } };
    homeParticipant: { include: { user: true; fcTeam: true } };
    awayParticipant: { include: { user: true; fcTeam: true } };
  };
}>;

export class TrophyService {
  /** Otorga el título al campeón cuando el torneo queda decidido. */
  static async maybeAwardFromCompletedMatch(
    db: Db,
    matchId: string
  ): Promise<boolean> {
    const match = await db.match.findUnique({
      where: { id: matchId },
      include: {
        tournament: {
          include: {
            fcLeague: true,
            season: true,
          },
        },
        homeParticipant: { include: { user: true, fcTeam: true } },
        awayParticipant: { include: { user: true, fcTeam: true } },
      },
    });

    if (!match || match.status !== "COMPLETED") return false;

    const existing = await db.trophy.findFirst({
      where: {
        tournamentId: match.tournamentId,
        placement: 1,
      },
    });
    if (existing) return false;

    const type = match.tournament.type as TournamentType;

    if (type === "LEAGUE" || type === "GROUPS") {
      const awarded = await this.maybeAwardFromStandings(db, match);
      if (awarded && type === "LEAGUE") {
        await this.processLeagueRelegations(
          db,
          match.tournamentId,
          match.tournament.name
        );
      }
      return awarded;
    }

    return this.maybeAwardFromKnockoutFinal(db, match);
  }

  /**
   * Descenso: último en la tabla final con 0 puntos.
   */
  private static async processLeagueRelegations(
    db: Db,
    tournamentId: string,
    tournamentName: string
  ) {
    const standings = await db.standing.findMany({
      where: { tournamentId, groupName: null },
      orderBy: [{ points: "asc" }, { gd: "asc" }, { gf: "asc" }],
      include: {
        participant: { select: { id: true, userId: true } },
      },
    });

    if (standings.length < 2) return;

    const last = standings[0];
    if (!last?.participant || last.points !== 0) return;
    if (!standings.some((s) => s.points > 0)) return;

    const relegated = standings.filter((s) => s.points === 0 && s.participant);

    for (const row of relegated) {
      const userId = row.participant.userId;

      const stats = await db.playerStats.upsert({
        where: { userId },
        create: { userId, relegations: 1 },
        update: { relegations: { increment: 1 } },
      });

      const newCount = stats.relegations;
      const previousDivision = newCount;
      const currentDivision = newCount + 1;

      await db.tournamentParticipant.update({
        where: { id: row.participant.id },
        data: {
          eliminated: true,
          placement: standings.length,
        },
      });

      await db.activity.create({
        data: {
          userId,
          type: "RELEGATED",
          title: `Descenso en ${tournamentName}`,
          metadata: {
            tournamentId,
            previousDivision,
            currentDivision,
            points: 0,
          },
        },
      });

      await NotificationService.create(db, {
        userId,
        type: "RELEGATION",
        title: "Nuevo descenso",
        body: `Has descendido a División ${currentDivision} · ${tournamentName}`,
        href: "/profile",
        metadata: {
          tournamentId,
          tournamentName,
          previousDivision,
          currentDivision,
          animate: true,
        },
      });
    }
  }

  private static async maybeAwardFromStandings(
    db: Db,
    match: AwardMatch
  ): Promise<boolean> {
    const pending = await db.match.count({
      where: {
        tournamentId: match.tournamentId,
        status: { not: "COMPLETED" },
      },
    });
    if (pending > 0) return false;

    const top = await db.standing.findFirst({
      where: {
        tournamentId: match.tournamentId,
        ...(match.tournament.type === "LEAGUE" ? { groupName: null } : {}),
      },
      orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
      include: {
        participant: true,
      },
    });

    if (!top?.participant) return false;

    return this.awardChampion(db, {
      userId: top.participant.userId,
      participantId: top.participant.id,
      tournamentId: match.tournamentId,
      tournamentName: match.tournament.name,
      leagueName: match.tournament.fcLeague?.name,
      leagueId: match.tournament.fcLeague?.fifaIndexId,
      seasonName: match.tournament.season?.name ?? null,
      wonAt: match.playedAt ?? new Date(),
    });
  }

  private static async maybeAwardFromKnockoutFinal(
    db: Db,
    match: AwardMatch
  ): Promise<boolean> {
    if (match.groupName) return false;
    if (match.homeScore == null || match.awayScore == null) return false;
    if (match.homeScore === match.awayScore) {
      if (match.penaltiesHome == null || match.penaltiesAway == null)
        return false;
      if (match.penaltiesHome === match.penaltiesAway) return false;
    }

    // Grupos + eliminatorias: la 1.ª eliminatoria es la semi; no coronar aún.
    if (match.tournament.type === "GROUPS_KNOCKOUT") {
      const participants = await db.tournamentParticipant.count({
        where: { tournamentId: match.tournamentId },
      });
      if (participants > 2) {
        const priorKnockout = await db.match.count({
          where: {
            tournamentId: match.tournamentId,
            groupName: null,
            id: { not: match.id },
            status: "COMPLETED",
          },
        });
        if (priorKnockout === 0) return false;
      }
    }

    const maxRound = await db.match.aggregate({
      where: {
        tournamentId: match.tournamentId,
        groupName: null,
      },
      _max: { round: true },
    });

    if (match.round !== maxRound._max.round) return false;

    const pendingFinals = await db.match.count({
      where: {
        tournamentId: match.tournamentId,
        groupName: null,
        round: match.round,
        status: { not: "COMPLETED" },
      },
    });
    if (pendingFinals > 0) return false;

    const homeWins =
      match.homeScore > match.awayScore ||
      (match.homeScore === match.awayScore &&
        (match.penaltiesHome ?? 0) > (match.penaltiesAway ?? 0));

    const winner = homeWins ? match.homeParticipant : match.awayParticipant;

    return this.awardChampion(db, {
      userId: winner.userId,
      participantId: winner.id,
      tournamentId: match.tournamentId,
      tournamentName: match.tournament.name,
      leagueName: match.tournament.fcLeague?.name,
      leagueId: match.tournament.fcLeague?.fifaIndexId,
      seasonName: match.tournament.season?.name ?? null,
      wonAt: match.playedAt ?? new Date(),
    });
  }

  private static async awardChampion(
    db: Db,
    input: {
      userId: string;
      participantId: string;
      tournamentId: string;
      tournamentName: string;
      leagueName?: string | null;
      leagueId?: string | null;
      seasonName: string | null;
      wonAt: Date;
    }
  ): Promise<boolean> {
    const title = getCompetitionTitleLabel(
      input.leagueName,
      input.tournamentName
    );
    const imageUrl = getLeagueTrophyUrl(input.leagueId, input.leagueName);

    const winnerBefore = await db.playerStats.findUnique({
      where: { userId: input.userId },
      select: { titlesWon: true },
    });
    const titlesBefore = winnerBefore?.titlesWon ?? 0;

    const winnerInfo = await db.tournamentParticipant.findUnique({
      where: { id: input.participantId },
      select: {
        user: { select: { nickname: true } },
        fcTeam: {
          select: { name: true, crestUrl: true, fifaIndexId: true },
        },
      },
    });

    const championNickname =
      winnerInfo?.user.nickname ?? "Campeón";
    const championTeamName =
      winnerInfo?.fcTeam?.name ?? championNickname;
    const championCrestUrl = winnerInfo?.fcTeam?.crestUrl ?? null;
    const championFifaIndexId = winnerInfo?.fcTeam?.fifaIndexId ?? null;

    await db.trophy.create({
      data: {
        userId: input.userId,
        tournamentId: input.tournamentId,
        title,
        imageUrl,
        clubName: winnerInfo?.fcTeam?.name ?? null,
        clubCrestUrl: winnerInfo?.fcTeam?.crestUrl ?? null,
        placement: 1,
        seasonName: input.seasonName,
        wonAt: input.wonAt,
      },
    });

    await db.playerStats.upsert({
      where: { userId: input.userId },
      create: {
        userId: input.userId,
        titlesWon: 1,
      },
      update: { titlesWon: { increment: 1 } },
    });

    await db.tournament.update({
      where: { id: input.tournamentId },
      data: { status: "COMPLETED" },
    });

    try {
      await TrophyService.ensureGoldenBoot(db, input.tournamentId);
    } catch (error) {
      console.error("[golden-boot]", error);
    }

    await db.tournamentParticipant.update({
      where: { id: input.participantId },
      data: { placement: 1 },
    });

    await db.activity.create({
      data: {
        userId: input.userId,
        type: "TOURNAMENT_WON",
        title: `Campeón de ${input.tournamentName}`,
        metadata: {
          tournamentId: input.tournamentId,
          leagueId: input.leagueId,
          leagueName: input.leagueName ?? input.tournamentName,
        },
      },
    });

    const leagueLabel = input.leagueName ?? input.tournamentName;

    const participants = await db.tournamentParticipant.findMany({
      where: { tournamentId: input.tournamentId },
      select: { userId: true },
    });

    await Promise.all(
      participants.map((p) => {
        const youAreChampion = p.userId === input.userId;
        return NotificationService.create(db, {
          userId: p.userId,
          type: "GENERAL",
          title: youAreChampion ? "¡Nuevo título!" : "¡Hay campeón!",
          body: youAreChampion
            ? `¡${championTeamName} es campeón de ${leagueLabel}!`
            : `${championTeamName} (${championNickname}) es campeón de ${leagueLabel}`,
          href: youAreChampion
            ? "/titles"
            : `/tournaments/${input.tournamentId}`,
          metadata: {
            // Animación a pantalla completa solo para quien gana el título.
            animate: youAreChampion,
            kind: youAreChampion ? "CHAMPION" : "CHAMPION_ANNOUNCE",
            youAreChampion,
            tournamentId: input.tournamentId,
            leagueName: leagueLabel,
            leagueId: input.leagueId ?? null,
            trophyUrl: imageUrl,
            tournamentName: input.tournamentName,
            titlesCount: youAreChampion ? titlesBefore + 1 : undefined,
            championNickname,
            championTeamName,
            championCrestUrl,
            championFifaIndexId,
          },
        });
      })
    );

    await this.notifyTitleSurpassed(db, {
      winnerId: input.userId,
      titlesAfter: titlesBefore + 1,
      tournamentName: input.tournamentName,
    });

    return true;
  }

  private static async notifyTitleSurpassed(
    db: Db,
    input: {
      winnerId: string;
      titlesAfter: number;
      tournamentName: string;
    }
  ) {
    const winner = await db.user.findUnique({
      where: { id: input.winnerId },
      select: { nickname: true },
    });
    if (!winner) return;

    const memberships = await db.crewMember.findMany({
      where: { userId: input.winnerId },
      select: { crewId: true },
    });
    if (memberships.length === 0) return;

    const mates = await db.crewMember.findMany({
      where: {
        crewId: { in: memberships.map((m) => m.crewId) },
        userId: { not: input.winnerId },
      },
      select: {
        userId: true,
        user: {
          select: {
            stats: { select: { titlesWon: true } },
          },
        },
      },
    });

    const targetTitles = input.titlesAfter - 1;
    const notified = new Set<string>();

    for (const mate of mates) {
      if (notified.has(mate.userId)) continue;
      const mateTitles = mate.user.stats?.titlesWon ?? 0;
      if (mateTitles !== targetTitles) continue;
      notified.add(mate.userId);

      await db.activity.create({
        data: {
          userId: mate.userId,
          type: "TITLE_SURPASSED",
          title: `${winner.nickname} te superó en títulos`,
          metadata: {
            byUserId: input.winnerId,
            titles: input.titlesAfter,
          },
        },
      });

      await NotificationService.create(db, {
        userId: mate.userId,
        type: "TITLE_SURPASSED",
        title: "Te superaron en títulos",
        body: `${winner.nickname} ahora tiene ${input.titlesAfter} título${
          input.titlesAfter === 1 ? "" : "s"
        } · ${input.tournamentName}`,
        href: "/crews",
        metadata: {
          byUserId: input.winnerId,
          byNickname: winner.nickname,
          titles: input.titlesAfter,
          animate: true,
        },
      });
    }
  }

  /** Bota de oro del máximo goleador. No suma títulos. Idempotente. */
  static async ensureGoldenBoot(db: Db, tournamentId: string) {
    const tournament = await db.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true, status: true },
    });
    if (!tournament || tournament.status !== "COMPLETED") return [];

    const rows = await db.matchPlayerStat.findMany({
      where: {
        goals: { gt: 0 },
        match: { tournamentId, status: "COMPLETED" },
      },
      select: { userId: true, goals: true },
    });
    const totals = new Map<string, number>();
    for (const row of rows) {
      totals.set(row.userId, (totals.get(row.userId) ?? 0) + row.goals);
    }
    const top = Math.max(0, ...totals.values());
    if (top <= 0) return [];

    const winnerIds = [...totals.entries()]
      .filter(([, goals]) => goals === top)
      .map(([userId]) => userId);

    const existing = await db.trophy.findMany({
      where: {
        tournamentId,
        title: { startsWith: GOLDEN_BOOT_PREFIX },
      },
      select: { userId: true },
    });
    const already = new Set(existing.map((row) => row.userId));

    const participants = await db.tournamentParticipant.findMany({
      where: { tournamentId, userId: { in: winnerIds } },
      select: {
        userId: true,
        user: { select: { nickname: true } },
        fcTeam: { select: { name: true, crestUrl: true } },
      },
    });

    for (const participant of participants) {
      if (already.has(participant.userId)) continue;
      await db.trophy.create({
        data: {
          userId: participant.userId,
          tournamentId,
          title: goldenBootTitle(tournament.name),
          imageUrl: GOLDEN_BOOT_IMAGE,
          clubName: participant.fcTeam?.name ?? null,
          clubCrestUrl: participant.fcTeam?.crestUrl ?? null,
          placement: 0,
          seasonName: `${top} goles`,
          wonAt: new Date(),
        },
      });
      await NotificationService.create(db, {
        userId: participant.userId,
        type: "GENERAL",
        title: "Bota de Oro",
        body: `Eres el máximo goleador de ${tournament.name} con ${top} goles.`,
        href: "/titles",
        metadata: {
          kind: "GOLDEN_BOOT",
          tournamentId,
          goals: top,
        },
      });
    }

    return participants.map((participant) => ({
      userId: participant.userId,
      nickname: participant.user.nickname,
      goals: top,
      clubName: participant.fcTeam?.name ?? null,
      crestUrl: participant.fcTeam?.crestUrl ?? null,
    }));
  }

  /** Jugador de FC que más goles aportó a cada bota, para la carta. */
  static async goldenBootFaces<
    T extends {
      id: string;
      userId: string;
      tournamentId: string | null;
      title: string;
      seasonName: string | null;
      clubName: string | null;
      clubCrestUrl: string | null;
      tournament?: { id: string; name: string } | null;
    },
  >(boots: T[]) {
    const tournamentIds = [
      ...new Set(
        boots
          .map((boot) => boot.tournamentId)
          .filter((id): id is string => !!id)
      ),
    ];
    const userIds = [...new Set(boots.map((boot) => boot.userId))];
    const stats =
      tournamentIds.length === 0
        ? []
        : await prisma.matchPlayerStat.findMany({
            where: {
              userId: { in: userIds },
              goals: { gt: 0 },
              match: {
                tournamentId: { in: tournamentIds },
                status: "COMPLETED",
              },
            },
            select: {
              userId: true,
              goals: true,
              fcPlayer: {
                select: {
                  name: true,
                  imageUrl: true,
                  fifaIndexId: true,
                  team: { select: { name: true, crestUrl: true } },
                },
              },
              match: { select: { tournamentId: true } },
            },
          });

    const summed = new Map<
      string,
      {
        goals: number;
        name: string;
        portraitUrl: string | null;
        crestUrl: string | null;
        clubName: string | null;
      }
    >();
    for (const stat of stats) {
      const key = `${stat.userId}\0${stat.match.tournamentId}\0${stat.fcPlayer.name}`;
      const prev = summed.get(key);
      summed.set(key, {
        goals: (prev?.goals ?? 0) + stat.goals,
        name: stat.fcPlayer.name,
        portraitUrl: resolvePlayerImageUrl(
          stat.fcPlayer.fifaIndexId,
          stat.fcPlayer.imageUrl
        ),
        crestUrl: stat.fcPlayer.team?.crestUrl ?? prev?.crestUrl ?? null,
        clubName: stat.fcPlayer.team?.name ?? prev?.clubName ?? null,
      });
    }
    const best = new Map<
      string,
      {
        goals: number;
        name: string;
        portraitUrl: string | null;
        crestUrl: string | null;
        clubName: string | null;
      }
    >();
    for (const [key, face] of summed) {
      const bootKey = key.split("\0").slice(0, 2).join("\0");
      const current = best.get(bootKey);
      if (!current || face.goals > current.goals) best.set(bootKey, face);
    }

    return boots.map((boot) => {
      const face = best.get(`${boot.userId}\0${boot.tournamentId ?? ""}`);
      return {
        ...boot,
        playerName: face?.name ?? "Goleador",
        portraitUrl: face?.portraitUrl ?? null,
        goals: face?.goals ?? goldenBootGoalCount(boot.seasonName) ?? 0,
        crestUrl: face?.crestUrl ?? boot.clubCrestUrl,
        faceClubName: face?.clubName ?? boot.clubName,
      };
    });
  }

  static async listForUser(userId: string) {
    return prisma.trophy.findMany({
      where: { userId },
      orderBy: { wonAt: "desc" },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            type: true,
            fcLeague: {
              select: {
                id: true,
                name: true,
                fifaIndexId: true,
                logoUrl: true,
                country: true,
              },
            },
          },
        },
      },
    });
  }
}

/** Recalcula puntos desde partidos + XP de logros (sin base 1000/ELO viejo). */
export async function recalculateUserPoints(userId: string) {
  const { MATCH_POINTS } = await import("@/utils/points");

  const matches = await prisma.match.findMany({
    where: {
      status: "COMPLETED",
      OR: [
        { homeParticipant: { userId } },
        { awayParticipant: { userId } },
      ],
    },
    include: {
      homeParticipant: true,
      awayParticipant: true,
    },
    orderBy: [{ playedAt: "asc" }, { createdAt: "asc" }],
  });

  let matchPoints = 0;

  for (const match of matches) {
    const isHome = match.homeParticipant.userId === userId;
    const myScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
    const oppScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
    const won = myScore > oppScore;
    const drawn = myScore === oppScore;

    matchPoints += won
      ? MATCH_POINTS.win
      : drawn
        ? MATCH_POINTS.draw
        : MATCH_POINTS.loss;

    if (match.mvpUserId === userId) matchPoints += MATCH_POINTS.mvpBonus;
  }

  const achievements = await prisma.userAchievement.findMany({
    where: { userId },
    include: { achievement: { select: { type: true, xpReward: true } } },
  });

  const thresholds: Record<string, number> = {
    POINTS_100: 100,
    POINTS_500: 500,
    POINTS_1000: 1000,
    LEGEND: 2000,
    POINTS_2500: 2500,
    POINTS_5000: 5000,
  };

  let achievementXp = 0;
  const toRevoke: string[] = [];

  for (const ua of achievements) {
    const type = ua.achievement.type;
    const need = thresholds[type];
    if (need != null && matchPoints < need) {
      toRevoke.push(ua.id);
      continue;
    }
    achievementXp += ua.achievement.xpReward;
  }

  if (toRevoke.length > 0) {
    await prisma.userAchievement.deleteMany({
      where: { id: { in: toRevoke } },
    });
  }

  const newPoints = matchPoints + achievementXp;

  await prisma.user.update({
    where: { id: userId },
    data: {
      elo: newPoints,
      level: calculateLevel(newPoints),
    },
  });

  return {
    matchPoints,
    achievementXp,
    total: newPoints,
    revoked: toRevoke.length,
  };
}

export async function recalculateAllUserPoints() {
  const users = await prisma.user.findMany({
    select: { id: true, nickname: true },
  });
  const results = [];
  for (const user of users) {
    const result = await recalculateUserPoints(user.id);
    results.push({ nickname: user.nickname, ...result });
  }
  return results;
}
