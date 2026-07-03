import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { FC26_WORLD_CUP_NATIONS } from "../src/lib/fc-data/national-teams";
import { importNationalTeamFromCsv } from "../src/lib/fc-data/csv-importer";
import { eaIdFromNationality } from "../src/lib/fc-data/national-teams";

const prisma = new PrismaClient();

async function main() {
  const league = await prisma.fcLeague.upsert({
    where: { fifaIndexId: "intl" },
    create: {
      fifaIndexId: "intl",
      name: "Selecciones Nacionales FC26",
      country: "Internacional",
    },
    update: { name: "Selecciones Nacionales FC26" },
  });

  console.log(
    `Importando ${FC26_WORLD_CUP_NATIONS.length} selecciones desde CSV SoFIFA...\n`
  );

  for (const nation of FC26_WORLD_CUP_NATIONS) {
    const eaId = eaIdFromNationality(nation.nationalityId);

    try {
      const { team, players } = importNationalTeamFromCsv(nation.nationalityId);

      const fcTeam = await prisma.fcTeam.upsert({
        where: { fifaIndexId: eaId },
        create: {
          fifaIndexId: eaId,
          name: team.name,
          shortName: team.shortName,
          country: team.country,
          crestUrl: team.crestUrl,
          overall: team.overall,
          attack: team.attack,
          midfield: team.midfield,
          defense: team.defense,
          leagueId: league.id,
          syncedAt: new Date(),
        },
        update: {
          name: team.name,
          shortName: team.shortName,
          overall: team.overall,
          attack: team.attack,
          midfield: team.midfield,
          defense: team.defense,
          leagueId: league.id,
          syncedAt: new Date(),
        },
      });

      await prisma.fcPlayer.deleteMany({ where: { teamId: fcTeam.id } });

      for (const p of players) {
        await prisma.fcPlayer.upsert({
          where: { fifaIndexId: p.eaId },
          create: {
            fifaIndexId: p.eaId,
            name: p.name,
            position: p.position,
            squadRole: p.squadRole,
            jerseyNumber: p.jerseyNumber,
            overall: p.overall,
            potential: p.potential,
            nationality: p.nationality,
            imageUrl: p.imageUrl,
            pace: p.pace,
            shooting: p.shooting,
            passing: p.passing,
            dribbling: p.dribbling,
            defending: p.defending,
            physic: p.physic,
            teamId: fcTeam.id,
          },
          update: {
            name: p.name,
            position: p.position,
            squadRole: p.squadRole,
            jerseyNumber: p.jerseyNumber,
            overall: p.overall,
            potential: p.potential,
            nationality: p.nationality,
            imageUrl: p.imageUrl,
            pace: p.pace,
            shooting: p.shooting,
            passing: p.passing,
            dribbling: p.dribbling,
            defending: p.defending,
            physic: p.physic,
            teamId: fcTeam.id,
          },
        });
      }

      console.log(`✓ ${nation.nameEs} — ${players.length} jugadores (OVR ${team.overall})`);
    } catch (err) {
      console.log(
        `✗ ${nation.nameEs} — ${err instanceof Error ? err.message : "error"}`
      );
    }
  }

  console.log("\n✅ Importación CSV completada");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
