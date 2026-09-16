/**
 * Actualiza títulos de Anderson: sin años, Ecuador = Liga Pro, Perú = Liga 1.
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "riveraanderson756@gmail.com";

const TITLES: Array<{ title: string; imageUrl: string }> = [
  {
    title: "Campeón · Copa Libertadores (Flamengo)",
    imageUrl: "/trophies/libertadores.png",
  },
  {
    title: "Campeón · Copa Libertadores (River Plate)",
    imageUrl: "/trophies/libertadores.png",
  },
  {
    title: "Campeón · Ligue 1 (AS Monaco)",
    imageUrl: "/trophies/ligue-1.png",
  },
  {
    title: "Campeón · UEFA Champions League (Liverpool)",
    imageUrl: "/trophies/ucl.png",
  },
  {
    title: "Campeón · Taça de Portugal (Portugal)",
    imageUrl: "/trophies/taca-portugal.png",
  },
  {
    title: "Campeón · Süper Lig (Beşiktaş)",
    imageUrl: "/trophies/super-lig.png",
  },
  {
    title: "Campeón · Bundesliga (Borussia Dortmund)",
    imageUrl: "/trophies/bundesliga.png",
  },
  {
    title: "Campeón · Primeira Liga (Portugal)",
    imageUrl: "/trophies/primeira-liga.png",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
  },
  {
    title: "Campeón · Serie A (AC Milan)",
    imageUrl: "/trophies/serie-a.png",
  },
  {
    title: "Campeón · Primeira Liga (FC Porto)",
    imageUrl: "/trophies/primeira-liga.png",
  },
  {
    title: "Campeón · La Liga (Real Madrid)",
    imageUrl: "/trophies/la-liga.png",
  },
  {
    title: "Campeón · Liga Profesional (Racing Club)",
    imageUrl: "/trophies/liga-argentina.png",
  },
  {
    title: "Campeón · Liga Pro Ecuador (LDU Quito)",
    imageUrl: "/trophies/liga-ecuador.png",
  },
  {
    title: "Campeón · Liga 1 Perú (Universitario)",
    imageUrl: "/trophies/liga-1-peru.png",
  },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: EMAIL },
    select: { id: true, nickname: true },
  });
  if (!user) throw new Error("Usuario no encontrado");

  await prisma.trophy.deleteMany({
    where: { userId: user.id, tournamentId: null },
  });

  await prisma.trophy.createMany({
    data: TITLES.map((t) => ({
      userId: user.id,
      title: t.title,
      imageUrl: t.imageUrl,
      placement: 1,
      seasonName: null,
      wonAt: new Date(),
    })),
  });

  const total = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: total },
    update: { titlesWon: total },
  });

  console.log(`OK ${TITLES.length} títulos sin años. Total: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
