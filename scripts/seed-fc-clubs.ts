/**
 * Importa ligas de clubes y equipos desde data/fc26-players.csv
 * Los jugadores se cargan en lazy sync al elegir equipo.
 *
 * Uso:
 *   npm run seed:fc-clubs
 *   npm run seed:fc-clubs -- --level=1
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { resolveFc26CsvPath } from "../src/lib/fc-data/csv-store";
import {
  extractClubsFromRows,
  extractLeaguesFromClubRows,
  getClubSquadFromRows,
  parseFc26ClubCsv,
} from "../src/lib/fc-data/csv-club-parser";
import { computeTeamStats } from "../src/lib/fc-data/ea-drop-client";
import {
  eaIdFromClub,
  getSofifaLeagueLogoUrl,
  getSofifaTeamCrestUrl,
} from "../src/lib/fc-data/club-ids";

const prisma = new PrismaClient();

const maxLevel = (() => {
  const arg = process.argv.find((a) => a.startsWith("--level="));
  return arg ? parseInt(arg.split("=")[1] ?? "1", 10) : 1;
})();

async function main() {
  const csvPath = resolveFc26CsvPath();
  console.log(`Leyendo ${csvPath}...\n`);

  const rows = parseFc26ClubCsv(readFileSync(csvPath, "utf8"));
  const leagues = extractLeaguesFromClubRows(rows, { maxLevel });

  console.log(
    `Importando ${leagues.length} ligas (nivel ≤ ${maxLevel}) con sus equipos...\n`
  );

  let totalTeams = 0;

  for (const league of leagues) {
    const dbLeague = await prisma.fcLeague.upsert({
      where: { fifaIndexId: String(league.leagueId) },
      create: {
        fifaIndexId: String(league.leagueId),
        name: league.name,
        country: league.name,
        logoUrl: getSofifaLeagueLogoUrl(league.leagueId),
      },
      update: {
        name: league.name,
        logoUrl: getSofifaLeagueLogoUrl(league.leagueId),
      },
    });

    const clubs = extractClubsFromRows(rows, league.leagueId);
    console.log(`📋 ${league.name} — ${clubs.length} equipos`);

    for (const club of clubs) {
      const squad = getClubSquadFromRows(rows, club.clubTeamId);
      if (squad.length === 0) continue;

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

      await prisma.fcTeam.upsert({
        where: { fifaIndexId: eaIdFromClub(club.clubTeamId) },
        create: {
          fifaIndexId: eaIdFromClub(club.clubTeamId),
          name: club.name,
          shortName: club.name,
          country: league.name,
          crestUrl: getSofifaTeamCrestUrl(club.clubTeamId),
          overall: stats.overall,
          attack: stats.attack,
          midfield: stats.midfield,
          defense: stats.defense,
          leagueId: dbLeague.id,
          syncedAt: new Date(),
        },
        update: {
          name: club.name,
          shortName: club.name,
          country: league.name,
          crestUrl: getSofifaTeamCrestUrl(club.clubTeamId),
          overall: stats.overall,
          attack: stats.attack,
          midfield: stats.midfield,
          defense: stats.defense,
          leagueId: dbLeague.id,
        },
      });

      totalTeams++;
    }
  }

  console.log(`\n✅ ${leagues.length} ligas y ${totalTeams} equipos con escudos listos`);
  console.log(`   También: npm run seed:fc-teams (selecciones nacionales)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
