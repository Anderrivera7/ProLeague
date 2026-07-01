import type {
  TournamentType,
  TournamentStatus,
  MatchStatus,
  ActivityType,
  AchievementType,
} from "@prisma/client";

export type { TournamentType, TournamentStatus, MatchStatus, ActivityType, AchievementType };

export interface DashboardStats {
  totalMatches: number;
  totalTournaments: number;
  activeTournaments: number;
  globalRank: number;
}

export interface PlayerProfile {
  id: string;
  nickname: string;
  email: string;
  avatarUrl: string | null;
  country: string | null;
  level: number;
  elo: number;
  favoriteTeam: {
    id: string;
    name: string;
    crestUrl: string | null;
  } | null;
  stats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    avgGoalsPerGame: number;
    biggestWin: number;
    bestStreak: number;
    titlesWon: number;
    seasonsPlayed: number;
    totalAssists: number;
    totalMvp: number;
  } | null;
}

export interface HeadToHeadStats {
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  biggestWin: number;
  currentStreak: number;
  bestStreak: number;
}

export interface MatchWithParticipants {
  id: string;
  round: number;
  groupName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  status: MatchStatus;
  scheduledAt: Date | null;
  homeParticipant: {
    user: { id: string; nickname: string; avatarUrl: string | null };
  };
  awayParticipant: {
    user: { id: string; nickname: string; avatarUrl: string | null };
  };
  tournament: { id: string; name: string };
}

export interface TournamentWithDetails {
  id: string;
  name: string;
  description: string | null;
  type: TournamentType;
  status: TournamentStatus;
  maxParticipants: number;
  startDate: Date | null;
  endDate: Date | null;
  twoLegs: boolean;
  _count: { participants: number; matches: number };
  creator: { id: string; nickname: string; avatarUrl: string | null };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatarUrl: string | null;
  value: number;
  elo?: number;
}

export interface PerformanceDataPoint {
  date: string;
  elo: number;
  wins: number;
  losses: number;
}

export interface MatchResultInput {
  matchId: string;
  homeScore: number;
  awayScore: number;
  penaltiesHome?: number;
  penaltiesAway?: number;
  mvpUserId?: string;
  events: {
    userId: string;
    goals?: number;
    assists?: number;
    yellowCards?: number;
    redCards?: number;
    ownGoals?: number;
  }[];
}
