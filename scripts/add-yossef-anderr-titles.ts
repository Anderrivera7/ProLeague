import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addTitle(
  nickname: string,
  title: {
    title: string;
    imageUrl: string;
    clubName: string;
    clubCrestUrl: string;
    wonAt: string;
  }
) {
  const user = await prisma.user.findFirst({
    where: { nickname },
    select: { id: true },
  });
  if (!user) throw new Error(`No encontrado: ${nickname}`);

  const exists = await prisma.trophy.findFirst({
    where: {
      userId: user.id,
      title: title.title,
      clubName: title.clubName,
      wonAt: new Date(title.wonAt),
    },
  });
  if (!exists) {
    await prisma.trophy.create({
      data: {
        userId: user.id,
        title: title.title,
        imageUrl: title.imageUrl,
        clubName: title.clubName,
        clubCrestUrl: title.clubCrestUrl,
        placement: 1,
        wonAt: new Date(title.wonAt),
      },
    });
    console.log("added", nickname, title.title, title.clubName);
  } else {
    console.log("skip", nickname, title.title);
  }

  const count = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: count },
    update: { titlesWon: count },
  });
  console.log(nickname, "titles", count);
  return user.id;
}

async function pointCrest(clubName: string, clubCrestUrl: string) {
  const result = await prisma.trophy.updateMany({
    where: { clubName },
    data: { clubCrestUrl },
  });
  console.log("crest", clubName, result.count, clubCrestUrl);
}

async function main() {
  await pointCrest("Real Madrid", "/crests/real-madrid.png");
  await pointCrest("Anderlecht", "/crests/anderlecht.png");
  await addTitle("yossefvalencia", {
    title: "Campeón · La Liga",
    imageUrl: "/trophies/la-liga.png",
    clubName: "Real Madrid",
    clubCrestUrl: "/crests/real-madrid.png",
    wonAt: "2026-06-01",
  });

  await addTitle("anderr", {
    title: "Campeón · Pro League Bélgica",
    imageUrl: "/trophies/belgium-pro-league.png",
    clubName: "Anderlecht",
    clubCrestUrl: "/crests/anderlecht.png",
    wonAt: "2026-06-02",
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
