/**
 * FIFA Index Scraper — ligas, equipos, stats y jugadores
 * Fuente: https://www.fifaindex.com (sin API pública, protegido por Cloudflare)
 *
 * Si devuelve 0 resultados, usa primero: npm run seed:fc-teams
 *
 * Uso:
 *   npm run scrape:fifa-index
 *   npm run scrape:fifa-index -- --teams-only
 *   npm run scrape:fifa-index -- --limit=50
 */

import "dotenv/config";
import puppeteer, { type Browser, type Page } from "puppeteer";
import { PrismaClient } from "@prisma/client";
import { writeFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();
const FIFA_INDEX_BASE = "https://www.fifaindex.com";
const DELAY_MS = 1500;

interface ScrapedLeague {
  fifaIndexId: string;
  name: string;
  country?: string;
}

interface ScrapedTeam {
  fifaIndexId: string;
  name: string;
  shortName?: string;
  country?: string;
  crestUrl?: string;
  overall?: number;
  attack?: number;
  midfield?: number;
  defense?: number;
  leagueFifaIndexId?: string;
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

async function setupPage(page: Page) {
  await page.setViewport({ width: 1366, height: 900 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );
  await page.setExtraHTTPHeaders({
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
  });
}

async function loadPage(page: Page, url: string, debug = false) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await delay(3000);

  const blocked = await page.evaluate(() => {
    const text = document.body?.innerText ?? "";
    return (
      text.includes("Just a moment") ||
      text.includes("Enable JavaScript") ||
      document.title.includes("Just a moment")
    );
  });

  if (blocked) {
    console.warn("⚠️ Cloudflare bloqueó la página. Esperando 8s más...");
    await delay(8000);
  }

  if (debug) {
    const html = await page.content();
    writeFileSync(join(process.cwd(), "scrape-debug.html"), html);
    console.log("📝 HTML guardado en scrape-debug.html");
  }
}

async function scrapeLeagues(page: Page): Promise<ScrapedLeague[]> {
  console.log("📋 Scrapeando ligas...");
  await loadPage(page, `${FIFA_INDEX_BASE}/leagues/`);

  const leagues = await page.evaluate(() => {
    const results: ScrapedLeague[] = [];
    const seen = new Set<string>();

    document.querySelectorAll("a[href*='/league/']").forEach((a) => {
      const href = a.getAttribute("href") ?? "";
      const idMatch = href.match(/\/league\/(\d+)/);
      if (!idMatch || seen.has(idMatch[1])) return;
      seen.add(idMatch[1]);
      const name = a.textContent?.trim();
      if (name && name.length > 1) {
        results.push({ fifaIndexId: idMatch[1], name });
      }
    });

    return results;
  });

  console.log(`✅ ${leagues.length} ligas encontradas`);
  return leagues;
}

async function scrapeTeamsGlobal(page: Page): Promise<ScrapedTeam[]> {
  console.log("📋 Scrapeando equipos (lista global)...");
  const teams: ScrapedTeam[] = [];
  let pageNum = 1;

  while (pageNum <= 10) {
    const url =
      pageNum === 1
        ? `${FIFA_INDEX_BASE}/teams/`
        : `${FIFA_INDEX_BASE}/teams/?page=${pageNum}`;

    await loadPage(page, url, pageNum === 1);

    const batch = await page.evaluate(() => {
      const results: ScrapedTeam[] = [];
      const seen = new Set<string>();

      document.querySelectorAll("a[href*='/team/']").forEach((a) => {
        const href = a.getAttribute("href") ?? "";
        const idMatch = href.match(/\/team\/(\d+)/);
        if (!idMatch || seen.has(idMatch[1])) return;
        seen.add(idMatch[1]);

        const row = a.closest("tr");
        const overallEl = row?.querySelector(".rating, td.rating");
        const imgEl = row?.querySelector("img") as HTMLImageElement | null;

        results.push({
          fifaIndexId: idMatch[1],
          name: a.textContent?.trim() ?? "",
          overall: overallEl
            ? parseInt(overallEl.textContent?.replace(/\D/g, "") ?? "0", 10) || undefined
            : undefined,
          crestUrl: imgEl?.src,
        });
      });

      return results;
    });

    if (batch.length === 0) break;
    teams.push(...batch);
    console.log(`   página ${pageNum}: +${batch.length} equipos`);
    pageNum++;
    await delay(800);
  }

  console.log(`✅ ${teams.length} equipos en lista global`);
  return teams;
}

async function scrapeTeamsFromLeague(
  page: Page,
  leagueFifaIndexId: string
): Promise<ScrapedTeam[]> {
  const teams: ScrapedTeam[] = [];
  let pageNum = 1;

  while (pageNum <= 5) {
    const url =
      pageNum === 1
        ? `${FIFA_INDEX_BASE}/league/${leagueFifaIndexId}/`
        : `${FIFA_INDEX_BASE}/league/${leagueFifaIndexId}/?page=${pageNum}`;

    await loadPage(page, url);

    const batch = await page.evaluate((leagueId) => {
      const results: ScrapedTeam[] = [];
      const seen = new Set<string>();

      document.querySelectorAll("a[href*='/team/']").forEach((a) => {
        const href = a.getAttribute("href") ?? "";
        const idMatch = href.match(/\/team\/(\d+)/);
        if (!idMatch || seen.has(idMatch[1])) return;
        seen.add(idMatch[1]);

        const row = a.closest("tr");
        const overallEl = row?.querySelector(".rating, td.rating");
        const imgEl = row?.querySelector("img") as HTMLImageElement | null;

        results.push({
          fifaIndexId: idMatch[1],
          name: a.textContent?.trim() ?? "",
          overall: overallEl
            ? parseInt(overallEl.textContent?.replace(/\D/g, "") ?? "0", 10) || undefined
            : undefined,
          crestUrl: imgEl?.src,
          leagueFifaIndexId: leagueId,
        });
      });

      return results;
    }, leagueFifaIndexId);

    if (batch.length === 0) break;
    teams.push(...batch);
    pageNum++;
    await delay(800);
  }

  return teams;
}

async function scrapeTeamStats(
  page: Page,
  teamFifaIndexId: string
): Promise<Pick<ScrapedTeam, "attack" | "midfield" | "defense" | "overall">> {
  try {
    await loadPage(page, `${FIFA_INDEX_BASE}/team/${teamFifaIndexId}/`);

    return await page.evaluate(() => {
      const parseNum = (text?: string | null) => {
        const n = parseInt(text?.replace(/\D/g, "") ?? "", 10);
        return Number.isNaN(n) ? undefined : n;
      };

      const overallEl = document.querySelector(".rating, .overall, td.rating");
      const overall = parseNum(overallEl?.textContent) ?? 75;

      let attack: number | undefined;
      let midfield: number | undefined;
      let defense: number | undefined;

      document.querySelectorAll("tr, li, .stat").forEach((el) => {
        const text = el.textContent?.toLowerCase() ?? "";
        const val = parseNum(
          el.querySelector(".rating, .value, td:last-child, span:last-child")
            ?.textContent
        );
        if (!val) return;
        if (text.includes("attack") || text.includes("ataque")) attack = val;
        if (text.includes("midfield") || text.includes("medio")) midfield = val;
        if (text.includes("defen")) defense = val;
      });

      return {
        overall,
        attack: attack ?? Math.min(99, overall + 2),
        midfield: midfield ?? overall,
        defense: defense ?? Math.max(50, overall - 2),
      };
    });
  } catch {
    return { overall: 75, attack: 77, midfield: 75, defense: 73 };
  }
}

async function scrapePlayersForTeam(
  page: Page,
  teamFifaIndexId: string
): Promise<ScrapedPlayer[]> {
  const players: ScrapedPlayer[] = [];
  try {
    await loadPage(page, `${FIFA_INDEX_BASE}/team/${teamFifaIndexId}/`);

    const playerData = await page.evaluate((teamId) => {
      const results: ScrapedPlayer[] = [];
      document.querySelectorAll("a[href*='/player/']").forEach((a) => {
        const href = a.getAttribute("href") ?? "";
        const idMatch = href.match(/\/player\/(\d+)/);
        if (!idMatch) return;

        const row = a.closest("tr");
        const posEl = row?.querySelector(".position, td.position");
        const overallEl = row?.querySelector(".rating, td.rating");
        const potentialEl = row?.querySelector(".potential, td.potential");
        const imgEl = row?.querySelector("img") as HTMLImageElement | null;

        results.push({
          fifaIndexId: idMatch[1],
          name: a.textContent?.trim() ?? "",
          position: posEl?.textContent?.trim(),
          overall: overallEl
            ? parseInt(overallEl.textContent?.replace(/\D/g, "") ?? "0", 10) || undefined
            : undefined,
          potential: potentialEl
            ? parseInt(potentialEl.textContent?.replace(/\D/g, "") ?? "0", 10) || undefined
            : undefined,
          imageUrl: imgEl?.src,
          teamFifaIndexId: teamId,
        });
      });
      return results;
    }, teamFifaIndexId);

    players.push(...playerData);
  } catch (error) {
    console.warn(`⚠️ Jugadores equipo ${teamFifaIndexId}:`, error);
  }
  return players;
}

async function persistLeagues(leagues: ScrapedLeague[]) {
  const map = new Map<string, string>();
  for (const league of leagues) {
    const row = await prisma.fcLeague.upsert({
      where: { fifaIndexId: league.fifaIndexId },
      create: league,
      update: { name: league.name, country: league.country },
    });
    map.set(league.fifaIndexId, row.id);
  }
  return map;
}

async function persistTeams(
  teams: ScrapedTeam[],
  leagueIdMap: Map<string, string>
) {
  for (const team of teams) {
    const leagueId = team.leagueFifaIndexId
      ? leagueIdMap.get(team.leagueFifaIndexId)
      : undefined;

    await prisma.fcTeam.upsert({
      where: { fifaIndexId: team.fifaIndexId },
      create: {
        fifaIndexId: team.fifaIndexId,
        name: team.name,
        shortName: team.shortName,
        country: team.country,
        crestUrl: team.crestUrl,
        overall: team.overall,
        attack: team.attack,
        midfield: team.midfield,
        defense: team.defense,
        leagueId,
      },
      update: {
        name: team.name,
        crestUrl: team.crestUrl,
        overall: team.overall,
        attack: team.attack,
        midfield: team.midfield,
        defense: team.defense,
        leagueId,
      },
    });
  }
  console.log(`💾 ${teams.length} equipos guardados`);
}

async function persistPlayers(players: ScrapedPlayer[]) {
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
        imageUrl: player.imageUrl,
        teamId,
      },
    });
  }
  console.log(`💾 ${players.length} jugadores guardados`);
}

