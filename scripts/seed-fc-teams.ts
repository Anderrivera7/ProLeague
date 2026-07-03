import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { generateJoinCode } from "../src/utils/join-code";
import { FC26_WORLD_CUP_NATIONS } from "../src/lib/fc-data/national-teams";
import {
  computeTeamStats,
  fetchNationalTeamSquad,
} from "../src/lib/fc-data/ea-drop-client";
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

  console.log(`Importando ${FC26_WORLD_CUP_NATIONS.length} selecciones licenciadas de FC26 desde API EA...\n`);

  for (const nation of FC26_WORLD_CUP_NATIONS) {
    const eaId = eaIdFromNationality(nation.nationalityId);
    let overall = 75;
    let attack = 75;
    let midfield = 75;
    let defense = 75;
    let crestUrl: string | undefined;

    try {
      const { players, crestUrl: flag } = await fetchNationalTeamSquad(
        nation.nationalityId
      );
      const stats = computeTeamStats(players);
      overall = stats.overall;
      attack = stats.attack;
      midfield = stats.midfield;
      defense = stats.defense;
      crestUrl = flag;
      console.log(`✓ ${nation.nameEs} — OVR ${overall} (${players.length} jugadores)`);
    } catch {
      console.log(`○ ${nation.nameEs} — stats por defecto (sin jugadores en API)`);
    }

    const team = await prisma.fcTeam.upsert({
      where: { fifaIndexId: eaId },
      create: {
        fifaIndexId: eaId,
        name: nation.nameEs,
        shortName: nation.nameEn,
        country: nation.nameEs,
        crestUrl,
        overall,
        attack,
        midfield,
        defense,
        leagueId: league.id,
        syncedAt: new Date(),
      },
      update: {
        name: nation.nameEs,
        shortName: nation.nameEn,
        country: nation.nameEs,
        crestUrl,
        overall,
        attack,
        midfield,
        defense,
        leagueId: league.id,
      },
    });

    if (crestUrl) {
      const existing = await prisma.fcPlayer.count({ where: { teamId: team.id } });
      if (existing === 0) {
        try {
          const { players } = await fetchNationalTeamSquad(nation.nationalityId);
          for (const p of players) {
            await prisma.fcPlayer.upsert({
              where: { fifaIndexId: p.eaId },
              create: {
                fifaIndexId: p.eaId,
                name: p.name,
                position: p.position,
                overall: p.overall,
                potential: p.potential,
                nationality: p.nationality,
                imageUrl: p.imageUrl,
                teamId: team.id,
              },
              update: {
                name: p.name,
                position: p.position,
                overall: p.overall,
                teamId: team.id,
              },
            });
          }
        } catch {
          // jugadores se cargan en lazy sync
        }
      }
    }

    await new Promise((r) => setTimeout(r, 200));
  }

  await prisma.fcTeam.deleteMany({
    where: {
      leagueId: league.id,
      fifaIndexId: {
        notIn: FC26_WORLD_CUP_NATIONS.map((nation) =>
          eaIdFromNationality(nation.nationalityId)
        ),
      },
    },
  });

  const tournaments = await prisma.tournament.findMany({
    where: { joinCode: null },
  });

  for (const t of tournaments) {
    let code = generateJoinCode();
    let exists = await prisma.tournament.findUnique({ where: { joinCode: code } });
    while (exists) {
      code = generateJoinCode();
      exists = await prisma.tournament.findUnique({ where: { joinCode: code } });
    }
    await prisma.tournament.update({
      where: { id: t.id },
      data: { joinCode: code },
    });
  }

  console.log(`\n✅ FC26: ${FC26_WORLD_CUP_NATIONS.length} selecciones licenciadas listas`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
