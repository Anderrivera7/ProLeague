import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";
import { CLUB_NAME_TO_TEAM_ID } from "../src/lib/fc-data/club-ids";

const prisma = new PrismaClient();

const crest = (id: number) => `/api/crest/${id}`;

const OVERRIDES: Record<string, number> = {
  ...CLUB_NAME_TO_TEAM_ID,
  PSV: 246,
  "Olympique de Marseille": 219,
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
    const teamId = OVERRIDES[club];
    let imageUrl = t.imageUrl;
    for (const fix of TROPHY_FIX) {
      if (t.title.toLowerCase().includes(fix.titleContains)) {
        imageUrl = fix.imageUrl;
        break;
      }
    }

    const data: { clubCrestUrl?: string; imageUrl?: string | null } = {};
    if (teamId) data.clubCrestUrl = crest(teamId);
    if (imageUrl && imageUrl !== t.imageUrl) data.imageUrl = imageUrl;

    if (Object.keys(data).length) {
      await prisma.trophy.update({ where: { id: t.id }, data });
      console.log("updated", t.title, club, data);
    }
  }

  for (const [clubName, id] of Object.entries(OVERRIDES)) {
    await prisma.trophy.updateMany({
      where: { clubName },
      data: { clubCrestUrl: crest(id) },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
