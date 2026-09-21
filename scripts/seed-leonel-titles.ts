import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const crest = (clubId: number) =>
  `https://cdn.futbin.com/content/fifa25/img/clubs/${clubId}.png`;
const nation = (id: number) =>
  `https://cdn.futbin.com/content/fifa25/img/nation/${id}.png`;

type TitleSeed = {
  title: string;
  imageUrl: string;
  clubName: string;
  clubCrestUrl: string;
  wonAt: string;
};

/** 16 títulos de leonelchura (orden: más recientes al final = más arriba en vitrina reciente). */
const TITLES: TitleSeed[] = [
  {
    title: "Campeón · Liga 1 Perú",
    imageUrl: "/trophies/liga-1-peru.png",
    clubName: "Alianza Lima",
    clubCrestUrl: crest(111010),
    wonAt: "2024-01-15",
  },
  {
    title: "Campeón · Liga Profesional",
    imageUrl: "/trophies/liga-argentina.png",
    clubName: "Boca Juniors",
    clubCrestUrl: crest(1877),
    wonAt: "2024-02-15",
  },
  {
    title: "Campeón · Serie A",
    imageUrl: "/trophies/serie-a.png",
    clubName: "Inter",
    clubCrestUrl: crest(44),
    wonAt: "2024-03-15",
  },
  {
    title: "Campeón · Bundesliga",
    imageUrl: "/trophies/bundesliga.png",
    clubName: "FC Bayern München",
    clubCrestUrl: crest(21),
    wonAt: "2024-04-15",
  },
  {
    title: "Campeón · Brasileirão",
    imageUrl: "/trophies/brasileirao.png",
    clubName: "Palmeiras",
    clubCrestUrl: crest(383),
    wonAt: "2024-05-15",
  },
  {
    title: "Campeón · Eredivisie",
    imageUrl: "/trophies/eredivisie.png",
    clubName: "PSV",
    clubCrestUrl: crest(247),
    wonAt: "2024-06-15",
  },
  {
    title: "Campeón · MLS",
    imageUrl: "/trophies/mls.png",
    clubName: "Inter Miami",
    clubCrestUrl: crest(112893),
    wonAt: "2024-07-15",
  },
  {
    title: "Campeón · Saudi Pro League",
    imageUrl: "/trophies/saudi-pro-league.png",
    clubName: "Al-Ahli",
    clubCrestUrl: crest(112387),
    wonAt: "2024-08-15",
  },
  {
    title: "Campeón · Copa del Mundo",
    imageUrl: "/trophies/world-cup.png",
    clubName: "France",
    clubCrestUrl: nation(18),
    wonAt: "2024-09-15",
  },
  {
    title: "Campeón · La Liga",
    imageUrl: "/trophies/la-liga.png",
    clubName: "FC Barcelona",
    clubCrestUrl: crest(241),
    wonAt: "2024-10-15",
  },
  {
    title: "Campeón · La Liga",
    imageUrl: "/trophies/la-liga.png",
    clubName: "FC Barcelona",
    clubCrestUrl: crest(241),
    wonAt: "2024-11-15",
  },
  {
    title: "Campeón · La Liga",
    imageUrl: "/trophies/la-liga.png",
    clubName: "FC Barcelona",
    clubCrestUrl: crest(241),
    wonAt: "2024-12-15",
  },
  {
    title: "Campeón · La Liga",
    imageUrl: "/trophies/la-liga.png",
    clubName: "FC Barcelona",
    clubCrestUrl: crest(241),
    wonAt: "2025-01-15",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
    clubName: "Manchester City",
    clubCrestUrl: crest(10),
    wonAt: "2025-02-15",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
    clubName: "Manchester City",
    clubCrestUrl: crest(10),
    wonAt: "2025-03-15",
  },
  {
    title: "Campeón · UEFA Champions League",
    imageUrl: "/trophies/ucl.png",
    clubName: "Manchester City",
    clubCrestUrl: crest(10),
    wonAt: "2025-04-15",
  },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { nickname: "leonelchura" },
    select: { id: true, nickname: true },
  });
  if (!user) throw new Error("leonelchura no encontrado");

  // Solo reemplaza títulos “manuales” (sin torneo), conserva los de torneos reales.
  await prisma.trophy.deleteMany({
    where: { userId: user.id, tournamentId: null },
  });

  await prisma.trophy.createMany({
    data: TITLES.map((t) => ({
      userId: user.id,
      title: t.title,
      imageUrl: t.imageUrl,
      clubName: t.clubName,
      clubCrestUrl: t.clubCrestUrl,
      placement: 1,
      seasonName: null,
      wonAt: new Date(t.wonAt),
    })),
  });

  const trophyCount = await prisma.trophy.count({ where: { userId: user.id } });

  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      titlesWon: trophyCount,
      relegations: 2,
    },
    update: {
      titlesWon: trophyCount,
      relegations: 2,
    },
  });

  console.log({
    user: user.nickname,
    trophies: trophyCount,
    relegations: 2,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
