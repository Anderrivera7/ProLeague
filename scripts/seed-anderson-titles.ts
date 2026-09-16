/**
 * Títulos de Anderson corregidos + nuevos (Man Utd, Benfica, Universitario Libertadores).
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "riveraanderson756@gmail.com";

type TitleSeed = {
  title: string;
  imageUrl: string;
  clubName: string;
  clubCrestUrl: string;
  /** Más reciente = jugado más tarde (para “últimas 3”). */
  wonAt: string;
};

const TITLES: TitleSeed[] = [
  {
    title: "Campeón · Copa Libertadores",
    imageUrl: "/trophies/libertadores.png",
    clubName: "Flamengo",
    clubCrestUrl: "/crests/flamengo.png",
    wonAt: "2024-01-10",
  },
  {
    title: "Campeón · Copa Libertadores",
    imageUrl: "/trophies/libertadores.png",
    clubName: "River Plate",
    clubCrestUrl: "/crests/river-plate.png",
    wonAt: "2024-02-10",
  },
  {
    title: "Campeón · Ligue 1",
    imageUrl: "/trophies/ligue-1.png",
    clubName: "AS Monaco",
    clubCrestUrl: "/crests/monaco.png",
    wonAt: "2024-03-10",
  },
  {
    title: "Campeón · UEFA Champions League",
    imageUrl: "/trophies/ucl.png",
    clubName: "Liverpool",
    clubCrestUrl: "/crests/liverpool.png",
    wonAt: "2024-04-10",
  },
  {
    title: "Campeón · Copa Confederaciones",
    imageUrl: "/trophies/confederations.png",
    clubName: "Portugal",
    clubCrestUrl: "/crests/portugal.png",
    wonAt: "2024-05-10",
  },
  {
    title: "Campeón · Süper Lig",
    imageUrl: "/trophies/super-lig.png",
    clubName: "Beşiktaş",
    clubCrestUrl: "/crests/besiktas.png",
    wonAt: "2024-06-10",
  },
  {
    title: "Campeón · Bundesliga",
    imageUrl: "/trophies/bundesliga.png",
    clubName: "Borussia Dortmund",
    clubCrestUrl: "/crests/dortmund.png",
    wonAt: "2024-07-10",
  },
  {
    title: "Campeón · Copa del Mundo",
    imageUrl: "/trophies/world-cup.png",
    clubName: "Portugal",
    clubCrestUrl: "/crests/portugal.png",
    wonAt: "2024-08-10",
  },
  {
    title: "Campeón · Copa Intercontinental",
    imageUrl: "/trophies/intercontinental.png",
    clubName: "Premier League All Stars",
    clubCrestUrl: "/crests/pl-all-stars.png",
    wonAt: "2024-09-10",
  },
  {
    title: "Campeón · Serie A",
    imageUrl: "/trophies/serie-a.png",
    clubName: "AC Milan",
    clubCrestUrl: "/crests/milan.png",
    wonAt: "2024-10-10",
  },
  {
    title: "Campeón · Primeira Liga",
    imageUrl: "/trophies/primeira-liga.png",
    clubName: "FC Porto",
    clubCrestUrl: "/crests/porto.png",
    wonAt: "2024-11-10",
  },
  {
    title: "Campeón · Mundial de Clubes",
    imageUrl: "/trophies/club-world-cup.png",
    clubName: "Real Madrid",
    clubCrestUrl: "/crests/real-madrid.png",
    wonAt: "2025-07-13",
  },
  {
    title: "Campeón · Liga Profesional",
    imageUrl: "/trophies/liga-argentina.png",
    clubName: "Racing Club",
    clubCrestUrl: "/crests/racing.png",
    wonAt: "2025-01-10",
  },
  {
    title: "Campeón · Liga Pro Ecuador",
    imageUrl: "/trophies/liga-ecuador.png",
    clubName: "LDU Quito",
    clubCrestUrl: "/crests/ldu-quito.png",
    wonAt: "2025-02-10",
  },
  {
    title: "Campeón · Liga 1 Perú",
    imageUrl: "/trophies/liga-1-peru.png",
    clubName: "Universitario",
    clubCrestUrl: "/crests/universitario.png",
    wonAt: "2025-03-10",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
    clubName: "Manchester United",
    clubCrestUrl: "/crests/man-utd.png",
    wonAt: "2025-04-10",
  },
  {
    title: "Campeón · UEFA Champions League",
    imageUrl: "/trophies/ucl.png",
    clubName: "Manchester United",
    clubCrestUrl: "/crests/man-utd.png",
    wonAt: "2025-05-10",
  },
  {
    title: "Campeón · Primeira Liga",
    imageUrl: "/trophies/primeira-liga.png",
    clubName: "Benfica",
    clubCrestUrl: "/crests/benfica.png",
    wonAt: "2025-06-10",
  },
  {
    title: "Campeón · Copa Libertadores",
    imageUrl: "/trophies/libertadores.png",
    clubName: "Universitario",
    clubCrestUrl: "/crests/universitario.png",
    wonAt: "2025-08-10",
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
      clubName: t.clubName,
      clubCrestUrl: t.clubCrestUrl,
      placement: 1,
      seasonName: null,
      wonAt: new Date(t.wonAt),
    })),
  });

  const total = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: total },
    update: { titlesWon: total },
  });

  console.log(`OK ${TITLES.length} títulos. Total: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
