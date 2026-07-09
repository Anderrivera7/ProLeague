import { PrismaClient, type AchievementType, type Prisma } from "@prisma/client";
import { calculateLevel } from "@/utils/points";

type Db = PrismaClient | Prisma.TransactionClient;

export interface MatchAchievementContext {
  won: boolean;
  drawn: boolean;
  lost: boolean;
  gf: number;
  ga: number;
  mvp: boolean;
  matchGoals: number;
  wasTrailingByTwo?: boolean;
  wasTrailingByThree?: boolean;
}

type StatsSnapshot = {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  cleanSheets: number;
  currentStreak: number;
  bestStreak: number;
  totalMvp: number;
  titlesWon: number;
  seasonsPlayed: number;
};

function checks(
  stats: StatsSnapshot,
  points: number,
  match?: MatchAchievementContext
): AchievementType[] {
  const unlocked: AchievementType[] = [];

  // ── Primeros pasos ──
  if (stats.matchesPlayed >= 1) unlocked.push("FIRST_MATCH");
  if (stats.wins >= 1) unlocked.push("FIRST_WIN");
  if (stats.goalsFor >= 1) unlocked.push("FIRST_GOAL");
  if (stats.draws >= 1) unlocked.push("FIRST_DRAW");
  if (stats.cleanSheets >= 1) unlocked.push("FIRST_CLEAN_SHEET");

  // ── Partidos jugados ──
  if (stats.matchesPlayed >= 10) unlocked.push("MATCHES_10");
  if (stats.matchesPlayed >= 25) unlocked.push("MATCHES_25");
  if (stats.matchesPlayed >= 50) unlocked.push("MATCHES_50");
  if (stats.matchesPlayed >= 100) unlocked.push("MATCHES_100");
  if (stats.matchesPlayed >= 200) unlocked.push("MATCHES_200");

  // ── Victorias totales ──
  if (stats.wins >= 5) unlocked.push("WINS_5");
  if (stats.wins >= 10) unlocked.push("WINS_10");
  if (stats.wins >= 25) unlocked.push("WINS_25");
  if (stats.wins >= 50) unlocked.push("WINS_50");
  if (stats.wins >= 100) unlocked.push("WINS_100");

  // ── Goles totales ──
  if (stats.goalsFor >= 10) unlocked.push("SCORER_10");
  if (stats.goalsFor >= 25) unlocked.push("SCORER_25");
  if (stats.goalsFor >= 50) unlocked.push("SCORER_50");
  if (stats.goalsFor >= 100) unlocked.push("SCORER_100");
  if (stats.goalsFor >= 200) unlocked.push("SCORER_200");

  // ── Porterías a cero ──
  if (stats.cleanSheets >= 1) unlocked.push("CLEAN_SHEET");
  if (stats.cleanSheets >= 5) unlocked.push("CLEAN_SHEET_STREAK");
  if (stats.cleanSheets >= 10) unlocked.push("CLEAN_SHEETS_10");
  if (stats.cleanSheets >= 25) unlocked.push("CLEAN_SHEETS_25");

  // ── MVP ──
  if (stats.totalMvp >= 1) unlocked.push("MVP_FIRST");
  if (stats.totalMvp >= 10) unlocked.push("MVP_MASTER");
  if (stats.totalMvp >= 25) unlocked.push("MVP_LEGEND");

  // ── Rachas de victorias ──
  if (stats.currentStreak >= 3) unlocked.push("WIN_STREAK_3");
  if (stats.currentStreak >= 5) unlocked.push("WIN_STREAK_5");
  if (stats.currentStreak >= 10) unlocked.push("WIN_STREAK_10");

  // ── Invicto ──
  if (stats.losses === 0 && stats.matchesPlayed >= 5) unlocked.push("UNBEATEN_5");
  if (stats.losses === 0 && stats.matchesPlayed >= 10) unlocked.push("UNBEATEN_RUN");
  if (stats.losses === 0 && stats.matchesPlayed >= 20) unlocked.push("UNBEATEN_20");

  // ── Puntos / ELO ──
  if (points >= 100) unlocked.push("POINTS_100");
  if (points >= 500) unlocked.push("POINTS_500");
  if (points >= 1000) unlocked.push("POINTS_1000");
  if (points >= 2000) unlocked.push("LEGEND");
  if (points >= 2500) unlocked.push("POINTS_2500");
  if (points >= 5000) unlocked.push("POINTS_5000");

  // ── Torneos ──
  if (stats.titlesWon >= 1) unlocked.push("TOURNAMENT_WINNER");
  if (stats.titlesWon >= 3) unlocked.push("TOURNAMENT_3_WINS");

  // ── Empates ──
  if (stats.draws >= 10) unlocked.push("DRAW_SPECIALIST");

  // ── Temporadas ──
  if (stats.seasonsPlayed >= 1) unlocked.push("SEASON_COMPLETE");
  if (stats.seasonsPlayed >= 3) unlocked.push("SEASONS_3");

  // ── Goles en un partido (solo con contexto de match) ──
  if (match) {
    if (match.matchGoals >= 3) unlocked.push("HAT_TRICK");
    if (match.matchGoals >= 5) unlocked.push("GOAL_MACHINE");
    if (match.matchGoals >= 10) unlocked.push("DOUBLE_DIGITS");
    if (match.won && match.ga === 0) unlocked.push("CLEAN_SHEET");
    if (match.won && match.ga === 0) unlocked.push("FIRST_CLEAN_SHEET");
    if (match.wasTrailingByTwo && match.won) unlocked.push("COMEBACK_KING");
    if (match.wasTrailingByThree && match.won) unlocked.push("COMEBACK_3_DOWN");
  }

  return [...new Set(unlocked)];
}

