// Base interfaces
export interface StatValue {
  value: number;
  percentileRank: number;
}

// Team-related types
export interface TeamStats {
  team: string;
  season: string;
  stats: {
    Goals: StatValue;
    xG: StatValue;
    'Total shots': StatValue;
    'Shots on target': StatValue;
    'SOT %': StatValue;
    'Total passes': StatValue;
    'Accurate passes': StatValue;
    'Pass accuracy %': StatValue;
    [key: string]: StatValue;
  }
}

// Player interface
export interface Player {
  name: string;
  team: string;
  season: string;
  position: string;
  age: string | number;
  contract: string | number;
  minutes: string | number;
  passport: string;
  foot: string;
  height: string | number;
  league: string;
  stats: {
    [key: string]: number;
  };
}

// Match/Progress-related types - PLACEHOLDER
export interface MatchData {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  season: string;
  stats: {
    [key: string]: StatValue;
  };
}

// Chart component types
export interface ChartMetric {
  name: string;
  value: number;
  percentile: number;
}

export interface ChartSection {
  title: string;
  color: string;
  metrics: ChartMetric[];
}

export interface LineupData {
  league: string;
  season: string;
  collection_timestamp: number;
  total_teams: number;
  teams: TeamLineup[];
}

export interface TeamLineup {
  team_name: string;
  team_slug: string;
  team_id: number;
  league_position: number;
  last_5_matches: MatchData[];
}

export interface MatchData {
  id: number;
  slug: string;
  customId: string;
  homeTeam: string;
  awayTeam: string;
  startTimestamp: number;
  players: {
    home: PlayerPosition[];
    away: PlayerPosition[];
  } | null;
}

export interface PlayerPosition {
  surname: string;
  full_name: string;
  id: number;
  jersey_number: string;
  position: string;
  averageX: number;
  averageY: number;
  started: boolean;
}

export interface MatchLineup {
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  startTimestamp: number;
  isHome: boolean;
  starters: PlayerPosition[];
}

export type TabId = 'opposition' | 'player' | 'squad' | 'progress';