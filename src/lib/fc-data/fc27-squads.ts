import { existsSync, readFileSync } from "fs";
import path from "path";
import { parseCsvLine } from "./csv-parser";
import { getEaPlayerPortraitUrl } from "./player-image";
import { isClubEaId } from "./club-ids";
import { getCatalogNation } from "./national-teams";
import type { ScrapedPlayerData } from "./types";

type RawPlayer = {
  id: string;
  name: string;
  position: string;
  overall: number;
  nationality: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
};

const SQUAD_SIZE = 26;
const XI = ["GK", "LB", "LCB", "RCB", "RB", "LCM", "CDM", "RCM", "LW", "ST", "RW"] as const;

const CLUB_ALIAS: Record<string, string> = {
  "atletico madrid": "atletico de madrid",
  "atletico": "atletico de madrid",
  inter: "lombardia",
  internazionale: "lombardia",
  "internazionale milano": "lombardia",
  milan: "milano",
  atalanta: "bergamo calcio",
  monza: "brianza calcio",
  psg: "paris sg",
  "paris saint germain": "paris sg",
  "paris sg": "paris sg",
  "bayern munich": "bayern munchen",
  "bayern": "bayern munchen",
  "fc bayern munchen": "bayern munchen",
  "man utd": "manchester united",
  "man united": "manchester united",
  "sporting lisbon": "sporting cp",
  "sporting clube de portugal": "sporting cp",
  "borussia dortmund": "borussia dortmund",
  "real madrid": "real madrid",
  "fc barcelona": "barcelona",
  barcelona: "barcelona",
};

function norm(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/\b(fc|cf|ac|sc|rc|afc|jk|sk|if|fk|bk)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function clubKey(name: string) {
  const key = norm(name);
  return CLUB_ALIAS[key] ?? key;
}

function lineOf(position: string) {
  const pos = position.toUpperCase();
  if (pos === "GK") return "gk";
  if (["CB", "LB", "RB", "LWB", "RWB"].includes(pos)) return "def";
  if (["ST", "CF", "LW", "RW", "LF", "RF"].includes(pos)) return "att";
  return "mid";
}

let clubs: Map<string, RawPlayer[]> | null = null;
let nations: Map<string, RawPlayer[]> | null = null;

function resolveCsvPath() {
  if (process.env.FC27_CSV_PATH && existsSync(process.env.FC27_CSV_PATH)) {
    return process.env.FC27_CSV_PATH;
  }
  const local = path.join(process.cwd(), "data", "fc27-players.csv");
  return existsSync(local) ? local : null;
}

export function fc27CsvAvailable() {
  return resolveCsvPath() != null;
}

function loadIndexes() {
  if (clubs && nations) return;
  clubs = new Map();
  nations = new Map();
  const csvPath = resolveCsvPath();
  if (!csvPath) return;

  const lines = readFileSync(csvPath, "utf8").split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return;
  const header = parseCsvLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);
  const col = {
    id: idx("player_id"),
    common: idx("common_name"),
    first: idx("first_name"),
    last: idx("last_name"),
    overall: idx("overall_rating"),
    position: idx("position"),
    club: idx("club"),
    nationality: idx("nationality"),
    gender: idx("gender"),
    pace: idx("pace"),
    shooting: idx("shooting"),
    passing: idx("passing"),
    dribbling: idx("dribbling"),
    defending: idx("defending"),
    physic: idx("physicality"),
  };

  const clubBuckets = new Map<string, { men: RawPlayer[]; women: RawPlayer[] }>();

  for (let i = 1; i < lines.length; i++) {
    const cells = parseCsvLine(lines[i]);
    const id = cells[col.id]?.trim();
    const club = cells[col.club]?.trim();
    if (!id || !club) continue;
    const overall = parseInt(cells[col.overall] ?? "", 10);
    if (!Number.isFinite(overall)) continue;
    const common = cells[col.common]?.trim();
    const name =
      common ||
      [cells[col.first], cells[col.last]].filter(Boolean).join(" ").trim() ||
      id;
    const player: RawPlayer = {
      id,
      name,
      position: (cells[col.position] || "CM").trim().toUpperCase(),
      overall,
      nationality: cells[col.nationality]?.trim() || "",
      pace: parseInt(cells[col.pace] ?? "", 10) || 0,
      shooting: parseInt(cells[col.shooting] ?? "", 10) || 0,
      passing: parseInt(cells[col.passing] ?? "", 10) || 0,
      dribbling: parseInt(cells[col.dribbling] ?? "", 10) || 0,
      defending: parseInt(cells[col.defending] ?? "", 10) || 0,
      physic: parseInt(cells[col.physic] ?? "", 10) || 0,
    };
    const key = clubKey(club);
    const bucket = clubBuckets.get(key) ?? { men: [], women: [] };
    const gender = cells[col.gender] ?? "";
    if (gender.startsWith("Women")) bucket.women.push(player);
    else bucket.men.push(player);
    clubBuckets.set(key, bucket);

    if (!gender.startsWith("Women") && player.nationality) {
      const nationKey = norm(player.nationality);
      const list = nations.get(nationKey) ?? [];
      list.push(player);
      nations.set(nationKey, list);
    }
  }

  for (const [key, bucket] of clubBuckets) {
    clubs.set(key, bucket.men.length > 0 ? bucket.men : bucket.women);
  }
}

