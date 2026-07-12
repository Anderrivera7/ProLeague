import type { ScrapedPlayerData } from "./types";
import {
  getNationalSquadTemplate,
  type SquadPlayerTemplate,
} from "./squad-rosters";
import { finalizeScrapedNationalSquad } from "./squad-enricher";

const EA_DROP_API = "https://drop-api.ea.com/rating/ea-sports-fc";

export interface EaPlayer {
  id: number;
  overallRating: number;
  firstName: string;
  lastName: string;
  commonName: string | null;
  avatarUrl?: string;
  nationality?: { id: number; label: string; imageUrl?: string };
  gender?: { label: string };
  position?: { shortLabel: string; positionType?: { name: string } };
}

const ATTACK_POS = new Set(["ST", "LW", "RW", "CF", "CAM"]);
const MID_POS = new Set(["CM", "CDM", "LM", "RM"]);
const DEF_POS = new Set(["CB", "LB", "RB", "GK", "LWB", "RWB"]);

function playerName(p: EaPlayer) {
  return p.commonName?.trim() || `${p.firstName} ${p.lastName}`.trim();
}

function isMensPlayer(p: EaPlayer) {
  const g = p.gender?.label?.toLowerCase() ?? "";
  return g.includes("men") || g === "";
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toScrapedPlayer(
  p: EaPlayer,
  position?: string,
  squadRole?: string
): ScrapedPlayerData {
  const role = squadRole ?? position ?? p.position?.shortLabel;
  return {
    eaId: String(p.id),
    name: playerName(p),
    position: position ?? p.position?.shortLabel,
    squadRole: role,
    overall: p.overallRating,
    potential: p.overallRating,
    nationality: p.nationality?.label,
    imageUrl: p.avatarUrl,
  };
}

async function fetchEaPage(nationalityId: number, offset: number, search?: string) {
  const params = new URLSearchParams({
    limit: "100",
    offset: String(offset),
    nationality: String(nationalityId),
    locale: "en",
  });
  if (search) params.set("search", search);

  const res = await fetch(`${EA_DROP_API}?${params}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`EA Drop API respondió ${res.status}`);
  }

  return res.json() as Promise<{ items: EaPlayer[]; totalItems: number }>;
}

/** Busca un jugador concreto de la plantilla (no cualquier francés top OVR) */
export async function lookupSquadPlayer(
  nationalityId: number,
  template: SquadPlayerTemplate
): Promise<ScrapedPlayerData | null> {
  const searchKey = normalizeText(template.search);
  const data = await fetchEaPage(nationalityId, 0, template.search);

  const candidates = (data.items ?? [])
    .filter(isMensPlayer)
    .filter((p) => {
      const full = normalizeText(playerName(p));
      const last = normalizeText(p.lastName);
      return full.includes(searchKey) || last.includes(searchKey);
    })
    .sort((a, b) => b.overallRating - a.overallRating);

  if (candidates.length === 0) return null;

  // Evitar confundir Lucas Hernández con Theo cuando buscamos solo "Hernández" en defensa
  if (searchKey === "hernandez" && template.position === "LB") {
    const theo = candidates.find((p) =>
      normalizeText(playerName(p)).includes("theo")
    );
    if (theo) return toScrapedPlayer(theo, template.position, template.position);
  }

  return toScrapedPlayer(candidates[0], template.position, template.position);
}

/**
 * Plantilla real de selección (curada) + ratings EA.
 * Si no hay plantilla curada, fallback a top jugadores por nacionalidad.
 */
export async function fetchNationalTeamSquad(
  nationalityId: number
): Promise<{ players: ScrapedPlayerData[]; crestUrl?: string; curated: boolean }> {
  const template = getNationalSquadTemplate(nationalityId);

  if (template) {
    const players: ScrapedPlayerData[] = [];
    const seen = new Set<string>();
    let crestUrl: string | undefined;

    for (const slot of template.players) {
      const player = await lookupSquadPlayer(nationalityId, slot);
      if (!player || seen.has(player.eaId)) continue;
      seen.add(player.eaId);
      players.push(player);
      await new Promise((r) => setTimeout(r, 80));
    }

    if (players.length > 0) {
      const finalized = finalizeScrapedNationalSquad(nationalityId, players);
      const page = await fetchEaPage(nationalityId, 0);
      crestUrl = page.items?.[0]?.nationality?.imageUrl;
      return { players: finalized, crestUrl, curated: true };
    }
  }

  const fallback = await fetchPlayersByNationality(nationalityId, 26);
  return { ...fallback, curated: false };
}

export async function fetchPlayersByNationality(
  nationalityId: number,
  maxPlayers = 26
): Promise<{ players: ScrapedPlayerData[]; crestUrl?: string }> {
  const all: EaPlayer[] = [];
  let offset = 0;
  let total = 0;
  let crestUrl: string | undefined;

  while (offset < total || total === 0) {
    const data = await fetchEaPage(nationalityId, offset);
    total = data.totalItems;

    for (const p of data.items ?? []) {
      if (!isMensPlayer(p)) continue;
      all.push(p);
      if (!crestUrl && p.nationality?.imageUrl) {
        crestUrl = p.nationality.imageUrl;
      }
    }

    offset += 100;
    if (offset >= total || all.length >= maxPlayers * 3) break;
    await new Promise((r) => setTimeout(r, 120));
  }

  const sorted = all.sort((a, b) => b.overallRating - a.overallRating).slice(0, maxPlayers);
  return {
    players: sorted.map((p) => toScrapedPlayer(p)),
    crestUrl,
  };
}

export function computeTeamStats(players: ScrapedPlayerData[]) {
  if (players.length === 0) {
    return { overall: 70, attack: 70, midfield: 70, defense: 70 };
  }

  const top11 = players.slice(0, 11);
  const avg = (list: ScrapedPlayerData[]) =>
    list.length
      ? Math.round(list.reduce((s, p) => s + (p.overall ?? 0), 0) / list.length)
      : undefined;

  const attackers = players.filter((p) => p.position && ATTACK_POS.has(p.position));
  const midfielders = players.filter((p) => p.position && MID_POS.has(p.position));
  const defenders = players.filter((p) => p.position && DEF_POS.has(p.position));

  const overall = avg(top11) ?? players[0].overall ?? 70;

  return {
    overall,
    attack: avg(attackers.slice(0, 6)) ?? overall,
    midfield: avg(midfielders.slice(0, 6)) ?? overall,
    defense: avg(defenders.slice(0, 6)) ?? overall,
  };
}

export async function searchEaPlayersByName(query: string, limit = 10) {
  const url = `${EA_DROP_API}?limit=${limit}&offset=0&search=${encodeURIComponent(query)}&locale=en`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const data = (await res.json()) as { items: EaPlayer[] };
  return (data.items ?? []).filter(isMensPlayer);
}
