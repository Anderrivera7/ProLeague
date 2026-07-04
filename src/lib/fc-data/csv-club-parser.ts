import { parseCsvLine } from "./csv-parser";

export interface Fc26CsvClubPlayer {
  playerId: string;
  name: string;
  shortName: string;
  positions: string;
  overall: number;
  potential: number;
  clubTeamId: number;
  clubName: string;
  clubPosition: string | null;
  clubJerseyNumber: number | null;
  leagueId: number;
  leagueName: string;
  leagueLevel: number;
  nationalityName: string;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physic: number;
  imageUrl: string | null;
}

export interface Fc26CsvClub {
  clubTeamId: number;
  name: string;
  leagueId: number;
  leagueName: string;
  leagueLevel: number;
}

export interface Fc26CsvLeague {
  leagueId: number;
  name: string;
  level: number;
  teamCount: number;
}

export function parseFc26ClubCsv(content: string): Fc26CsvClubPlayer[] {
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
    leagueId: idx("league_id"),
    leagueName: idx("league_name"),
    leagueLevel: idx("league_level"),
    clubTeamId: idx("club_team_id"),
    clubName: idx("club_name"),
    clubPosition: idx("club_position"),
    clubJerseyNumber: idx("club_jersey_number"),
    nationalityName: idx("nationality_name"),
    pace: idx("pace"),
    shooting: idx("shooting"),
    passing: idx("passing"),
    dribbling: idx("dribbling"),
    defending: idx("defending"),
    physic: idx("physic"),
    imageUrl: idx("player_face_url"),
  };

  const players: Fc26CsvClubPlayer[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < header.length - 5) continue;

    const clubTeamId = parseInt(cols[col.clubTeamId] ?? "", 10);
    const leagueId = parseInt(cols[col.leagueId] ?? "", 10);
    if (Number.isNaN(clubTeamId) || clubTeamId === 0 || Number.isNaN(leagueId)) {
      continue;
    }

    const jerseyRaw = cols[col.clubJerseyNumber]?.trim();
    const clubJerseyNumber =
      jerseyRaw && jerseyRaw !== "" ? parseInt(jerseyRaw, 10) : null;

    players.push({
      playerId: cols[col.playerId] ?? "",
      name: cols[col.longName] ?? cols[col.shortName] ?? "",
      shortName: cols[col.shortName] ?? "",
      positions: cols[col.positions] ?? "",
      overall: parseInt(cols[col.overall] ?? "0", 10) || 0,
      potential: parseInt(cols[col.potential] ?? "0", 10) || 0,
      clubTeamId,
      clubName: cols[col.clubName] ?? "",
      clubPosition: cols[col.clubPosition]?.trim() || null,
      clubJerseyNumber: Number.isNaN(clubJerseyNumber as number)
        ? null
        : clubJerseyNumber,
      leagueId,
      leagueName: cols[col.leagueName] ?? "",
      leagueLevel: parseInt(cols[col.leagueLevel] ?? "0", 10) || 0,
      nationalityName: cols[col.nationalityName] ?? "",
      pace: parseInt(cols[col.pace] ?? "0", 10) || 0,
      shooting: parseInt(cols[col.shooting] ?? "0", 10) || 0,
      passing: parseInt(cols[col.passing] ?? "0", 10) || 0,
      dribbling: parseInt(cols[col.dribbling] ?? "0", 10) || 0,
      defending: parseInt(cols[col.defending] ?? "0", 10) || 0,
      physic: parseInt(cols[col.physic] ?? "0", 10) || 0,
      imageUrl: cols[col.imageUrl]?.trim() || null,
    });
  }

  return players;
}

export function extractLeaguesFromClubRows(
  rows: Fc26CsvClubPlayer[],
  options?: { maxLevel?: number }
): Fc26CsvLeague[] {
  const maxLevel = options?.maxLevel ?? 1;
  const map = new Map<number, Fc26CsvLeague & { teams: Set<number> }>();

  for (const row of rows) {
    if (row.leagueLevel > maxLevel) continue;
    if (!map.has(row.leagueId)) {
      map.set(row.leagueId, {
        leagueId: row.leagueId,
        name: row.leagueName,
        level: row.leagueLevel,
        teamCount: 0,
        teams: new Set(),
      });
    }
    map.get(row.leagueId)!.teams.add(row.clubTeamId);
  }

  return [...map.values()]
    .map(({ teams, ...league }) => ({
      ...league,
      teamCount: teams.size,
    }))
    .filter((l) => l.teamCount > 0)
    .sort((a, b) => b.teamCount - a.teamCount);
}

export function extractClubsFromRows(
  rows: Fc26CsvClubPlayer[],
  leagueId: number
): Fc26CsvClub[] {
  const map = new Map<number, Fc26CsvClub>();

  for (const row of rows) {
    if (row.leagueId !== leagueId) continue;
    if (!map.has(row.clubTeamId)) {
      map.set(row.clubTeamId, {
        clubTeamId: row.clubTeamId,
        name: row.clubName,
        leagueId: row.leagueId,
        leagueName: row.leagueName,
        leagueLevel: row.leagueLevel,
      });
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function squadRoleSortKey(role: string) {
  if (role === "SUB") return 1;
  if (role === "RES") return 2;
  return 0;
}

export function getClubSquadFromRows(
  rows: Fc26CsvClubPlayer[],
  clubTeamId: number
): Fc26CsvClubPlayer[] {
  const withRole = rows.filter(
    (p) => p.clubTeamId === clubTeamId && p.clubPosition
  );

  if (withRole.length > 0) {
    return withRole.sort((a, b) => {
      const roleDiff =
        squadRoleSortKey(a.clubPosition!) - squadRoleSortKey(b.clubPosition!);
      if (roleDiff !== 0) return roleDiff;
      return (a.clubJerseyNumber ?? 99) - (b.clubJerseyNumber ?? 99);
    });
  }

  return rows
    .filter((p) => p.clubTeamId === clubTeamId)
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 30);
}
