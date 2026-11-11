import type { Prisma, PrismaClient, TournamentType } from "@prisma/client";
import { resolvePlayerImageUrl } from "@/lib/fc-data/player-image";

type Db = PrismaClient | Prisma.TransactionClient;

const MATCH_MVP = 1;
const FINAL_MVP = 2;
const TOP_SCORER = 3;
const CHAMPION = 5;
const RUNNER_UP = 3;

export interface BallonDorRow {
  fcPlayerId: string;
  playerName: string;
  nickname: string;
  points: number;
  rank: number;
  portraitUrl: string | null;
  playerEaId: string | null;
  teamName: string | null;
  crestUrl: string | null;
  teamFifaIndexId: string | null;
  detail: string;
  userId: string;
}

export interface BallonDorRanking {
  finalReached: boolean;
  rows: BallonDorRow[];
}

interface Side {
  userId: string;
  nickname: string;
  teamName: string | null;
  crestUrl: string | null;
  teamFifaIndexId: string | null;
}

function sideOf(
  participant: {
    userId: string;
    user: { nickname: string };
    fcTeam: { name: string; crestUrl: string | null; fifaIndexId: string | null } | null;
  }
): Side {
  return {
    userId: participant.userId,
    nickname: participant.user.nickname,
    teamName: participant.fcTeam?.name ?? null,
    crestUrl: participant.fcTeam?.crestUrl ?? null,
    teamFifaIndexId: participant.fcTeam?.fifaIndexId ?? null,
  };
}

function decideFinal(
  matches: {
    homeScore: number | null;
    awayScore: number | null;
    penaltiesHome: number | null;
    penaltiesAway: number | null;
    home: Side;
    away: Side;
  }[]
): { winner: string; loser: string } | null {
  const totals = new Map<string, { goals: number; pens: number }>();
  const touch = (userId: string) => {
    if (!totals.has(userId)) totals.set(userId, { goals: 0, pens: 0 });
    return totals.get(userId)!;
  };

  for (const match of matches) {
    if (match.homeScore == null || match.awayScore == null) return null;
    touch(match.home.userId).goals += match.homeScore;
    touch(match.away.userId).goals += match.awayScore;
    if (
      match.penaltiesHome != null &&
      match.penaltiesAway != null &&
      match.penaltiesHome !== match.penaltiesAway
    ) {
      const homeWinsPens = match.penaltiesHome > match.penaltiesAway;
      touch(homeWinsPens ? match.home.userId : match.away.userId).pens += 1;
    }
  }

  const users = [...totals.keys()];
  if (users.length !== 2) return null;
  const [a, b] = users;
  const left = totals.get(a)!;
  const right = totals.get(b)!;
  if (left.goals === right.goals && left.pens === right.pens) return null;
  const aWins = left.goals > right.goals || (left.goals === right.goals && left.pens > right.pens);
  return aWins ? { winner: a, loser: b } : { winner: b, loser: a };
}

function isLeagueLike(type: TournamentType) {
  return type === "LEAGUE" || type === "GROUPS";
}

