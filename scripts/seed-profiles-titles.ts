/**
 * Agrega títulos / descensos a perfiles (sin borrar trofeos de torneos reales).
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const crest = (clubId: number) => `/api/crest/${clubId}`;
const nationFlag = (code: string) =>
  `https://cdn.sofifa.net/flags/${code}.png`;

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
    clubCrestUrl: "/crests/universitario.png",
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
    clubCrestUrl: "/crests/river-plate.png",
    wonAt: "2026-01-13",
  },
  {
    title: "Campeón · UEFA Europa League",
    imageUrl: "/trophies/europa-league.png",
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
  {
    title: "Campeón · Scottish Premiership",
    imageUrl: "/trophies/scottish-premiership.png",
    clubName: "Rangers",
    clubCrestUrl: crest(342),
    wonAt: "2026-04-03",
  },
];

const SERGIO: TitleSeed[] = [
  {
    title: "Campeón · Copa del Mundo",
    imageUrl: "/trophies/world-cup.png",
    clubName: "France",
    clubCrestUrl: nationFlag("fr"),
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
    imageUrl: "/trophies/eurocopa.png",
    clubName: "France",
    clubCrestUrl: nationFlag("fr"),
    wonAt: "2026-03-01",
  },
  {
    title: "Campeón · Eurocopa",
    imageUrl: "/trophies/eurocopa.png",
    clubName: "France",
    clubCrestUrl: nationFlag("fr"),
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
    imageUrl: "/trophies/copa-africana.png",
    clubName: "Morocco",
    clubCrestUrl: nationFlag("ma"),
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
    clubCrestUrl: "/crests/liverpool.png",
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
    imageUrl: "/trophies/liga-chile.png",
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
    clubCrestUrl: crest(219),
    wonAt: "2026-03-10",
  },
  {
    title: "Campeón · UEFA Conference League",
    imageUrl: "/trophies/conference-league.png",
    clubName: "Bologna",
    clubCrestUrl: crest(189),
    wonAt: "2026-04-02",
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
