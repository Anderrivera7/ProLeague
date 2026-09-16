/**
 * Asigna a riveraanderson756@gmail.com los títulos de la imagen de referencia,
 * cada uno con su trofeo PNG local.
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const EMAIL = "riveraanderson756@gmail.com";

/** Títulos según la imagen (competición + equipo con el que se ganó). */
const TITLES: Array<{
  title: string;
  seasonName: string;
  imageUrl: string;
  wonAt: string;
}> = [
  {
    title: "Campeón · Copa Libertadores (Flamengo)",
    seasonName: "2019",
    imageUrl: "/trophies/libertadores.png",
    wonAt: "2019-11-23",
  },
  {
    title: "Campeón · Copa Libertadores (River Plate)",
    seasonName: "2018",
    imageUrl: "/trophies/libertadores.png",
    wonAt: "2018-12-09",
  },
  {
    title: "Campeón · Ligue 1 (AS Monaco)",
    seasonName: "2016-17",
    imageUrl: "/trophies/ligue-1.png",
    wonAt: "2017-05-17",
  },
  {
    title: "Campeón · UEFA Champions League (Liverpool)",
    seasonName: "2018-19",
    imageUrl: "/trophies/ucl.png",
    wonAt: "2019-06-01",
  },
  {
    title: "Campeón · Taça de Portugal (Portugal)",
    seasonName: "2020-21",
    imageUrl: "/trophies/taca-portugal.png",
    wonAt: "2021-05-23",
  },
  {
    title: "Campeón · Süper Lig (Beşiktaş)",
    seasonName: "2020-21",
    imageUrl: "/trophies/super-lig.png",
    wonAt: "2021-05-15",
  },
  {
    title: "Campeón · Bundesliga (Borussia Dortmund)",
    seasonName: "2011-12",
    imageUrl: "/trophies/bundesliga.png",
    wonAt: "2012-05-05",
  },
  {
    title: "Campeón · Primeira Liga (Portugal)",
    seasonName: "2022-23",
    imageUrl: "/trophies/primeira-liga.png",
    wonAt: "2023-05-27",
  },
  {
    title: "Campeón · Premier League",
    seasonName: "2019-20",
    imageUrl: "/trophies/premier-league.png",
    wonAt: "2020-07-26",
  },
  {
    title: "Campeón · Serie A (AC Milan)",
    seasonName: "2021-22",
    imageUrl: "/trophies/serie-a.png",
    wonAt: "2022-05-22",
  },
  {
    title: "Campeón · Primeira Liga (FC Porto)",
    seasonName: "2021-22",
    imageUrl: "/trophies/primeira-liga.png",
    wonAt: "2022-05-07",
  },
  {
    title: "Campeón · La Liga (Real Madrid)",
    seasonName: "2023-24",
    imageUrl: "/trophies/la-liga.png",
    wonAt: "2024-05-04",
  },
  {
    title: "Campeón · Liga Profesional (Racing Club)",
    seasonName: "2014",
    imageUrl: "/trophies/liga-argentina.png",
    wonAt: "2014-12-14",
  },
  {
    title: "Campeón · Copa Sudamericana (LDU Quito)",
    seasonName: "2009",
    imageUrl: "/trophies/sudamericana.png",
    wonAt: "2009-12-02",
  },
  {
    title: "Campeón · Liga 1 Perú (Universitario)",
    seasonName: "2023",
    imageUrl: "/trophies/liga-1-peru.png",
    wonAt: "2023-11-08",
  },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: EMAIL },
    select: { id: true, email: true, nickname: true },
  });

  if (!user) {
    throw new Error(`No existe usuario con email ${EMAIL}`);
  }

  console.log("Usuario:", user);

  // Quitar títulos demo previos sin torneo (para re-sembrar limpio)
  await prisma.trophy.deleteMany({
    where: {
      userId: user.id,
      tournamentId: null,
      title: { startsWith: "Campeón ·" },
    },
  });

  await prisma.trophy.createMany({
    data: TITLES.map((t) => ({
      userId: user.id,
      title: t.title,
      imageUrl: t.imageUrl,
      placement: 1,
      seasonName: t.seasonName,
      wonAt: new Date(t.wonAt),
    })),
  });

  const total = await prisma.trophy.count({ where: { userId: user.id } });

  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      titlesWon: total,
    },
    update: {
      titlesWon: total,
    },
  });

  console.log(`OK: ${TITLES.length} títulos añadidos. Total trofeos: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
