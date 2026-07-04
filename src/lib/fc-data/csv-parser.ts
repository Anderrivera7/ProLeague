export interface Fc26CsvPlayer {
  playerId: string;
  name: string;
  shortName: string;
  positions: string;
  overall: number;
  potential: number;
  nationalityId: number;
  nationalityName: string;
  nationTeamId: string | null;
  nationPosition: string | null;
  nationJerseyNumber: number | null;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  imageUrl: string | null;
  positionRatings: Record<string, number>;
}

const POSITION_COLUMNS = [
  "ls",
  "st",
  "rs",
  "lw",
  "lf",
  "cf",
  "rf",
  "rw",
  "lam",
  "cam",
  "ram",
  "lm",
  "lcm",
  "cm",
  "rcm",
  "rm",
  "lwb",
  "ldm",
  "cdm",
  "rdm",
  "rwb",
  "lb",
  "lcb",
  "cb",
  "rcb",
  "rb",
  "gk",
] as const;

export function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

function parseRating(value: string | undefined): number | null {
  if (!value) return null;
  const base = value.split("+")[0]?.trim();
  const n = parseInt(base ?? "", 10);
  return Number.isNaN(n) ? null : n;
}

export function parseFc26Csv(content: string): Fc26CsvPlayer[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = parseCsvLine(lines[0]);
  const idx = (name: string) => header.indexOf(name);

  const col = {
    playerId: idx("player_id"),
    shortName: idx("short_name"),
    longName: idx("long_name"),
    positions: idx("player_positions"),
    overall: idx("overall"),
    potential: idx("potential"),
    nationalityId: idx("nationality_id"),
    nationalityName: idx("nationality_name"),
    nationTeamId: idx("nation_team_id"),
    nationPosition: idx("nation_position"),
    nationJerseyNumber: idx("nation_jersey_number"),
    pace: idx("pace"),
    shooting: idx("shooting"),
    passing: idx("passing"),
    dribbling: idx("dribbling"),
    defending: idx("defending"),
    physic: idx("physic"),
    imageUrl: idx("player_face_url"),
  };

  const posIdx: Record<string, number> = {};
  for (const pos of POSITION_COLUMNS) {
    posIdx[pos] = idx(pos);
  }

  const players: Fc26CsvPlayer[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < header.length - 5) continue;

    const natId = parseInt(cols[col.nationalityId] ?? "", 10);
    if (Number.isNaN(natId)) continue;

    const jerseyRaw = cols[col.nationJerseyNumber]?.trim();
    const nationJerseyNumber =
      jerseyRaw && jerseyRaw !== ""
        ? parseInt(jerseyRaw, 10)
        : null;

    const positionRatings: Record<string, number> = {};
    for (const pos of POSITION_COLUMNS) {
      const rating = parseRating(cols[posIdx[pos]]);
      if (rating != null) positionRatings[pos.toUpperCase()] = rating;
    }

    players.push({
      playerId: cols[col.playerId] ?? "",
      name: cols[col.longName] ?? cols[col.shortName] ?? "",
      shortName: cols[col.shortName] ?? "",
      positions: cols[col.positions] ?? "",
      overall: parseInt(cols[col.overall] ?? "0", 10) || 0,
      potential: parseInt(cols[col.potential] ?? "0", 10) || 0,
      nationalityId: natId,
      nationalityName: cols[col.nationalityName] ?? "",
      nationTeamId: cols[col.nationTeamId]?.trim() || null,
      nationPosition: cols[col.nationPosition]?.trim() || null,
      nationJerseyNumber: Number.isNaN(nationJerseyNumber as number)
        ? null
        : nationJerseyNumber,
      pace: parseInt(cols[col.pace] ?? "0", 10) || 0,
      shooting: parseInt(cols[col.shooting] ?? "0", 10) || 0,
      passing: parseInt(cols[col.passing] ?? "0", 10) || 0,
      dribbling: parseInt(cols[col.dribbling] ?? "0", 10) || 0,
      defending: parseInt(cols[col.defending] ?? "0", 10) || 0,
      physic: parseInt(cols[col.physic] ?? "0", 10) || 0,
      imageUrl: cols[col.imageUrl]?.trim() || null,
      positionRatings,
    });
  }

  return players;
}

export function getNationalSquadFromCsv(
  rows: Fc26CsvPlayer[],
  nationalityId: number
): Fc26CsvPlayer[] {
  return rows
    .filter(
      (p) =>
        p.nationalityId === nationalityId &&
        p.nationJerseyNumber != null &&
        p.nationPosition
    )
    .sort((a, b) => (a.nationJerseyNumber ?? 99) - (b.nationJerseyNumber ?? 99));
}

export function getNationalityPlayerPool(
  rows: Fc26CsvPlayer[],
  nationalityId: number
) {
  return rows.filter((p) => p.nationalityId === nationalityId);
}
