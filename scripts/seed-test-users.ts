/**
 * Crea usuarios de prueba (Auth SQL + perfiles Prisma).
 * Uso: npm run seed:users
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import path from "path";

const prisma = new PrismaClient();

const TEST_USERS = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    email: "demo@proleague.io",
    password: "Demo1234!",
    nickname: "DemoPlayer",
    country: "España",
    elo: 1450,
    stats: {
      matchesPlayed: 42,
      wins: 28,
      draws: 6,
      losses: 8,
      goalsFor: 98,
      goalsAgainst: 54,
      titlesWon: 2,
      bestStreak: 7,
      totalMvp: 5,
    },
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    email: "admin@proleague.io",
    password: "Admin1234!",
    nickname: "ProLeague_Admin",
    country: "España",
    elo: 1200,
    stats: {
      matchesPlayed: 15,
      wins: 9,
      draws: 3,
      losses: 3,
      goalsFor: 32,
      goalsAgainst: 18,
      titlesWon: 1,
      bestStreak: 4,
      totalMvp: 2,
    },
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    email: "rival@proleague.io",
    password: "Demo1234!",
    nickname: "RivalFC",
    country: "Argentina",
    elo: 1380,
    stats: {
      matchesPlayed: 38,
      wins: 22,
      draws: 8,
      losses: 8,
      goalsFor: 85,
      goalsAgainst: 61,
      titlesWon: 1,
      bestStreak: 5,
      totalMvp: 4,
    },
  },
] as const;

async function seedAuthUsers() {
  const sqlPath = path.join(process.cwd(), "prisma", "seed-auth-users.sql");
  console.log("🔐 Creando usuarios en Supabase Auth...");
  try {
    execSync(`npx prisma db execute --file "${sqlPath}" --schema prisma/schema.prisma`, {
      stdio: "inherit",
    });
  } catch {
    console.log("  ↳ Usuarios Auth ya existen o SQL parcialmente aplicado");
  }
}

async function seedProfiles() {
  console.log("👤 Creando perfiles en PostgreSQL...\n");

  for (const user of TEST_USERS) {
    const level = Math.floor(user.elo / 100) + 1;
    const gd = user.stats.goalsFor - user.stats.goalsAgainst;

    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        country: user.country,
        elo: user.elo,
        level,
        stats: {
          create: {
            ...user.stats,
            goalDifference: gd,
            avgGoalsPerGame: user.stats.goalsFor / user.stats.matchesPlayed,
            biggestWin: 5,
            currentStreak: 2,
            seasonsPlayed: 1,
            totalAssists: 12,
          },
        },
      },
      update: {
        email: user.email,
        nickname: user.nickname,
        country: user.country,
        elo: user.elo,
        level,
        stats: {
          upsert: {
            create: {
              ...user.stats,
              goalDifference: gd,
              avgGoalsPerGame: user.stats.goalsFor / user.stats.matchesPlayed,
              biggestWin: 5,
              currentStreak: 2,
              seasonsPlayed: 1,
              totalAssists: 12,
            },
            update: {
              ...user.stats,
              goalDifference: gd,
              avgGoalsPerGame: user.stats.goalsFor / user.stats.matchesPlayed,
            },
          },
        },
      },
    });

    console.log(`  ✓ ${user.nickname} — ELO ${user.elo}`);
  }
}

async function main() {
  await seedAuthUsers();
  await seedProfiles();

  console.log("\n═══════════════════════════════════════════");
  console.log("  CREDENCIALES DE PRUEBA — ProLeague");
  console.log("═══════════════════════════════════════════\n");

  for (const u of TEST_USERS) {
    console.log(`  ${u.nickname}`);
    console.log(`    Email:    ${u.email}`);
    console.log(`    Password: ${u.password}`);
    console.log("");
  }

  console.log("  → http://localhost:3000/login\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
