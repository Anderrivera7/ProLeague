export interface BracketParticipant {
  id: string;
  seed?: number | null;
  nickname: string;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
}

export interface BracketSlot {
  seed?: number;
  nickname?: string;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  placeholder?: string;
  participantId?: string;
}

export interface BracketMatchView {
  id?: string;
  home: BracketSlot;
  away: BracketSlot;
  status?: string;
  homeScore?: number | null;
  awayScore?: number | null;
}

export interface BracketRoundView {
  label: string;
  matches: BracketMatchView[];
  /** Lista de participantes (ej. los 4 clasificados) sin formato de partido */
  slots?: BracketSlot[];
}

export interface BracketChampion {
  nickname?: string;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
  placeholder?: string;
}

type MatchInput = {
  id: string;
  round: number;
  groupName?: string | null;
  bracketPosition?: number | null;
  status: string;
  homeScore?: number | null;
  awayScore?: number | null;
  homeParticipant: BracketParticipant;
  awayParticipant: BracketParticipant;
};

type StandingInput = {
  participantId: string;
  points: number;
  played: number;
};

function participantToSlot(
  participant: BracketParticipant,
  seed?: number
): BracketSlot {
  return {
    seed: seed ?? participant.seed ?? undefined,
    nickname: participant.nickname,
    teamName: participant.teamName,
    teamCrestUrl: participant.teamCrestUrl,
    teamFifaIndexId: participant.teamFifaIndexId,
    participantId: participant.id,
  };
}

function emptySlot(seed?: number, placeholder = "Esperando jugador"): BracketSlot {
  return { seed, placeholder };
}

function getMatchWinner(match: BracketMatchView): BracketSlot | null {
  if (match.status !== "COMPLETED") return null;
  if (match.homeScore == null || match.awayScore == null) return null;
  if (match.homeScore > match.awayScore) return match.home;
  if (match.awayScore > match.awayScore) return match.away;
  return null;
}

function matchFromDb(match: MatchInput): BracketMatchView {
  return {
    id: match.id,
    status: match.status,
    homeScore: match.homeScore,
    awayScore: match.awayScore,
    home: participantToSlot(match.homeParticipant),
    away: participantToSlot(match.awayParticipant),
  };
}

function resolveSeededParticipants(
  participants: BracketParticipant[],
  standings: StandingInput[]
): BracketParticipant[] {
  const hasSeeds = participants.every((p) => p.seed != null && p.seed > 0);
  if (hasSeeds) {
    return [...participants].sort((a, b) => (a.seed ?? 999) - (b.seed ?? 999));
  }

  if (standings.length > 0) {
    const ranked = [...standings].sort((a, b) => b.points - a.points);
    return ranked
      .map((row, index) => {
        const participant = participants.find((p) => p.id === row.participantId);
        if (!participant) return null;
        return { ...participant, seed: index + 1 };
      })
      .filter((p): p is BracketParticipant => p != null);
  }

  return participants.map((p, index) => ({ ...p, seed: p.seed ?? index + 1 }));
}