export class AchievementService {
  static async syncForUser(userId: string, prisma: PrismaClient) {
    const [user, stats, topScorer, maxGoalsInMatch, rivalBeaten, rivalDominated] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { elo: true } }),
      prisma.playerStats.findUnique({ where: { userId } }),
      prisma.matchEvent.groupBy({
        by: ["userId"],
        _sum: { goals: true },
        orderBy: { _sum: { goals: "desc" } },
        take: 1,
      }),
      prisma.matchEvent.aggregate({
        where: { userId },
        _max: { goals: true },
      }),
      prisma.headToHead.findFirst({
        where: { userId, wins: { gte: 3 } },
        select: { id: true },
      }),
      prisma.headToHead.findFirst({
        where: { userId, wins: { gte: 10 } },
        select: { id: true },
      }),
    ]);

    if (!user || !stats) return [];

    const snapshot: StatsSnapshot = {
      matchesPlayed: stats.matchesPlayed,
      wins: stats.wins,
      draws: stats.draws,
      losses: stats.losses,
      goalsFor: stats.goalsFor,
      cleanSheets: stats.cleanSheets,
      currentStreak: stats.currentStreak,
      bestStreak: stats.bestStreak,
      totalMvp: stats.totalMvp,
      titlesWon: stats.titlesWon,
      seasonsPlayed: stats.seasonsPlayed,
    };

    const types = checks(snapshot, user.elo);
    const maxGoals = maxGoalsInMatch._max.goals ?? 0;
    if (maxGoals >= 3) types.push("HAT_TRICK");
    if (maxGoals >= 5) types.push("GOAL_MACHINE");
    if (maxGoals >= 10) types.push("DOUBLE_DIGITS");
    if (topScorer[0]?.userId === userId && (topScorer[0]._sum.goals ?? 0) > 0) {
      types.push("TOP_SCORER");
    }
    if (rivalBeaten) types.push("RIVAL_BEATER");
    if (rivalDominated) types.push("RIVAL_DOMINATOR");

    const uniqueTypes = [...new Set(types)];
    const unlocked: string[] = [];

    for (const type of uniqueTypes) {
      const result = await this.unlock(prisma, userId, type);
      if (result) unlocked.push(type);
    }

    return unlocked;
  }

  private static async unlock(db: Db, userId: string, type: AchievementType) {
    const achievement = await db.achievement.findUnique({ where: { type } });
    if (!achievement) return false;

    const existing = await db.userAchievement.findUnique({
      where: {
        userId_achievementId: { userId, achievementId: achievement.id },
      },
    });
    if (existing) return false;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { elo: true },
    });
    if (!user) return false;

    const newPoints = user.elo + achievement.xpReward;

    await db.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });

    await db.user.update({
      where: { id: userId },
      data: {
        elo: newPoints,
        level: calculateLevel(newPoints),
      },
    });

    await db.activity.create({
      data: {
        userId,
        type: "ACHIEVEMENT_UNLOCKED",
        title: `Logro desbloqueado: ${achievement.title}`,
        metadata: { achievementType: type, xpReward: achievement.xpReward },
      },
    });

    return true;
  }
}
