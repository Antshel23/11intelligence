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

// Player-related types - PLACEHOLDER
export interface PlayerStats {
  name: string;
  team: string;
  position: string;
  age: number;
  season: string;
  stats: {
    [key: string]: StatValue;
  }
}

// Match/Progress-related types - PLACEHOLDER
export interface MatchStats {
  matchId: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  season: string;
  stats: {
    [key: string]: StatValue;
  }
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

export type TabId = 'opposition' | 'player' | 'squad' | 'progress';