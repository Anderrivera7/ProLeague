/**
 * Añade Ligue 1 con PSG al perfil de Yosef.
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const EMAIL = "yossefvalencia@gmail.com";

async function ensurePsgCrest() {
  const out = path.join("public/crests", "psg.png");
  if (fs.existsSync(out)) return;
  const url =
    "https://r2.thesportsdb.com/images/media/team/badge/rwqrrq1473504808.png";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PSG crest ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await sharp(buf)
    .resize(256, 256, { fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(out);
  console.log("crest psg.png");
}

async function main() {
  await ensurePsgCrest();

  const user = await prisma.user.findFirst({
    where: { email: EMAIL },
    select: { id: true, nickname: true },
  });
  if (!user) throw new Error("Usuario no encontrado");

  const existing = await prisma.trophy.findFirst({
    where: {
      userId: user.id,
      title: "Campeón · Ligue 1",
      clubName: "Paris Saint-Germain",
    },
  });

  if (existing) {
    console.log("Ya tenía el título Ligue 1 PSG");
  } else {
    await prisma.trophy.create({
      data: {
        userId: user.id,
        title: "Campeón · Ligue 1",
        imageUrl: "/trophies/ligue-1.png",
        clubName: "Paris Saint-Germain",
        clubCrestUrl: "/crests/psg.png",
        placement: 1,
        seasonName: null,
        wonAt: new Date("2025-05-20"),
      },
    });
    console.log("Título Ligue 1 · PSG creado");
  }

  const total = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: total },
    update: { titlesWon: total },
  });

  console.log(`OK ${user.nickname}: ${total} título(s)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
