import type { ScrapedPlayerData } from "./types";

const EA_DROP_API = "https://drop-api.ea.com/rating/ea-sports-fc";

export interface EaDropPlayer {
  id: number;
  overallRating: number;
  firstName: string;
  lastName: string;
  commonName: string | null;
  avatarUrl?: string;
  nationality?: { id: number; label: string; imageUrl?: string };
  gender?: { label: string };
  position?: { shortLabel: string };
  stats?: {
    pac?: { value: number };
    sho?: { value: number };
    pas?: { value: number };
    dri?: { value: number };
    def?: { value: number };
    phy?: { value: number };
  };
}

function playerName(p: EaDropPlayer) {
  return p.commonName?.trim() || `${p.firstName} ${p.lastName}`.trim();
}

function isMensPlayer(p: EaDropPlayer) {
  const g = p.gender?.label?.toLowerCase() ?? "";
  return g.includes("men") || g === "";
}

export function normalizePlayerSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function eaDropToScraped(
  p: EaDropPlayer,
  extras?: Partial<ScrapedPlayerData>
): ScrapedPlayerData {
  return {
    eaId: String(p.id),
    name: playerName(p),
    position: extras?.position ?? p.position?.shortLabel,
    squadRole: extras?.squadRole,
    jerseyNumber: extras?.jerseyNumber,
    overall: p.overallRating,
    potential: p.overallRating,
    nationality: p.nationality?.label,
    imageUrl: p.avatarUrl,
    pace: p.stats?.pac?.value,
    shooting: p.stats?.sho?.value,
    passing: p.stats?.pas?.value,
    dribbling: p.stats?.dri?.value,
    defending: p.stats?.def?.value,
    physic: p.stats?.phy?.value,
  };
}

async function fetchEaPage(
  nationalityId: number,
  offset: number
): Promise<{ items: EaDropPlayer[]; totalItems: number }> {
  const params = new URLSearchParams({
    limit: "100",
    offset: String(offset),
    nationality: String(nationalityId),
    locale: "en",
  });

  const res = await fetch(`${EA_DROP_API}?${params}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`EA Drop API respondió ${res.status} (nacionalidad ${nationalityId})`);
  }

  return res.json();
}

/**
 * Recorre TODAS las páginas de la API oficial EA para una nacionalidad.
 */
export async function fetchAllEaPlayersByNationality(
  nationalityId: number,
  options?: { delayMs?: number }
): Promise<EaDropPlayer[]> {
  const delayMs = options?.delayMs ?? 100;
  const all: EaDropPlayer[] = [];
  let offset = 0;
  let total = 0;

  do {
    const data = await fetchEaPage(nationalityId, offset);
    total = data.totalItems;

    for (const p of data.items ?? []) {
      if (isMensPlayer(p)) all.push(p);
    }

    offset += 100;
    if (offset < total) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  } while (offset < total);

  return all;
}

export async function lookupEaPlayerBySearch(
  nationalityId: number,
  search: string
): Promise<ScrapedPlayerData | null> {
  const key = normalizePlayerSearch(search);
  const players = await fetchAllEaPlayersByNationality(nationalityId, { delayMs: 80 });

  const match = players
    .filter((p) => {
      const full = normalizePlayerSearch(playerName(p));
      const last = normalizePlayerSearch(p.lastName);
      return full.includes(key) || last.includes(key);
    })
    .sort((a, b) => b.overallRating - a.overallRating)[0];

  return match ? eaDropToScraped(match) : null;
}
