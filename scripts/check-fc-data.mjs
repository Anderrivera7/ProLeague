import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local", override: true });
dotenv.config({ override: true });

const prisma = new PrismaClient();

try {
  const host = new URL(process.env.DATABASE_URL).host;
  const [leagues, leaguesWithTeams, players] = await Promise.all([
    prisma.fcLeague.count(),
    prisma.fcLeague.count({ where: { teams: { some: {} } } }),
    prisma.fcPlayer.count(),
  ]);
  console.log({ host, fcLeagues: leagues, leaguesWithTeams, fcPlayers: players });
} finally {
  await prisma.$disconnect();
}