export async function getBallonDorRanking(
  db: Db,
  tournamentId: string
): Promise<BallonDorRanking> {
  const tournament = await db.tournament.findUnique({
    where: { id: tournamentId },
    select: { type: true, status: true },
  });
  if (!tournament) return { finalReached: false, rows: [] };

  const matches = await db.match.findMany({
    where: { tournamentId },
    select: {
      id: true,
      round: true,
      groupName: true,
      status: true,
      homeScore: true,
      awayScore: true,
      penaltiesHome: true,
      penaltiesAway: true,
      mvpFcPlayerId: true,
      mvpUserId: true,
      homeParticipant: {
        select: {
          userId: true,
          user: { select: { nickname: true } },
          fcTeam: { select: { name: true, crestUrl: true, fifaIndexId: true } },
        },
      },
      awayParticipant: {
        select: {
          userId: true,
          user: { select: { nickname: true } },
          fcTeam: { select: { name: true, crestUrl: true, fifaIndexId: true } },
        },
      },
    },
  });

  const leagueLike = isLeagueLike(tournament.type);
  const knockout = leagueLike ? [] : matches.filter((match) => !match.groupName);
  const maxRound = knockout.reduce((max, match) => Math.max(max, match.round), 0);
  const finalMatches = knockout.filter((match) => match.round === maxRound && maxRound > 0);
  const finalIds = new Set(finalMatches.map((match) => match.id));
  const finalReached = leagueLike
    ? tournament.status === "COMPLETED"
    : finalMatches.length > 0;

  const users = new Map<string, Side>();
  for (const match of matches) {
    users.set(match.homeParticipant.userId, sideOf(match.homeParticipant));
    users.set(match.awayParticipant.userId, sideOf(match.awayParticipant));
  }

  const championTrophy = await db.trophy.findFirst({
    where: { tournamentId, placement: 1 },
    select: { userId: true },
  });

  let championUserId = championTrophy?.userId ?? null;
  let runnerUpUserId: string | null = null;

  if (!leagueLike && finalMatches.length > 0 && finalMatches.every((match) => match.status === "COMPLETED")) {
    const decided = decideFinal(
      finalMatches.map((match) => ({
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        penaltiesHome: match.penaltiesHome,
        penaltiesAway: match.penaltiesAway,
        home: sideOf(match.homeParticipant),
        away: sideOf(match.awayParticipant),
      }))
    );
    if (decided) {
      championUserId = championUserId ?? decided.winner;
      runnerUpUserId = decided.winner === championUserId ? decided.loser : decided.winner;
    }
  }

  if (leagueLike && tournament.status === "COMPLETED") {
    const standings = await db.standing.findMany({
      where: { tournamentId, ...(tournament.type === "LEAGUE" ? { groupName: null } : {}) },
      orderBy: [{ points: "desc" }, { gd: "desc" }, { gf: "desc" }],
      select: { participant: { select: { userId: true } } },
    });
    const ordered = standings
      .map((row) => row.participant.userId)
      .filter((userId, index, all) => all.indexOf(userId) === index);
    championUserId = championUserId ?? ordered[0] ?? null;
    runnerUpUserId = ordered.find((userId) => userId !== championUserId) ?? null;
  }

  type Bucket = {
    fcPlayerId: string;
    userId: string;
    mvps: number;
    finalMvps: number;
    scorer: number;
    champion: number;
    runnerUp: number;
  };
  const buckets = new Map<string, Bucket>();
  const ensure = (fcPlayerId: string, userId: string) => {
    const key = fcPlayerId;
    const current = buckets.get(key);
    if (current) return current;
    const created: Bucket = {
      fcPlayerId,
      userId,
      mvps: 0,
      finalMvps: 0,
      scorer: 0,
      champion: 0,
      runnerUp: 0,
    };
    buckets.set(key, created);
    return created;
  };

  for (const match of matches) {
    if (match.status !== "COMPLETED" || !match.mvpFcPlayerId || !match.mvpUserId) continue;
    const bucket = ensure(match.mvpFcPlayerId, match.mvpUserId);
    if (finalIds.has(match.id)) bucket.finalMvps += 1;
    else bucket.mvps += 1;
  }

  const goalRows = await db.matchPlayerStat.groupBy({
    by: ["fcPlayerId", "userId"],
    where: {
      goals: { gt: 0 },
      match: { tournamentId, status: "COMPLETED" },
    },
    _sum: { goals: true },
  });
  const bestGoals = goalRows.reduce((max, row) => Math.max(max, row._sum.goals ?? 0), 0);
  if (bestGoals > 0) {
    for (const row of goalRows) {
      if ((row._sum.goals ?? 0) !== bestGoals) continue;
      ensure(row.fcPlayerId, row.userId).scorer = TOP_SCORER;
    }
  }

  if (championUserId || runnerUpUserId) {
    for (const bucket of buckets.values()) {
      if (bucket.mvps < 1) continue;
      if (bucket.userId === championUserId) bucket.champion = CHAMPION;
      if (bucket.userId === runnerUpUserId) bucket.runnerUp = RUNNER_UP;
    }
  }

  const playerIds = [...buckets.keys()];
  const players = playerIds.length
    ? await db.fcPlayer.findMany({
        where: { id: { in: playerIds } },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          fifaIndexId: true,
          team: { select: { name: true, crestUrl: true, fifaIndexId: true } },
        },
      })
    : [];
  const playerById = new Map(players.map((player) => [player.id, player]));

  const scored = [...buckets.values()]
    .map((bucket) => {
      const points =
        bucket.mvps * MATCH_MVP +
        bucket.finalMvps * FINAL_MVP +
        bucket.scorer +
        bucket.champion +
        bucket.runnerUp;
      return { bucket, points };
    })
    .filter((row) => row.points > 0)
    .sort((a, b) => b.points - a.points || a.bucket.fcPlayerId.localeCompare(b.bucket.fcPlayerId));

  let lastPoints = -1;
  let lastRank = 0;
  const rows: BallonDorRow[] = scored.map((row, index) => {
    const rank = row.points === lastPoints ? lastRank : index + 1;
    lastPoints = row.points;
    lastRank = rank;
    const player = playerById.get(row.bucket.fcPlayerId);
    const owner = users.get(row.bucket.userId);
    const bits: string[] = [];
    if (row.bucket.mvps > 0) {
      bits.push(`${row.bucket.mvps} MVP`);
    }
    if (row.bucket.finalMvps > 0) bits.push("Final");
    if (row.bucket.scorer > 0) bits.push("Goleador");
    if (row.bucket.champion > 0) bits.push("Campeón");
    if (row.bucket.runnerUp > 0) bits.push("Subcampeón");
    return {
      fcPlayerId: row.bucket.fcPlayerId,
      playerName: player?.name ?? "Jugador",
      nickname: owner?.nickname ?? "",
      points: row.points,
      rank,
      portraitUrl: player
        ? resolvePlayerImageUrl(player.fifaIndexId, player.imageUrl)
        : null,
      playerEaId: player?.fifaIndexId ?? null,
      teamName: player?.team?.name ?? owner?.teamName ?? null,
      crestUrl: player?.team?.crestUrl ?? owner?.crestUrl ?? null,
      teamFifaIndexId: player?.team?.fifaIndexId ?? owner?.teamFifaIndexId ?? null,
      detail: bits.join(" · "),
      userId: row.bucket.userId,
    };
  });

  return { finalReached, rows };
}
