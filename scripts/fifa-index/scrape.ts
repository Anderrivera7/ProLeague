/**
 * FIFA Index Scraper
 *
 * Extrae equipos, jugadores, ratings y escudos desde FIFA Index
 * y los persiste en Supabase vía Prisma.
 *
 * NUNCA ejecutar desde el frontend — solo scripts de servidor.
 *
 * Uso:
 *   npm run scrape:fifa-index
 *   npm run scrape:fifa-index -- --teams-only
 *   npm run scrape:fifa-index -- --players-only
 */

import puppeteer, { type Browser, type Page } from "puppeteer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FIFA_INDEX_BASE = "https://www.fifaindex.com";
const DELAY_MS = 1500;

interface ScrapedTeam {
  fifaIndexId: string;
  name: string;
  shortName?: string;
  country?: string;
  crestUrl?: string;
  overall?: number;
  leagueName?: string;
}

interface ScrapedPlayer {
  fifaIndexId: string;
  name: string;
  position?: string;
  overall?: number;
  potential?: number;
  nationality?: string;
  imageUrl?: string;
  teamFifaIndexId?: string;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeTeams(page: Page): Promise<ScrapedTeam[]> {
  console.log("📋 Scrapeando equipos desde FIFA Index...");
  const teams: ScrapedTeam[] = [];

  await page.goto(`${FIFA_INDEX_BASE}/teams/`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  const teamData = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tbody tr");
    const results: {
      fifaIndexId: string;
      name: string;
      overall?: number;
      leagueName?: string;
      crestUrl?: string;
    }[] = [];

    rows.forEach((row) => {
      const link = row.querySelector("a[href*='/team/']") as HTMLAnchorElement;
      const nameEl = row.querySelector("td a");
      const overallEl = row.querySelector("td.rating");
      const imgEl = row.querySelector("img") as HTMLImageElement;

      if (!link || !nameEl) return;

      const href = link.getAttribute("href") ?? "";
      const idMatch = href.match(/\/(\d+)\//);
      if (!idMatch) return;

      results.push({
        fifaIndexId: idMatch[1],
        name: nameEl.textContent?.trim() ?? "",
        overall: overallEl
          ? parseInt(overallEl.textContent?.trim() ?? "0", 10)
          : undefined,
        crestUrl: imgEl?.src,
      });
    });

    return results;
  });

  teams.push(...teamData);
  console.log(`✅ ${teams.length} equipos encontrados`);
  return teams;
}

async function scrapePlayersForTeam(
  page: Page,
  teamFifaIndexId: string
): Promise<ScrapedPlayer[]> {
  const players: ScrapedPlayer[] = [];

  try {
    await page.goto(`${FIFA_INDEX_BASE}/team/${teamFifaIndexId}/`, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    const playerData = await page.evaluate((teamId) => {
      const rows = document.querySelectorAll("table tbody tr");
      const results: ScrapedPlayer[] = [];

      rows.forEach((row) => {
        const link = row.querySelector("a[href*='/player/']") as HTMLAnchorElement;
        const nameEl = row.querySelector("td a");
        const posEl = row.querySelector("td.position");
        const overallEl = row.querySelector("td.rating");
        const potentialEl = row.querySelector("td.potential");
        const imgEl = row.querySelector("img") as HTMLImageElement;

        if (!link || !nameEl) return;

        const href = link.getAttribute("href") ?? "";
        const idMatch = href.match(/\/(\d+)\//);
        if (!idMatch) return;

        results.push({
          fifaIndexId: idMatch[1],
          name: nameEl.textContent?.trim() ?? "",
          position: posEl?.textContent?.trim(),
          overall: overallEl
            ? parseInt(overallEl.textContent?.trim() ?? "0", 10)
            : undefined,
          potential: potentialEl
            ? parseInt(potentialEl.textContent?.trim() ?? "0", 10)
            : undefined,
          imageUrl: imgEl?.src,
          teamFifaIndexId: teamId,
        });
      });

      return results;
    }, teamFifaIndexId);

    players.push(...playerData);
  } catch (error) {
    console.warn(`⚠️ Error scrapeando equipo ${teamFifaIndexId}:`, error);
  }

  return players;
}

async function persistTeams(teams: ScrapedTeam[]) {
  console.log("💾 Guardando equipos en base de datos...");

  for (const team of teams) {
    await prisma.fcTeam.upsert({
      where: { fifaIndexId: team.fifaIndexId },
      create: {
        fifaIndexId: team.fifaIndexId,
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        crestUrl: team.crestUrl,
        overall: team.overall,
      },
      update: {
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        crestUrl: team.crestUrl,
        overall: team.overall,
      },
    });
  }

  console.log(`✅ ${teams.length} equipos guardados`);
}

async function persistPlayers(players: ScrapedPlayer[]) {
  console.log("💾 Guardando jugadores en base de datos...");

  for (const player of players) {
    let teamId: string | undefined;

    if (player.teamFifaIndexId) {
      const team = await prisma.fcTeam.findUnique({
        where: { fifaIndexId: player.teamFifaIndexId },
      });
      teamId = team?.id;
    }

    await prisma.fcPlayer.upsert({
      where: { fifaIndexId: player.fifaIndexId },
      create: {
        fifaIndexId: player.fifaIndexId,
        name: player.name,
        position: player.position,
        overall: player.overall,
        potential: player.potential,
        nationality: player.nationality,
        imageUrl: player.imageUrl,
        teamId,
      },
      update: {
        name: player.name,
        position: player.position,
        overall: player.overall,
        potential: player.potential,
        nationality: player.nationality,
        imageUrl: player.imageUrl,
        teamId,
      },
    });
  }

  console.log(`✅ ${players.length} jugadores guardados`);
}

async function main() {
  const args = process.argv.slice(2);
  const teamsOnly = args.includes("--teams-only");
  const playersOnly = args.includes("--players-only");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const teamLimit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 20;

  let browser: Browser | null = null;

  try {
    console.log("🚀 Iniciando FIFA Index Scraper...");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    if (!playersOnly) {
      const teams = await scrapeTeams(page);
      await persistTeams(teams);

      if (!teamsOnly) {
        const teamsToScrape = teams.slice(0, teamLimit);
        const allPlayers: ScrapedPlayer[] = [];

        for (const team of teamsToScrape) {
          console.log(`👤 Scrapeando jugadores de ${team.name}...`);
          const players = await scrapePlayersForTeam(page, team.fifaIndexId);
          allPlayers.push(...players);
          await delay(DELAY_MS);
        }

        await persistPlayers(allPlayers);
      }
    }

    console.log("🎉 Scraping completado");
  } catch (error) {
    console.error("❌ Error en scraping:", error);
    process.exit(1);
  } finally {
    await browser?.close();
    await prisma.$disconnect();
  }
}

main();
