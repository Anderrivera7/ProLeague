export interface TournamentFcPlayerStats {
  fcPlayerId: string;
  goals: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  fcPlayer: {
    id: string;
    name: string;
    imageUrl: string | null;
    jerseyNumber: number | null;
    fifaIndexId?: string | null;
  } | null;
}

export interface MatchPlayerStatPreview {
  userId: string;
  goals: number;
  yellowCards: number;
  redCards: number;
  fcPlayer: { name: string };
}
