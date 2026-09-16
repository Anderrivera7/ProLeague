/**
 * Títulos de Anderson con trofeo + escudo del equipo.
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const EMAIL = "riveraanderson756@gmail.com";

const TITLES: Array<{
  title: string;
  imageUrl: string;
  clubName: string;
  clubCrestUrl: string;
}> = [
  {
    title: "Campeón · Copa Libertadores",
    imageUrl: "/trophies/libertadores.png",
    clubName: "Flamengo",
    clubCrestUrl: "/crests/flamengo.png",
  },
  {
    title: "Campeón · Copa Libertadores",
    imageUrl: "/trophies/libertadores.png",
    clubName: "River Plate",
    clubCrestUrl: "/crests/river-plate.png",
  },
  {
    title: "Campeón · Ligue 1",
    imageUrl: "/trophies/ligue-1.png",
    clubName: "AS Monaco",
    clubCrestUrl: "/crests/monaco.png",
  },
  {
    title: "Campeón · UEFA Champions League",
    imageUrl: "/trophies/ucl.png",
    clubName: "Liverpool",
    clubCrestUrl: "/crests/liverpool.png",
  },
  {
    title: "Campeón · Taça de Portugal",
    imageUrl: "/trophies/taca-portugal.png",
    clubName: "Portugal",
    clubCrestUrl: "/crests/portugal.png",
  },
  {
    title: "Campeón · Süper Lig",
    imageUrl: "/trophies/super-lig.png",
    clubName: "Beşiktaş",
    clubCrestUrl: "/crests/besiktas.png",
  },
  {
    title: "Campeón · Bundesliga",
    imageUrl: "/trophies/bundesliga.png",
    clubName: "Borussia Dortmund",
    clubCrestUrl: "/crests/dortmund.png",
  },
  {
    title: "Campeón · Primeira Liga",
    imageUrl: "/trophies/primeira-liga.png",
    clubName: "Portugal",
    clubCrestUrl: "/crests/portugal.png",
  },
  {
    title: "Campeón · Premier League",
    imageUrl: "/trophies/premier-league.png",
    clubName: "Premier League",
    clubCrestUrl: "/crests/premier-league.png",
  },
  {
    title: "Campeón · Serie A",
    imageUrl: "/trophies/serie-a.png",
    clubName: "AC Milan",
    clubCrestUrl: "/crests/milan.png",
  },
  {
    title: "Campeón · Primeira Liga",
    imageUrl: "/trophies/primeira-liga.png",
    clubName: "FC Porto",
    clubCrestUrl: "/crests/porto.png",
  },
  {
    title: "Campeón · La Liga",
    imageUrl: "/trophies/la-liga.png",
    clubName: "Real Madrid",
    clubCrestUrl: "/crests/real-madrid.png",
  },
  {
    title: "Campeón · Liga Profesional",
    imageUrl: "/trophies/liga-argentina.png",
    clubName: "Racing Club",
    clubCrestUrl: "/crests/racing.png",
  },
  {
    title: "Campeón · Liga Pro Ecuador",
    imageUrl: "/trophies/liga-ecuador.png",
    clubName: "LDU Quito",
    clubCrestUrl: "/crests/ldu-quito.png",
  },
  {
    title: "Campeón · Liga 1 Perú",
    imageUrl: "/trophies/liga-1-peru.png",
    clubName: "Universitario",
    clubCrestUrl: "/crests/universitario.png",
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
      wonAt: new Date(),
    })),
  });

  const total = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: total },
    update: { titlesWon: total },
  });

  console.log(`OK ${TITLES.length} títulos con escudo. Total: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
