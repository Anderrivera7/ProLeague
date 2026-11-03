import { config } from "dotenv";
config({ path: ".env" });
config({ path: ".env.local", override: true });

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const crest = (id: number) => `/api/crest/${id}`;
const localCrest = (path: string) => path;
const nationFlag = (code: string) => `https://cdn.sofifa.net/flags/${code}.png`;

/** Escudos estables vía proxy local o assets en /public. */
const CLUB_CREST: Record<string, string> = {
  Feyenoord: crest(246),
  PSV: crest(247),
  Bologna: crest(189),
  "FC Porto": crest(236),
  Benfica: crest(234),
  "Manchester United": crest(11),
  "River Plate": crest(1876),
  Universitario: crest(111017),
  Liverpool: crest(9),
  Flamengo: crest(1041),
  "LDU Quito": crest(110740),
  "FC Bayern München": crest(21),
  Palmeiras: crest(383),
  Inter: crest(44),
  "Olympique de Marseille": crest(219),
  "Sporting CP": crest(237),
  "Colo-Colo": crest(110980),
  Rangers: crest(86),
  "Atlético Madrid": crest(240),
  France: nationFlag("fr"),
  Argentina: nationFlag("ar"),
  Morocco: nationFlag("ma"),
};

function trophyImageForTitle(title: string): string | null {
  const t = title.toLowerCase();
  if (t.includes("europa league")) return "/trophies/europa-league.png";
  if (t.includes("eurocopa")) return "/trophies/eurocopa.png";
  if (t.includes("africana")) return "/trophies/copa-africana.png";
  if (t.includes("chile") || t.includes("colo")) return "/trophies/liga-chile.png";
  if (t.includes("conference")) return "/trophies/conference-league.png";
  if (t.includes("escoc") || t.includes("scottish") || t.includes("premiership"))
    return "/trophies/scottish-premiership.png";
  return null;
}

async function fixUserTrophies(nickname: string) {
  const user = await prisma.user.findFirst({
    where: { nickname },
    select: { id: true },
  });
  if (!user) return;

  const trophies = await prisma.trophy.findMany({
    where: { userId: user.id },
  });

  for (const tr of trophies) {
    const club = tr.clubName ?? "";
    const crestUrl = CLUB_CREST[club];
    const imageUrl = trophyImageForTitle(tr.title) ?? tr.imageUrl;

    const data: { clubCrestUrl?: string; imageUrl?: string | null } = {};
    if (crestUrl) data.clubCrestUrl = crestUrl;
    if (imageUrl && imageUrl !== tr.imageUrl) data.imageUrl = imageUrl;

    if (Object.keys(data).length) {
      await prisma.trophy.update({ where: { id: tr.id }, data });
    }
  }
}

async function addTitle(
  nickname: string,
  seed: {
    title: string;
    imageUrl: string;
    clubName: string;
    clubCrestUrl: string;
    wonAt: string;
  }
) {
  const user = await prisma.user.findFirst({
    where: { nickname },
    select: { id: true },
  });
  if (!user) return;

  const exists = await prisma.trophy.findFirst({
    where: {
      userId: user.id,
      title: seed.title,
      clubName: seed.clubName,
      tournamentId: null,
    },
  });
  if (exists) return;

  await prisma.trophy.create({
    data: {
      userId: user.id,
      title: seed.title,
      imageUrl: seed.imageUrl,
      clubName: seed.clubName,
      clubCrestUrl: seed.clubCrestUrl,
      placement: 1,
      wonAt: new Date(seed.wonAt),
    },
  });

  const count = await prisma.trophy.count({ where: { userId: user.id } });
  await prisma.playerStats.upsert({
    where: { userId: user.id },
    create: { userId: user.id, titlesWon: count },
    update: { titlesWon: count },
  });
  console.log("added", nickname, seed.title, seed.clubName);
}

async function normalizeAllClubCrests() {
  const { CLUB_NAME_TO_TEAM_ID } = await import("../src/lib/fc-data/club-ids");
  for (const [clubName, id] of Object.entries(CLUB_NAME_TO_TEAM_ID)) {
    const r = await prisma.trophy.updateMany({
      where: { clubName },
      data: { clubCrestUrl: `/api/crest/${id}` },
    });
    if (r.count) console.log("crests -> api", clubName, r.count);
  }

  await prisma.trophy.updateMany({
    where: {
      title: { contains: "Europa League", mode: "insensitive" },
    },
    data: { imageUrl: "/trophies/europa-league.png" },
  });
}

async function main() {
  await normalizeAllClubCrests();

  for (const nick of [
    "anderr",
    "leonelchura",
    "sergiogiovanivillarr",
    "yossefvalencia",
  ]) {
    await fixUserTrophies(nick);
    console.log("fixed trophies", nick);
  }

  await addTitle("leonelchura", {
    title: "Campeón · Eurocopa",
    imageUrl: "/trophies/eurocopa.png",
    clubName: "France",
    clubCrestUrl: nationFlag("fr"),
    wonAt: "2026-04-01",
  });

  await addTitle("leonelchura", {
    title: "Campeón · UEFA Conference League",
    imageUrl: "/trophies/conference-league.png",
    clubName: "Olympique de Marseille",
    clubCrestUrl: crest(179),
    wonAt: "2026-04-02",
  });

  await addTitle("anderr", {
    title: "Campeón · Scottish Premiership",
    imageUrl: "/trophies/scottish-premiership.png",
    clubName: "Rangers",
    clubCrestUrl: crest(342),
    wonAt: "2026-04-03",
  });

  // Feyenoord: forzar escudo correcto
  await prisma.trophy.updateMany({
    where: { clubName: "Feyenoord" },
    data: { clubCrestUrl: crest(247) },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
