/**
 * Importa la UEFA Champions League 2026/27 con los clasificados.
 * Uso: npm run seed:fc-ucl
 */

import "dotenv/config";
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { resolveFc26CsvPath } from "../src/lib/fc-data/csv-store";
import {
  getClubSquadFromRows,
  parseFc26ClubCsv,
} from "../src/lib/fc-data/csv-club-parser";
import { computeTeamStats } from "../src/lib/fc-data/ea-drop-client";
import {
  UCL_LEAGUE_EA_ID,
  eaIdFromClub,
  getSofifaTeamCrestUrl,
} from "../src/lib/fc-data/club-ids";
import {
  UCL_2026_27_TEAMS,
  UCL_LEAGUE_DISPLAY_NAME,
} from "../src/lib/fc-data/ucl-teams";

const prisma = new PrismaClient();

async function main() {
  const rows = parseFc26ClubCsv(readFileSync(resolveFc26CsvPath(), "utf8"));

  const league = await prisma.fcLeague.upsert({
    where: { fifaIndexId: UCL_LEAGUE_EA_ID },
    create: {
      fifaIndexId: UCL_LEAGUE_EA_ID,
      name: UCL_LEAGUE_DISPLAY_NAME,
      country: "Europa",
      logoUrl: "/leagues/ucl-icon.png",
    },
    update: {
      name: UCL_LEAGUE_DISPLAY_NAME,
      logoUrl: "/leagues/ucl-icon.png",
    },
  });

  console.log(`Importando ${UCL_2026_27_TEAMS.length} clasificados UCL 2026/27...\n`);

  const expectedEaIds: string[] = [];

  for (const entry of UCL_2026_27_TEAMS) {
    const eaId = eaIdFromClub(entry.clubTeamId);
    expectedEaIds.push(eaId);

    const squad = getClubSquadFromRows(rows, entry.clubTeamId);
    if (squad.length === 0) {
      console.log(`○ ${entry.name} — sin datos en CSV, solo metadatos`);
      await prisma.fcTeam.upsert({
        where: { fifaIndexId: eaId },
        create: {
          fifaIndexId: eaId,
          name: entry.name,
          country: "Europa",
          crestUrl: getSofifaTeamCrestUrl(entry.clubTeamId),
          leagueId: league.id,
        },
        update: {
          name: entry.name,
          crestUrl: getSofifaTeamCrestUrl(entry.clubTeamId),
        },
      });
      continue;
    }

    const stats = computeTeamStats(
      squad.map((p) => ({
        eaId: p.playerId,
        name: p.shortName || p.name,
        overall: p.overall,
        position:
          p.clubPosition && !["SUB", "RES"].includes(p.clubPosition)
            ? p.clubPosition
            : p.positions.split(",")[0]?.trim(),
      }))
    );

    const displayName = squad[0]?.clubName ?? entry.name;

    await prisma.fcTeam.upsert({
      where: { fifaIndexId: eaId },
      create: {
        fifaIndexId: eaId,
        name: displayName,
        shortName: displayName,
        country: "Europa",
        crestUrl: getSofifaTeamCrestUrl(entry.clubTeamId),
        overall: stats.overall,
        attack: stats.attack,
        midfield: stats.midfield,
        defense: stats.defense,
        leagueId: league.id,
        syncedAt: new Date(),
      },
      update: {
        name: displayName,
        crestUrl: getSofifaTeamCrestUrl(entry.clubTeamId),
        overall: stats.overall,
        attack: stats.attack,
        midfield: stats.midfield,
        defense: stats.defense,
      },
    });

    console.log(`✓ ${displayName} — OVR ${stats.overall}`);
  }

  // Solo limpia equipos huérfanos creados solo para UCL (sin liga doméstica)
  await prisma.fcTeam.deleteMany({
    where: {
      leagueId: league.id,
      fifaIndexId: { notIn: expectedEaIds },
    },
  });

  console.log(`\n✅ ${UCL_2026_27_TEAMS.length} equipos UCL 2026/27 listos`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
