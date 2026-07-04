export interface EnrichedPlayerStat {
  goals: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  playerName: string;
  playerImageUrl?: string | null;
  playerEaId?: string | null;
  nickname: string;
  teamName?: string | null;
  teamCrestUrl?: string | null;
  teamFifaIndexId?: string | null;
}
