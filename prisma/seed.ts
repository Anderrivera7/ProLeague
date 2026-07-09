import { PrismaClient } from "@prisma/client";
import { calculateLevel } from "../src/utils/points";
import { AchievementService } from "../src/services/achievement-service";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { type: "FIRST_MATCH" as const, title: "Primer partido", description: "Juega tu primer partido", xpReward: 25 },
  { type: "FIRST_WIN" as const, title: "Primera victoria", description: "Gana tu primer partido", xpReward: 50 },
  { type: "FIRST_GOAL" as const, title: "Primer gol", description: "Marca tu primer gol", xpReward: 30 },
  { type: "HAT_TRICK" as const, title: "Hat-trick", description: "Marca 3 goles en un partido", xpReward: 100 },
  { type: "GOAL_MACHINE" as const, title: "Máquina de goles", description: "Marca 5 goles en un partido", xpReward: 200 },
  { type: "CLEAN_SHEET" as const, title: "Portería a cero", description: "Gana sin recibir goles", xpReward: 40 },
  { type: "CLEAN_SHEET_STREAK" as const, title: "Muralla", description: "5 porterías a cero", xpReward: 150 },
  { type: "WIN_STREAK_3" as const, title: "Racha de 3", description: "Gana 3 partidos seguidos", xpReward: 75 },
  { type: "WIN_STREAK_5" as const, title: "Racha de 5", description: "Gana 5 partidos seguidos", xpReward: 125 },
  { type: "UNBEATEN_5" as const, title: "Imparable", description: "5 partidos sin perder", xpReward: 80 },
  { type: "UNBEATEN_RUN" as const, title: "Invicto", description: "10 partidos sin perder", xpReward: 200 },
  { type: "COMEBACK_KING" as const, title: "Remontada", description: "Gana estando 2 goles abajo", xpReward: 100 },
  { type: "MATCHES_10" as const, title: "Veterano", description: "Juega 10 partidos", xpReward: 60 },
  { type: "MATCHES_25" as const, title: "Titular", description: "Juega 25 partidos", xpReward: 100 },
  { type: "MATCHES_50" as const, title: "Profesional", description: "Juega 50 partidos", xpReward: 180 },
  { type: "WINS_5" as const, title: "Ganador", description: "Consigue 5 victorias", xpReward: 70 },
  { type: "WINS_10" as const, title: "Dominador", description: "Consigue 10 victorias", xpReward: 120 },
  { type: "WINS_25" as const, title: "Especialista", description: "Consigue 25 victorias", xpReward: 250 },
  { type: "SCORER_10" as const, title: "Goleador", description: "Marca 10 goles en total", xpReward: 80 },
  { type: "SCORER_25" as const, title: "Francotirador", description: "Marca 25 goles en total", xpReward: 150 },
  { type: "SCORER_50" as const, title: "Romperredes", description: "Marca 50 goles en total", xpReward: 300 },
  { type: "CLEAN_SHEETS_10" as const, title: "Muro", description: "10 porterías a cero", xpReward: 200 },
  { type: "MVP_FIRST" as const, title: "Primer MVP", description: "Sé MVP por primera vez", xpReward: 50 },
  { type: "MVP_MASTER" as const, title: "MVP Master", description: "Consigue 10 MVPs", xpReward: 150 },
  { type: "POINTS_100" as const, title: "Centenario", description: "Alcanza 100 puntos", xpReward: 50 },
  { type: "POINTS_500" as const, title: "Quinientos", description: "Alcanza 500 puntos", xpReward: 100 },
  { type: "POINTS_1000" as const, title: "Mil puntos", description: "Alcanza 1000 puntos", xpReward: 200 },
  { type: "LEGEND" as const, title: "Leyenda", description: "Alcanza 2000 puntos", xpReward: 500 },
  { type: "TOURNAMENT_WINNER" as const, title: "Campeón", description: "Gana un torneo", xpReward: 500 },
  { type: "TOURNAMENT_FINALIST" as const, title: "Finalista", description: "Llega a la final de un torneo", xpReward: 200 },
  { type: "TOP_SCORER" as const, title: "Máximo goleador", description: "Lidera el ranking de goleadores", xpReward: 300 },
  { type: "RIVAL_BEATER" as const, title: "Némesis", description: "Vence 3 veces al mismo rival", xpReward: 90 },
];

async function main() {
  console.log("🌱 Seeding achievements...");

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { type: achievement.type },
      create: achievement,
      update: {
        title: achievement.title,
        description: achievement.description,
        xpReward: achievement.xpReward,
      },
    });
  }

  console.log("📉 Rebajando puntos base (1000 → 0)...");
  const users = await prisma.user.findMany({ select: { id: true, elo: true } });
  for (const user of users) {
    if (user.elo >= 1000) {
      const newElo = user.elo - 1000;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          elo: newElo,
          level: calculateLevel(newElo),
        },
      });
    }
  }

  console.log("🏆 Sincronizando logros de usuarios existentes...");
  for (const user of users) {
    await AchievementService.syncForUser(user.id, prisma);
  }

  const activeSeason = await prisma.season.findFirst({
    where: { isActive: true },
  });

  if (!activeSeason) {
    await prisma.season.create({
      data: {
        name: "Temporada 2025/26",
        startDate: new Date("2025-08-01"),
        endDate: new Date("2026-06-30"),
        isActive: true,
      },
    });
    console.log("✅ Temporada activa creada");
  }

  console.log(`🎉 Seed completado (${ACHIEVEMENTS.length} logros)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
