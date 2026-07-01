import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  { type: "FIRST_WIN" as const, title: "Primera Victoria", description: "Gana tu primer partido", xpReward: 50 },
  { type: "HAT_TRICK" as const, title: "Hat-trick", description: "Marca 3 goles en un partido", xpReward: 100 },
  { type: "CLEAN_SHEET_STREAK" as const, title: "Muralla", description: "5 porterías a cero seguidas", xpReward: 150 },
  { type: "TOURNAMENT_WINNER" as const, title: "Campeón", description: "Gana un torneo", xpReward: 500 },
  { type: "UNBEATEN_RUN" as const, title: "Invicto", description: "10 partidos sin perder", xpReward: 200 },
  { type: "TOP_SCORER" as const, title: "Goleador", description: "Lidera el ranking de goleadores", xpReward: 300 },
  { type: "MVP_MASTER" as const, title: "MVP Master", description: "10 MVPs en partidos", xpReward: 150 },
  { type: "COMEBACK_KING" as const, title: "Remontada", description: "Gana estando 2 goles abajo", xpReward: 100 },
  { type: "LEGEND" as const, title: "Leyenda", description: "Alcanza 2000 ELO", xpReward: 1000 },
];

async function main() {
  console.log("🌱 Seeding achievements...");

  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { type: achievement.type },
      create: achievement,
      update: achievement,
    });
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

  console.log("🎉 Seed completado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