function toScraped(player: RawPlayer, role: string, jersey: number): ScrapedPlayerData {
  return {
    eaId: player.id,
    name: player.name,
    position: player.position,
    squadRole: role,
    jerseyNumber: jersey,
    overall: player.overall,
    potential: player.overall,
    nationality: player.nationality,
    imageUrl: getEaPlayerPortraitUrl(player.id),
    pace: player.pace,
    shooting: player.shooting,
    passing: player.passing,
    dribbling: player.dribbling,
    defending: player.defending,
    physic: player.physic,
  };
}

function pickLine(pool: RawPlayer[], line: "gk" | "def" | "mid" | "att", count: number, used: Set<string>) {
  const picked: RawPlayer[] = [];
  for (const player of pool) {
    if (picked.length >= count) break;
    if (used.has(player.id) || lineOf(player.position) !== line) continue;
    picked.push(player);
    used.add(player.id);
  }
  return picked;
}

export function assignFc27Roles(players: RawPlayer[]): ScrapedPlayerData[] {
  const pool = [...players].sort((a, b) => b.overall - a.overall).slice(0, SQUAD_SIZE);
  const used = new Set<string>();
  const gk = pickLine(pool, "gk", 1, used);
  const def = pickLine(pool, "def", 4, used);
  const mid = pickLine(pool, "mid", 3, used);
  const att = pickLine(pool, "att", 3, used);
  const starters = [...gk, ...def, ...mid, ...att];
  for (const player of pool) {
    if (starters.length >= 11) break;
    if (used.has(player.id)) continue;
    starters.push(player);
    used.add(player.id);
  }

  const rows: ScrapedPlayerData[] = [];
  const starterIds = new Set<string>();
  starters.slice(0, 11).forEach((player, index) => {
    starterIds.add(player.id);
    rows.push(toScraped(player, XI[index] ?? player.position, index + 1));
  });
  let jersey = rows.length + 1;
  for (const player of pool) {
    if (starterIds.has(player.id)) continue;
    rows.push(toScraped(player, "SUB", jersey));
    jersey += 1;
  }
  return rows;
}

function lookupClub(name: string) {
  if (!clubs) return undefined;
  const key = clubKey(name);
  const exact = clubs.get(key);
  if (exact && exact.length > 0) return exact;

  let best: string | null = null;
  let tied = false;
  for (const candidate of clubs.keys()) {
    if (candidate.length < 6 || key.length < 6) continue;
    const close = key.includes(candidate) || candidate.includes(key);
    if (!close) continue;
    if (!best || candidate.length > best.length) {
      best = candidate;
      tied = false;
    } else if (candidate.length === best.length && candidate !== best) {
      tied = true;
    }
  }
  if (!best || tied) return undefined;
  return clubs.get(best);
}

function nationKeys(fifaIndexId: string) {
  const id = parseInt(fifaIndexId, 10);
  const catalog = Number.isNaN(id) ? undefined : getCatalogNation(id);
  const keys = new Set<string>();
  if (catalog) {
    keys.add(norm(catalog.nameEn));
    keys.add(norm(catalog.nameEs));
  }
  const extra: Record<string, string[]> = {
    "34": ["holland", "netherlands"],
    "95": ["united states", "usa"],
    "14": ["england"],
    "21": ["germany"],
    "45": ["spain"],
    "27": ["italy"],
    "18": ["france"],
    "38": ["portugal"],
    "52": ["argentina"],
    "83": ["mexico"],
    "12": ["czech republic", "czechia"],
    "10": ["croatia"],
    "36": ["norway"],
    "37": ["poland"],
    "46": ["sweden"],
    "50": ["wales"],
    "42": ["scotland"],
    "25": ["republic of ireland", "ireland"],
    "35": ["northern ireland"],
    "129": ["morocco"],
    "117": ["ghana"],
    "182": ["qatar"],
    "39": ["romania"],
    "49": ["ukraine"],
    "23": ["hungary"],
    "24": ["iceland"],
    "17": ["finland"],
    "13": ["denmark"],
  };
  for (const name of extra[fifaIndexId] ?? []) keys.add(name);
  return [...keys];
}

export function buildFc27Squad(team: {
  name: string;
  fifaIndexId: string;
}): ScrapedPlayerData[] | null {
  if (!fc27CsvAvailable()) return null;
  loadIndexes();
  if (!clubs || !nations) return null;

  if (isClubEaId(team.fifaIndexId)) {
    const rows = lookupClub(team.name);
    if (!rows || rows.length === 0) return null;
    return assignFc27Roles(rows);
  }

  for (const key of nationKeys(team.fifaIndexId)) {
    const rows = nations.get(key);
    if (rows && rows.length > 0) return assignFc27Roles(rows);
  }
  const byName = nations.get(norm(team.name));
  if (byName && byName.length > 0) return assignFc27Roles(byName);
  return null;
}
