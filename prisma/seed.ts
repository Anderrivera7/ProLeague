import { PrismaClient } from "@prisma/client";
import { calculateLevel } from "../src/utils/points";
import { AchievementService } from "../src/services/achievement-service";

const prisma = new PrismaClient();

const ACHIEVEMENTS = [
  // ── Primeros pasos (3 XP — fáciles) ──
  { type: "FIRST_MATCH" as const, title: "Primer partido", description: "Juega tu primer partido", xpReward: 3 },
  { type: "FIRST_WIN" as const, title: "Primera victoria", description: "Gana tu primer partido", xpReward: 3 },
  { type: "FIRST_GOAL" as const, title: "Primer gol", description: "Marca tu primer gol", xpReward: 3 },
  { type: "FIRST_DRAW" as const, title: "Primer empate", description: "Empata tu primer partido", xpReward: 3 },
  { type: "FIRST_CLEAN_SHEET" as const, title: "Primera portería a cero", description: "Gana sin recibir goles por primera vez", xpReward: 3 },

  // ── Goles en un partido ──
  { type: "HAT_TRICK" as const, title: "Hat-trick", description: "Marca 3 goles en un partido", xpReward: 5 },
  { type: "GOAL_MACHINE" as const, title: "Máquina de goles", description: "Marca 5 goles en un partido", xpReward: 7 },
  { type: "DOUBLE_DIGITS" as const, title: "Doble dígito", description: "Marca 10+ goles en un partido", xpReward: 9 },

  // ── Porterías a cero ──
  { type: "CLEAN_SHEET" as const, title: "Portería a cero", description: "Gana sin recibir goles", xpReward: 3 },
  { type: "CLEAN_SHEET_STREAK" as const, title: "Muralla", description: "5 porterías a cero acumuladas", xpReward: 5 },
  { type: "CLEAN_SHEETS_10" as const, title: "Muro de acero", description: "10 porterías a cero acumuladas", xpReward: 7 },
  { type: "CLEAN_SHEETS_25" as const, title: "Fortaleza", description: "25 porterías a cero acumuladas", xpReward: 9 },

  // ── Rachas de victorias ──
  { type: "WIN_STREAK_3" as const, title: "Racha de 3", description: "Gana 3 partidos seguidos", xpReward: 5 },
  { type: "WIN_STREAK_5" as const, title: "Racha de 5", description: "Gana 5 partidos seguidos", xpReward: 7 },
  { type: "WIN_STREAK_10" as const, title: "Racha de 10", description: "Gana 10 partidos seguidos", xpReward: 9 },

  // ── Invicto ──
  { type: "UNBEATEN_5" as const, title: "Imparable", description: "5 partidos sin perder", xpReward: 5 },
  { type: "UNBEATEN_RUN" as const, title: "Invicto", description: "10 partidos sin perder", xpReward: 7 },
  { type: "UNBEATEN_20" as const, title: "Intocable", description: "20 partidos sin perder", xpReward: 9 },

  // ── Remontadas ──
  { type: "COMEBACK_KING" as const, title: "Remontada", description: "Gana estando 2 goles abajo", xpReward: 7 },
  { type: "COMEBACK_3_DOWN" as const, title: "Milagro", description: "Gana estando 3 goles abajo", xpReward: 9 },

  // ── Partidos jugados ──
  { type: "MATCHES_10" as const, title: "Veterano", description: "Juega 10 partidos", xpReward: 3 },
  { type: "MATCHES_25" as const, title: "Titular indiscutible", description: "Juega 25 partidos", xpReward: 5 },
  { type: "MATCHES_50" as const, title: "Profesional", description: "Juega 50 partidos", xpReward: 5 },
  { type: "MATCHES_100" as const, title: "Centenario", description: "Juega 100 partidos", xpReward: 7 },
  { type: "MATCHES_200" as const, title: "Leyenda viviente", description: "Juega 200 partidos", xpReward: 9 },

  // ── Victorias totales ──
  { type: "WINS_5" as const, title: "Ganador", description: "Consigue 5 victorias", xpReward: 3 },
  { type: "WINS_10" as const, title: "Dominador", description: "Consigue 10 victorias", xpReward: 5 },
  { type: "WINS_25" as const, title: "Especialista", description: "Consigue 25 victorias", xpReward: 5 },
  { type: "WINS_50" as const, title: "Demoledor", description: "Consigue 50 victorias", xpReward: 7 },
  { type: "WINS_100" as const, title: "Rey absoluto", description: "Consigue 100 victorias", xpReward: 9 },

  // ── Goles totales ──
  { type: "SCORER_10" as const, title: "Goleador", description: "Marca 10 goles en total", xpReward: 3 },
  { type: "SCORER_25" as const, title: "Francotirador", description: "Marca 25 goles en total", xpReward: 5 },
  { type: "SCORER_50" as const, title: "Romperredes", description: "Marca 50 goles en total", xpReward: 5 },
  { type: "SCORER_100" as const, title: "Depredador", description: "Marca 100 goles en total", xpReward: 7 },
  { type: "SCORER_200" as const, title: "Pichichi eterno", description: "Marca 200 goles en total", xpReward: 9 },

  // ── MVP ──
  { type: "MVP_FIRST" as const, title: "Primer MVP", description: "Sé MVP por primera vez", xpReward: 3 },
  { type: "MVP_MASTER" as const, title: "MVP Master", description: "Consigue 10 MVPs", xpReward: 5 },
  { type: "MVP_LEGEND" as const, title: "MVP Legendario", description: "Consigue 25 MVPs", xpReward: 9 },

  // ── Puntos / ELO ──
  { type: "POINTS_100" as const, title: "Cien puntos", description: "Alcanza 100 puntos de ELO", xpReward: 3 },
  { type: "POINTS_500" as const, title: "Quinientos", description: "Alcanza 500 puntos de ELO", xpReward: 5 },
  { type: "POINTS_1000" as const, title: "Mil puntos", description: "Alcanza 1000 puntos de ELO", xpReward: 7 },
  { type: "POINTS_2500" as const, title: "Élite", description: "Alcanza 2500 puntos de ELO", xpReward: 9 },
  { type: "POINTS_5000" as const, title: "Divinidad", description: "Alcanza 5000 puntos de ELO", xpReward: 9 },
  { type: "LEGEND" as const, title: "Leyenda", description: "Alcanza 2000 puntos de ELO", xpReward: 7 },

  // ── Torneos ──
  { type: "TOURNAMENT_WINNER" as const, title: "Campeón", description: "Gana un torneo", xpReward: 7 },
  { type: "TOURNAMENT_FINALIST" as const, title: "Finalista", description: "Llega a la final de un torneo", xpReward: 5 },
  { type: "TOURNAMENT_BACK_TO_BACK" as const, title: "Bicampeón", description: "Gana 2 torneos seguidos", xpReward: 9 },
  { type: "TOURNAMENT_3_WINS" as const, title: "Tricampeón", description: "Gana 3 torneos en total", xpReward: 9 },

  // ── Goleadores y rivales ──
  { type: "TOP_SCORER" as const, title: "Máximo goleador", description: "Lidera el ranking de goleadores", xpReward: 7 },
  { type: "RIVAL_BEATER" as const, title: "Némesis", description: "Vence 3 veces al mismo rival", xpReward: 5 },
  { type: "RIVAL_DOMINATOR" as const, title: "Dominación total", description: "Vence 10 veces al mismo rival", xpReward: 9 },

  // ── Temporadas ──
  { type: "SEASON_COMPLETE" as const, title: "Temporada completa", description: "Completa una temporada entera", xpReward: 5 },
  { type: "SEASONS_3" as const, title: "Veterano de guerra", description: "Completa 3 temporadas", xpReward: 7 },

  // ── Empates y derrotas ──
  { type: "DRAW_SPECIALIST" as const, title: "Empate artístico", description: "Empata 10 partidos", xpReward: 5 },
  { type: "BOUNCE_BACK" as const, title: "Resiliencia", description: "Gana inmediatamente después de perder 3 seguidos", xpReward: 7 },
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
