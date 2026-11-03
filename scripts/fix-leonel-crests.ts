import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { CLUB_NAME_TO_TEAM_ID } from "../src/lib/fc-data/club-ids";

const prisma = new PrismaClient();

const crest = (id: number) => `/api/crest/${id}`;

const OVERRIDES: Record<string, number> = {
  ...CLUB_NAME_TO_TEAM_ID,
  PSV: 247,
  Feyenoord: 246,
  Bologna: 189,
};

const NATION_FLAGS: Record<string, string> = {
  France: "/api/flag/fr",
  Morocco: "/api/flag/ma",
  Argentina: "/api/flag/ar",
};

const TROPHY_FIX: Array<{ titleContains: string; imageUrl: string }> = [
  { titleContains: "chile", imageUrl: "/trophies/liga-chile.png" },
  { titleContains: "colo", imageUrl: "/trophies/liga-chile.png" },
  { titleContains: "conference", imageUrl: "/trophies/conference-league.png" },
  { titleContains: "eurocopa", imageUrl: "/trophies/eurocopa.png" },
  { titleContains: "africana", imageUrl: "/trophies/copa-africana.png" },
  { titleContains: "europa league", imageUrl: "/trophies/europa-league.png" },
];

async function main() {
  const user = await prisma.user.findFirst({
    where: { nickname: "leonelchura" },
    select: { id: true },
  });
  if (!user) throw new Error("leonelchura no encontrado");

  const trophies = await prisma.trophy.findMany({ where: { userId: user.id } });

  for (const t of trophies) {
    const club = t.clubName ?? "";
    const nationCrest = NATION_FLAGS[club];
    const teamId = nationCrest ? undefined : OVERRIDES[club];
    let imageUrl = t.imageUrl;
    for (const fix of TROPHY_FIX) {
      if (t.title.toLowerCase().includes(fix.titleContains)) {
        imageUrl = fix.imageUrl;
        break;
      }
    }

    const data: {
      clubCrestUrl?: string;
      clubName?: string;
      imageUrl?: string | null;
    } = {};
    if (nationCrest) data.clubCrestUrl = nationCrest;
    else if (teamId) data.clubCrestUrl = crest(teamId);

    if (
      t.title.toLowerCase().includes("conference") &&
      club === "Olympique de Marseille"
    ) {
      data.clubName = "Bologna";
      data.clubCrestUrl = crest(189);
    }
    if (imageUrl && imageUrl !== t.imageUrl) data.imageUrl = imageUrl;

    if (Object.keys(data).length) {
      await prisma.trophy.update({ where: { id: t.id }, data });
      console.log("updated", t.title, club, data);
    }
  }

  for (const [clubName, id] of Object.entries(OVERRIDES)) {
    if (NATION_FLAGS[clubName]) continue;
    await prisma.trophy.updateMany({
      where: { clubName },
      data: { clubCrestUrl: crest(id) },
    });
  }

  for (const [clubName, url] of Object.entries(NATION_FLAGS)) {
    await prisma.trophy.updateMany({
      where: { clubName },
      data: { clubCrestUrl: url },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
