import type { TeamStats } from '../../types'

export const processTeamData = async (): Promise<TeamStats[]> => {
  try {
    const response = await fetch('/src/utils/data/oppo_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TeamStats[] = await response.json();
    
    if (!data || !data.length) {
      throw new Error('No team data found');
    }

    return data.sort((a, b) => a.team.localeCompare(b.team));
  } catch (error) {
    console.error('Error processing team data:', error);
    throw new Error('Failed to process team data');
  }
}

export const getValue = (team: TeamStats, statKey: string): number => {
  return team.stats[statKey]?.value ?? 0;
}

export const getPercentileRank = (team: TeamStats, statKey: string): number => {
  return team.stats[statKey]?.percentile ?? 0;
}