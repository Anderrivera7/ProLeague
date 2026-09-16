/**
 * Setea descensos: yossef=1, anderr=0
 */
import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setRelegations(email: string, relegations: number) {
  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, nickname: true },
  });
  if (!user) {
    console.warn("No encontrado:", email);
    return;
  }
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, relegations },
    update: { relegations },
  });
  console.log(`OK ${user.nickname} → ${relegations} descensos`);
}

async function main() {
  await setRelegations("yossefvalencia@gmail.com", 1);
  await setRelegations("riveraanderson756@gmail.com", 0);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
