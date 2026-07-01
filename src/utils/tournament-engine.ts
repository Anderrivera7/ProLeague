import type { TournamentType } from "@prisma/client";

export interface Participant {
  id: string;
  userId: string;
  seed?: number;
}

export interface GeneratedMatch {
  round: number;
  groupName?: string;
  leg: number;
  bracketPosition?: number;
  homeParticipantId: string;
  awayParticipantId: string;
  scheduledAt?: Date;
}

function roundRobinPairs<T>(items: T[]): [T, T][][] {
  const list = [...items];
  if (list.length % 2 !== 0) list.push(null as unknown as T);

  const n = list.length;
  const rounds: [T, T][][] = [];

  for (let round = 0; round < n - 1; round++) {
    const pairs: [T, T][] = [];
    for (let i = 0; i < n / 2; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      if (home && away) pairs.push([home, away]);
    }
    rounds.push(pairs);
    const fixed = list[0];
    const rest = list.slice(1);
    rest.unshift(rest.pop()!);
    list.splice(0, list.length, fixed, ...rest);
  }

  return rounds;
}

export function generateLeagueFixture(
  participants: Participant[],
  twoLegs = false
): GeneratedMatch[] {
  const rounds = roundRobinPairs(participants);
  const matches: GeneratedMatch[] = [];

  rounds.forEach((pairs, roundIndex) => {
    pairs.forEach(([home, away]) => {
      matches.push({
        round: roundIndex + 1,
        leg: 1,
        homeParticipantId: home.id,
        awayParticipantId: away.id,
      });
      if (twoLegs) {
        matches.push({
          round: roundIndex + 1 + rounds.length,
          leg: 2,
          homeParticipantId: away.id,
          awayParticipantId: home.id,
        });
      }
    });
  });

  return matches;
}

export function generateKnockoutBracket(
  participants: Participant[],
  twoLegs = false
): GeneratedMatch[] {
  const sorted = [...participants].sort(
    (a, b) => (a.seed ?? 999) - (b.seed ?? 999)
  );
  const matches: GeneratedMatch[] = [];
  let round = 1;
  let current = sorted;

  while (current.length > 1) {
    const nextRound: Participant[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const home = current[i];
      const away = current[i + 1];
      if (!away) continue;

      matches.push({
        round,
        leg: 1,
        bracketPosition: i / 2 + 1,
        homeParticipantId: home.id,
        awayParticipantId: away.id,
      });

      if (twoLegs) {
        matches.push({
          round,
          leg: 2,
          bracketPosition: i / 2 + 1,
          homeParticipantId: away.id,
          awayParticipantId: home.id,
        });
      }

      nextRound.push(home);
    }
    current = nextRound;
    round++;
  }

  return matches;
}

export function generateGroupFixture(
  participants: Participant[],
  groupsCount: number,
  twoLegs = false
): GeneratedMatch[] {
  const groups: Participant[][] = Array.from({ length: groupsCount }, () => []);
  participants.forEach((p, i) => {
    groups[i % groupsCount].push(p);
  });

  const matches: GeneratedMatch[] = [];

  groups.forEach((group, groupIndex) => {
    const groupName = String.fromCharCode(65 + groupIndex);
    const groupMatches = generateLeagueFixture(group, twoLegs);
    groupMatches.forEach((m) => {
      matches.push({ ...m, groupName });
    });
  });

  return matches;
}

export function generateTournamentFixture(
  type: TournamentType,
  participants: Participant[],
  options: {
    groupsCount?: number;
    twoLegs?: boolean;
  } = {}
): GeneratedMatch[] {
  const { groupsCount = 4, twoLegs = false } = options;

  switch (type) {
    case "LEAGUE":
      return generateLeagueFixture(participants, twoLegs);
    case "KNOCKOUT":
      return generateKnockoutBracket(participants, twoLegs);
    case "GROUPS":
      return generateGroupFixture(participants, groupsCount, twoLegs);
    case "GROUPS_KNOCKOUT":
      return generateGroupFixture(participants, groupsCount, false);
    case "TWO_LEGS":
      return generateKnockoutBracket(participants, true);
    default:
      return generateLeagueFixture(participants);
  }
}

export function initializeStandings(
  participants: Participant[],
  groupName?: string
) {
  return participants.map((p) => ({
    participantId: p.id,
    groupName: groupName ?? null,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    points: 0,
  }));
}
