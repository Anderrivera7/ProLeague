/**
 * Corrige crestUrl y logoUrl rotos en la base de datos
 * npm run fix:crest-urls
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import {
  getSofifaLeagueLogoUrl,
  getSofifaTeamCrestUrl,
  isClubEaId,
  parseClubEaId,
  resolveLeagueLogoUrl,
  resolveTeamCrestUrl,
} from "../src/lib/fc-data/club-ids";

const prisma = new PrismaClient();

async function main() {
  const teams = await prisma.fcTeam.findMany();
  let teamUpdates = 0;

  for (const team of teams) {
    let next = resolveTeamCrestUrl(team.crestUrl, team.fifaIndexId);
    if (!next && isClubEaId(team.fifaIndexId)) {
      const clubId = parseClubEaId(team.fifaIndexId);
      if (clubId != null) next = getSofifaTeamCrestUrl(clubId);
    }
    if (next && next !== team.crestUrl) {
      await prisma.fcTeam.update({
        where: { id: team.id },
        data: { crestUrl: next },
      });
      teamUpdates++;
    }
  }

  const leagues = await prisma.fcLeague.findMany();
  let leagueUpdates = 0;

  for (const league of leagues) {
    const next =
      resolveLeagueLogoUrl(league.logoUrl, league.fifaIndexId) ??
      getSofifaLeagueLogoUrl(league.fifaIndexId);
    if (next && next !== league.logoUrl) {
      await prisma.fcLeague.update({
        where: { id: league.id },
        data: { logoUrl: next },
      });
      leagueUpdates++;
    }
  }

  console.log(`✅ ${teamUpdates} equipos y ${leagueUpdates} ligas actualizados`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