async function main() {
  const args = process.argv.slice(2);
  const teamsOnly = args.includes("--teams-only");
  const debug = args.includes("--debug");
  const limitArg = args.find((a) => a.startsWith("--limit="));
  const leagueArg = args.find((a) => a.startsWith("--league="));
  const teamLimit = limitArg ? parseInt(limitArg.split("=")[1], 10) : 30;

  let browser: Browser | null = null;

  try {
    console.log("🚀 FIFA Index Scraper");
    browser = await puppeteer.launch({
      headless: !debug,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
    });
    const page = await browser.newPage();
    await setupPage(page);

    if (debug) await loadPage(page, `${FIFA_INDEX_BASE}/teams/`, true);

    let leagues = await scrapeLeagues(page);
    const leagueIdMap = await persistLeagues(leagues);

    let allTeams: ScrapedTeam[] = [];

    if (leagueArg) {
      const filter = leagueArg.split("=")[1].toLowerCase();
      leagues = leagues.filter((l) => l.name.toLowerCase().includes(filter));
    }

    if (leagues.length > 0) {
      for (const league of leagues.slice(0, 15)) {
        console.log(`🏟️ ${league.name}...`);
        const teams = await scrapeTeamsFromLeague(page, league.fifaIndexId);
        allTeams.push(...teams);
        await delay(DELAY_MS);
      }
    }

    if (allTeams.length === 0) {
      console.log("↪️ Fallback: lista global de equipos...");
      allTeams = await scrapeTeamsGlobal(page);
    }

    if (allTeams.length === 0) {
      console.error(
        "\n❌ No se obtuvieron datos. FIFA Index puede estar bloqueando el bot."
      );
      console.error("   Usa el seed local: npm run seed:fc-teams");
      console.error("   O prueba con: npm run scrape:fifa-index -- --debug\n");
      process.exit(1);
    }

    const uniqueTeams = Array.from(
      new Map(allTeams.map((t) => [t.fifaIndexId, t])).values()
    );

    console.log(`📊 Obteniendo stats de ${Math.min(uniqueTeams.length, teamLimit)} equipos...`);
    for (const team of uniqueTeams.slice(0, teamLimit)) {
      const stats = await scrapeTeamStats(page, team.fifaIndexId);
      team.overall = stats.overall ?? team.overall;
      team.attack = stats.attack;
      team.midfield = stats.midfield;
      team.defense = stats.defense;
      await delay(500);
    }

    await persistTeams(uniqueTeams, leagueIdMap);

    if (!teamsOnly) {
      const allPlayers: ScrapedPlayer[] = [];
      for (const team of uniqueTeams.slice(0, teamLimit)) {
        console.log(`👤 ${team.name}`);
        const players = await scrapePlayersForTeam(page, team.fifaIndexId);
        allPlayers.push(...players);
        await delay(DELAY_MS);
      }
      await persistPlayers(allPlayers);
    }

    console.log("🎉 Scraping completado");
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await browser?.close();
    await prisma.$disconnect();
  }
}

main();
