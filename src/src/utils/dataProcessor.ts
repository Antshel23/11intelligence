export interface StatValue {
  value: number;
  percentileRank: number;
}

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

export const processData = async (): Promise<TeamStats[]> => {
  try {
    // Update path to fetch from utils folder
    const response = await fetch('/src/utils/oppo_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TeamStats[] = await response.json();
    
    if (!data || !data.length) {
      throw new Error('No data found in JSON');
    }

    // Sort teams alphabetically
    const processedData = data.sort((a, b) => a.team.localeCompare(b.team));
    
    // Validate data structure
    processedData.forEach(team => {
      if (!team.team || !team.season || !team.stats) {
        throw new Error(`Invalid team data structure for team: ${team.team}`);
      }
    });

    return processedData;
  } catch (error) {
    console.error('Error processing data:', error);
    throw new Error('Failed to process team data');
  }
}

// Helper functions
export const getValue = (team: TeamStats, statKey: string): number => {
  return team.stats[statKey]?.value ?? 0;
}

export const getPercentileRank = (team: TeamStats, statKey: string): number => {
  return team.stats[statKey]?.percentileRank ?? 0;
}

export const getStatKeys = (team: TeamStats): string[] => {
  return Object.keys(team.stats);
}

export const hasStat = (team: TeamStats, statKey: string): boolean => {
  return statKey in team.stats;
}