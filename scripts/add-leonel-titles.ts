import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const crest = (id: number) => `/api/crest/${id}`;

const TITLES = [
  {
    title: "Campeón · Bundesliga",
    imageUrl: "/trophies/bundesliga.png",
    clubName: "Borussia Dortmund",
    clubCrestUrl: crest(22),
    wonAt: "2026-05-01",
  },
  {
    title: "Campeón · UEFA Champions League",
    imageUrl: "/trophies/ucl.png",
    clubName: "FC Barcelona",
    clubCrestUrl: crest(241),
    wonAt: "2026-05-02",
  },
  {
    title: "Campeón · Copa América",
    imageUrl: "/trophies/copa-america.png",
    clubName: "Brazil",
    clubCrestUrl: "/api/flag/br",
    wonAt: "2026-05-03",
  },
  {
    title: "Campeón · Liga MX",
    imageUrl: "/trophies/liga-mx.png",
    clubName: "Toluca",
    clubCrestUrl: crest(1882),
    wonAt: "2026-05-04",
  },
  {
    title: "Campeón · Copa Africana de Naciones",
    imageUrl: "/trophies/copa-africana.png",
    clubName: "Morocco",
    clubCrestUrl: "/api/flag/ma",
    wonAt: "2026-05-05",
  },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { nickname: "leonelchura" },
    select: { id: true },
  });
  if (!user) throw new Error("leonelchura no encontrado");

  for (const t of TITLES) {
    const exists = await prisma.trophy.findFirst({
      where: {
        userId: user.id,
        title: t.title,
        clubName: t.clubName,
        wonAt: new Date(t.wonAt),
      },
    });
    if (exists) {
      console.log("skip", t.title, t.clubName);
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
        wonAt: new Date(t.wonAt),
      },
    });
    console.log("added", t.title, t.clubName);
  }

  const count = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: count },
    update: { titlesWon: count },
  });
  console.log("titlesWon", count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
