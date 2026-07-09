import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { AchievementService } from "@/services/achievement-service";

export const getAchievementCatalog = unstable_cache(
  async () =>
    prisma.achievement.findMany({
      orderBy: [{ xpReward: "asc" }, { title: "asc" }],
    }),
  ["achievement-catalog"],
  { revalidate: 3600 }
);

export class AchievementRepository {
  static async getProgressForUser(userId: string, sync = true) {
    if (sync) {
      await AchievementService.syncForUser(userId, prisma);
    }

    const [catalog, unlocked] = await Promise.all([
      getAchievementCatalog(),
      prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      }),
    ]);

    const unlockedMap = new Map(
      unlocked.map((entry) => [entry.achievementId, entry.unlockedAt])
    );

    return catalog.map((achievement) => ({
      ...achievement,
      unlocked: unlockedMap.has(achievement.id),
      unlockedAt: unlockedMap.get(achievement.id) ?? null,
    }));
  }
}