function buildSeededByeBracket(
  participants: BracketParticipant[],
  maxParticipants: number,
  knockoutMatches: MatchInput[],
  standings: StandingInput[] = []
): { rounds: BracketRoundView[]; champion: BracketChampion } {
  const sorted = resolveSeededParticipants(participants, standings);

  const clasificadoSlots: BracketSlot[] = Array.from(
    { length: maxParticipants },
    (_, index) => {
      const participant = sorted[index];
      return participant
        ? participantToSlot(participant, index + 1)
        : emptySlot(index + 1);
    }
  );

  const seed1 = clasificadoSlots[0] ?? emptySlot(1);
  const seed2 = clasificadoSlots[1] ?? emptySlot(2);
  const seed3 = clasificadoSlots[2] ?? emptySlot(3);

  const semiFromDb = knockoutMatches.find(
    (m) => m.bracketPosition === 1 || m.round === 1
  );
  const finalFromDb = knockoutMatches.find(
    (m) => m.bracketPosition === 1 && m.round > (semiFromDb?.round ?? 0)
  ) ?? knockoutMatches.find((m) => m.round === 2);

  const semiMatch: BracketMatchView = semiFromDb
    ? matchFromDb(semiFromDb)
    : { home: seed2, away: seed3 };

  const semiWinner = getMatchWinner(semiMatch);

  const finalAway: BracketSlot = semiWinner ?? {
    placeholder: "Ganador semifinal",
  };

  const finalMatch: BracketMatchView = finalFromDb
    ? matchFromDb(finalFromDb)
    : { home: seed1, away: finalAway };

  const championWinner = getMatchWinner(finalMatch);

  const rounds: BracketRoundView[] = [
    {
      label: maxParticipants === 4 ? "Los 4" : "Clasificados",
      slots: clasificadoSlots,
      matches: [],
    },
    {
      label: "Semifinal",
      matches: [semiMatch],
    },
    {
      label: "Final",
      matches: [finalMatch],
    },
  ];

  const champion: BracketChampion = championWinner
    ? {
        nickname: championWinner.nickname,
        teamName: championWinner.teamName,
        teamCrestUrl: championWinner.teamCrestUrl,
        teamFifaIndexId: championWinner.teamFifaIndexId,
      }
    : { placeholder: "Por definir" };

  return { rounds, champion };
}

function buildFromKnockoutMatches(
  knockoutMatches: MatchInput[],
  participants: BracketParticipant[],
  maxParticipants: number
): { rounds: BracketRoundView[]; champion: BracketChampion } {
  if (maxParticipants === 4) {
    return buildSeededByeBracket(
      participants,
      maxParticipants,
      knockoutMatches,
      []
    );
  }

  const roundNumbers = [
    ...new Set(knockoutMatches.map((m) => m.round)),
  ].sort((a, b) => a - b);

  const rounds: BracketRoundView[] = roundNumbers.map((roundNum, index) => {
    const roundMatches = knockoutMatches
      .filter((m) => m.round === roundNum)
      .sort((a, b) => (a.bracketPosition ?? 0) - (b.bracketPosition ?? 0));

    const teamsInRound = roundMatches.length * 2;
    const isLastRound = index === roundNumbers.length - 1;

    return {
      label: isLastRound ? "Final" : teamsInRound === 4 ? "Semifinal" : `Ronda ${roundNum}`,
      matches: roundMatches.map(matchFromDb),
    };
  });

  const finalRound = rounds[rounds.length - 1];
  const finalMatch = finalRound?.matches[0];
  const winner = finalMatch ? getMatchWinner(finalMatch) : null;

  return {
    rounds,
    champion: winner
      ? {
          nickname: winner.nickname,
          teamName: winner.teamName,
          teamCrestUrl: winner.teamCrestUrl,
          teamFifaIndexId: winner.teamFifaIndexId,
        }
      : { placeholder: "Por definir" },
  };
}

export function buildTournamentBracket(
  participants: BracketParticipant[],
  matches: MatchInput[],
  options: { maxParticipants: number; standings?: StandingInput[] }
): { rounds: BracketRoundView[]; champion: BracketChampion } | null {
  if (participants.length < 2 && options.maxParticipants < 2) return null;

  const seeded = resolveSeededParticipants(
    participants,
    options.standings ?? []
  );
  const knockoutMatches = matches.filter((m) => !m.groupName);

  if (options.maxParticipants === 4) {
    return buildSeededByeBracket(
      seeded,
      options.maxParticipants,
      knockoutMatches,
      options.standings ?? []
    );
  }

  if (knockoutMatches.length > 0) {
    return buildFromKnockoutMatches(
      knockoutMatches,
      seeded,
      options.maxParticipants
    );
  }

  return buildSeededByeBracket(
    seeded,
    options.maxParticipants,
    [],
    options.standings ?? []
  );
}

export function shouldShowBracket(tournamentType: string): boolean {
  return ["KNOCKOUT", "GROUPS_KNOCKOUT", "TWO_LEGS"].includes(tournamentType);
}
