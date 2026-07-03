export interface ScrapedLeagueData {
  eaId: string;
  name: string;
  country?: string;
}

export interface ScrapedTeamData {
  eaId: string;
  name: string;
  shortName?: string;
  country?: string;
  crestUrl?: string;
  overall?: number;
  attack?: number;
  midfield?: number;
  defense?: number;
  league?: ScrapedLeagueData;
}

export interface ScrapedPlayerData {
  eaId: string;
  name: string;
  position?: string;
  squadRole?: string;
  jerseyNumber?: number;
  overall?: number;
  potential?: number;
  nationality?: string;
  imageUrl?: string;
  pace?: number;
  shooting?: number;
  passing?: number;
  dribbling?: number;
  defending?: number;
  physic?: number;
}

export interface TeamWithPlayersResult {
  team: ScrapedTeamData;
  players: ScrapedPlayerData[];
}

export interface NationalTeamCatalogEntry {
  nationalityId: number;
  nameEs: string;
  nameEn: string;
  crestUrl?: string;
  licensed?: boolean;
}
