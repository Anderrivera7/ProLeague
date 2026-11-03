import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { NATION_NAME_TO_FLAG } from "../src/lib/fc-data/club-ids";

const prisma = new PrismaClient();

async function main() {
  for (const [clubName, code] of Object.entries(NATION_NAME_TO_FLAG)) {
    const url = `/api/flag/${code}`;
    const r = await prisma.trophy.updateMany({
      where: { clubName },
      data: { clubCrestUrl: url },
    });
    if (r.count) console.log(clubName, "->", url, r.count);
  }

  const legacy = await prisma.trophy.updateMany({
    where: { clubCrestUrl: { contains: "sofifa.net/flags" } },
    data: {},
  });
  // patch one-by-one for legacy URLs
  const rows = await prisma.trophy.findMany({
    where: { clubCrestUrl: { contains: "sofifa.net/flags" } },
    select: { id: true, clubCrestUrl: true, clubName: true },
  });
  for (const row of rows) {
    const code =
      row.clubCrestUrl?.match(/flags\/([a-z0-9-]+)\.png/i)?.[1] ??
      (row.clubName ? NATION_NAME_TO_FLAG[row.clubName] : null);
    if (!code) continue;
    await prisma.trophy.update({
      where: { id: row.id },
      data: { clubCrestUrl: `/api/flag/${code}` },
    });
  }
  console.log("legacy fixed", rows.length);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
