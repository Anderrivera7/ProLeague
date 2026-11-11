import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { TrophyService } from "../src/services/trophy-service";

const prisma = new PrismaClient();

async function main() {
  const tournaments = await prisma.tournament.findMany({
    where: { status: "COMPLETED" },
    select: { id: true, name: true },
  });
  for (const tournament of tournaments) {
    const winners = await TrophyService.ensureBallonDor(prisma, tournament.id);
    console.log(
      tournament.name,
      winners.map((winner) => `${winner.nickname} ${winner.points}`).join(", ") ||
        "sin puntos"
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
