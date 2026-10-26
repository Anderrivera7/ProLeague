/**
 * Agrega títulos / descensos a perfiles (sin borrar trofeos de torneos reales).
 */
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

async function addTitles(nickname: string, titles: TitleSeed[]) {
  const user = await prisma.user.findFirst({
    where: { nickname },
    select: { id: true, nickname: true },
  });
  if (!user) throw new Error(`No encontrado: ${nickname}`);

  for (const t of titles) {
    const dup = await prisma.trophy.findFirst({
      where: {
        userId: user.id,
        tournamentId: null,
        title: t.title,
        clubName: t.clubName,
        wonAt: new Date(t.wonAt),
      },
    });
    if (dup) {
      console.log("skip (ya existe)", nickname, t.title, t.clubName);
      continue;
    }
    await prisma.trophy.create({
      data: {
        userId: user.id,
        title: t.title,
        imageUrl: t.imageUrl,
        clubName: t.clubName,
        clubCrestUrl: t.clubCrestUrl,
        placement: 1,
        seasonName: null,
        wonAt: new Date(t.wonAt),
      },
    });
    console.log("added", nickname, t.clubName, t.title);
  }

  const count = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: count },
    update: { titlesWon: count },
  });
  console.log("titlesWon ->", count, nickname);
}

const ANDERR: TitleSeed[] = [
  {
    title: "Campeón · Liga 1 Perú",
    imageUrl: "/trophies/liga-1-peru.png",
    clubName: "Universitario",
    clubCrestUrl: crest(111017),
    wonAt: "2026-01-10",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
    clubName: "Manchester United",
    clubCrestUrl: crest(11),
    wonAt: "2026-01-11",
  },
  {
    title: "Campeón · Eredivisie",
    imageUrl: "/trophies/eredivisie.png",
    clubName: "Feyenoord",
    clubCrestUrl: crest(247),
    wonAt: "2026-01-12",
  },
  {
    title: "Campeón · Copa Libertadores",
    imageUrl: "/trophies/libertadores.png",
    clubName: "River Plate",
    clubCrestUrl: crest(1876),
    wonAt: "2026-01-13",
  },
  {
    title: "Campeón · UEFA Europa League",
    imageUrl: "/trophies/ucl.png",
    clubName: "FC Porto",
    clubCrestUrl: crest(236),
    wonAt: "2026-01-14",
  },
  {
    title: "Campeón · Primeira Liga",
    imageUrl: "/trophies/primeira-liga.png",
    clubName: "Benfica",
    clubCrestUrl: crest(234),
    wonAt: "2026-01-15",
  },
];

const SERGIO: TitleSeed[] = [
  {
    title: "Campeón · Copa del Mundo",
    imageUrl: "/trophies/world-cup.png",
    clubName: "France",
    clubCrestUrl: nation(18),
    wonAt: "2026-02-01",
  },
];

const YOSSEF: TitleSeed[] = [
  {
    title: "Campeón · Liga Profesional",
    imageUrl: "/trophies/liga-argentina.png",
    clubName: "River Plate",
    clubCrestUrl: crest(1876),
    wonAt: "2026-02-05",
  },
];

const LEONEL: TitleSeed[] = [
  {
    title: "Campeón · Eurocopa",
    imageUrl: "/trophies/world-cup.png",
    clubName: "France",
    clubCrestUrl: nation(18),
    wonAt: "2026-03-01",
  },
  {
    title: "Campeón · Eurocopa",
    imageUrl: "/trophies/world-cup.png",
    clubName: "France",
    clubCrestUrl: nation(18),
    wonAt: "2026-03-02",
  },
  {
    title: "Campeón · Primeira Liga",
    imageUrl: "/trophies/primeira-liga.png",
    clubName: "Sporting CP",
    clubCrestUrl: crest(237),
    wonAt: "2026-03-03",
  },
  {
    title: "Campeón · Copa Africana de Naciones",
    imageUrl: "/trophies/world-cup.png",
    clubName: "Morocco",
    clubCrestUrl: nation(129),
    wonAt: "2026-03-04",
  },
  {
    title: "Campeón · UEFA Champions League",
    imageUrl: "/trophies/ucl.png",
    clubName: "FC Bayern München",
    clubCrestUrl: crest(21),
    wonAt: "2026-03-05",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
    clubName: "Liverpool",
    clubCrestUrl: crest(9),
    wonAt: "2026-03-06",
  },
  {
    title: "Campeón · Mundial de Clubes",
    imageUrl: "/trophies/club-world-cup.png",
    clubName: "Palmeiras",
    clubCrestUrl: crest(383),
    wonAt: "2026-03-07",
  },
  {
    title: "Campeón · Primera División Chile",
    imageUrl: "/trophies/liga-ecuador.png",
    clubName: "Colo-Colo",
    clubCrestUrl: crest(110980),
    wonAt: "2026-03-08",
  },
  {
    title: "Campeón · Serie A",
    imageUrl: "/trophies/serie-a.png",
    clubName: "Inter",
    clubCrestUrl: crest(44),
    wonAt: "2026-03-09",
  },
  {
    title: "Campeón · Ligue 1",
    imageUrl: "/trophies/ligue-1.png",
    clubName: "Olympique de Marseille",
    clubCrestUrl: crest(179),
    wonAt: "2026-03-10",
  },
];

async function setRelegations(nickname: string, relegations: number) {
  const user = await prisma.user.findFirst({
    where: { nickname },
    select: { id: true },
  });
  if (!user) throw new Error(`No encontrado: ${nickname}`);
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, relegations },
    update: { relegations },
  });
  console.log("relegations ->", relegations, nickname);
}

async function main() {
  await addTitles("anderr", ANDERR);
  await addTitles("sergiogiovanivillarr", SERGIO);
  await addTitles("yossefvalencia", YOSSEF);
  await setRelegations("yossefvalencia", 2);
  await addTitles("leonelchura", LEONEL);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
