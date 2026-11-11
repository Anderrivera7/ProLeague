import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS "mvpFcPlayerId" TEXT`
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE matches ADD COLUMN IF NOT EXISTS "proposedMvpFcPlayerId" TEXT`
  );
  console.log("columnas mvp listas");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
