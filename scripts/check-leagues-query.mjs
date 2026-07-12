import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

try {
  const leagues = await prisma.fcLeague.findMany({
    where: { teams: { some: {} } },
    include: { _count: { select: { teams: true } } },
  });
  console.log("URL host:", new URL(process.env.DATABASE_URL).host);
  console.log("leagues found:", leagues.length);
  console.log("sample:", leagues.slice(0, 3).map((l) => l.name));
} catch (e) {
  console.error("QUERY FAILED:", e);
} finally {
  await prisma.$disconnect();
}
