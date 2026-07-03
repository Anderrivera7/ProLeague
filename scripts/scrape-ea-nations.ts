import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { FC26_WORLD_CUP_NATIONS } from "../src/lib/fc-data/national-teams";
import { importNationalTeamFromCsv } from "../src/lib/fc-data/csv-importer";
import {
  fetchAllEaPlayersByNationality,
  eaDropToScraped,
} from "../src/lib/fc-data/ea-drop-scraper";
import { getNationalSquadTemplate } from "../src/lib/fc-data/squad-rosters";
import { normalizePlayerSearch } from "../src/lib/fc-data/ea-drop-scraper";
import { eaIdFromNationality } from "../src/lib/fc-data/national-teams";
import type { ScrapedPlayerData } from "../src/lib/fc-data/types";

const prisma = new PrismaClient();

function matchesSearch(name: string, search: string) {
  const key = normalizePlayerSearch(search);
  return normalizePlayerSearch(name).includes(key);
}

/**
 * Importa plantillas combinando:
 * 1. CSV SoFIFA (convocatoria con dorsal/posición)
 * 2. Lista curada EA FC26 (jugadores como Kanté que faltan en nation_team_id)
 * 3. API EA Drop paginada (todas las páginas por nacionalidad) como respaldo
 */
async function importNation(nationalityId: number, nationName: string) {
  const { team, players: csvPlayers } = importNationalTeamFromCsv(nationalityId);
  const template = getNationalSquadTemplate(nationalityId);
  const players: ScrapedPlayerData[] = [...csvPlayers];
  const seen = new Set(players.map((p) => p.eaId));

  if (template) {
    console.log(`  ↳ Scrapeando API EA (todas las páginas)...`);
    const eaPool = await fetchAllEaPlayersByNationality(nationalityId, {
      delayMs: 90,
    });
    console.log(`  ↳ ${eaPool.length} jugadores en API EA`);

    for (const slot of template.players) {
      const already = players.some((p) => matchesSearch(p.name, slot.search));
      if (already) continue;

      const eaMatch = eaPool
        .filter((p) => {
          const name =
            p.commonName?.trim() || `${p.firstName} ${p.lastName}`.trim();
          return matchesSearch(name, slot.search);
        })
        .sort((a, b) => b.overallRating - a.overallRating)[0];

      if (!eaMatch || seen.has(String(eaMatch.id))) continue;

      players.push(
        eaDropToScraped(eaMatch, {
          position: slot.position,
          squadRole: "SUB",
        })
      );
      seen.add(String(eaMatch.id));
      console.log(`  + Añadido desde EA: ${eaMatch.commonName || eaMatch.lastName}`);
    }
  }

  const league = await prisma.fcLeague.upsert({
    where: { fifaIndexId: "intl" },
    create: {
      fifaIndexId: "intl",
      name: "Selecciones Nacionales FC26",
      country: "Internacional",
    },
    update: {},
  });

  const eaId = eaIdFromNationality(nationalityId);
  const fcTeam = await prisma.fcTeam.upsert({
    where: { fifaIndexId: eaId },
    create: {
      fifaIndexId: eaId,
      name: team.name,
      shortName: team.shortName,
      country: team.country,
      overall: team.overall,
      attack: team.attack,
      midfield: team.midfield,
      defense: team.defense,
      leagueId: league.id,
      syncedAt: new Date(),
    },
    update: {
      overall: team.overall,
      attack: team.attack,
      midfield: team.midfield,
      defense: team.defense,
      syncedAt: new Date(),
    },
  });

  await prisma.fcPlayer.deleteMany({ where: { teamId: fcTeam.id } });

  for (const p of players.slice(0, 26)) {
    await prisma.fcPlayer.create({
      data: {
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
    });
  }

  console.log(`✓ ${nationName} — ${players.length} jugadores (OVR ${team.overall})`);
}

async function main() {
  console.log(
    `Scrapeando ${FC26_WORLD_CUP_NATIONS.length} selecciones (CSV + EA API paginada)...\n`
  );

  for (const nation of FC26_WORLD_CUP_NATIONS) {
    try {
      await importNation(nation.nationalityId, nation.nameEs);
    } catch (err) {
      console.log(
        `✗ ${nation.nameEs} — ${err instanceof Error ? err.message : "error"}`
      );
    }
  }

  console.log("\n✅ Scrape EA + CSV completado");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
