import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const r = await prisma.trophy.updateMany({
    where: { title: { contains: "Copa América" } },
    data: { imageUrl: "/trophies/copa-america.png" },
  });
  console.log("updated", r.count);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
