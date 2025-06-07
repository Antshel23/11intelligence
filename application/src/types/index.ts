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
  
  // Player-related types
  export interface PlayerStats {
    name: string;
    team: string;
    position: string;
    age: number;
    season: string;
    stats: {
      Goals: StatValue;
      Assists: StatValue;
      'Minutes played': StatValue;
      'Pass accuracy %': StatValue;
      'Tackles won': StatValue;
      [key: string]: StatValue;
    }
  }
  
  // Match/Progress-related types
  export interface MatchStats {
    matchId: string;
    date: string;
    homeTeam: string;
    awayTeam: string;
    result: string;
    season: string;
    gameWeek: number;
    stats: {
      'Home xG': StatValue;
      'Away xG': StatValue;
      'Home possession': StatValue;
      'Away possession': StatValue;
      [key: string]: StatValue;
    }
  }
  
  // Chart component types
  export interface ChartMetric {
    name: string;
    value: number;
    percentile: number;
  }