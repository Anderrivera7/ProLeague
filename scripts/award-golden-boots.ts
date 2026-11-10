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
  console.log("torneos finalizados", tournaments.length);
  for (const tournament of tournaments) {
    const winners = await TrophyService.ensureGoldenBoot(prisma, tournament.id);
    console.log(
      tournament.name,
      winners.length
        ? winners.map((winner) => `${winner.nickname} ${winner.goals}`).join(", ")
        : "sin goles"
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
