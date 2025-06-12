import type { MatchData } from '../../types'

export const processMatchData = async (): Promise<MatchData[]> => {
  try {
    const response = await fetch('/src/utils/data/match_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: MatchData[] = await response.json();
    
    if (!data || !data.length) {
      throw new Error('No match data found');
    }

    // Filter out invalid entries and league average
    const validMatches = data.filter(match => 
      match && 
      match.matchId > 0 && // Exclude league average (matchId: 0)
      match.match && 
      match.date &&
      match.teams &&
      match.teams["Dorking Wanderers"] &&
      match.teams["Dorking Wanderers"].stats
    );

    return validMatches.sort((a, b) => a.matchId - b.matchId);
  } catch (error) {
    console.error('Error processing match data:', error);
    throw new Error('Failed to process match data');
  }
}

export const getValue = (match: MatchData, team: string, statName: string): number => {
  const teamData = match.teams[team];
  if (!teamData || !teamData.stats) return 0;
  
  const value = teamData.stats[statName];
  return typeof value === 'number' ? value : 0;
}

export const getOppositionValue = (match: MatchData, statName: string): number => {
  // Try to find opposition team (any team that's not Dorking Wanderers)
  const oppositionTeam = Object.keys(match.teams).find(team => team !== "Dorking Wanderers");
  if (!oppositionTeam) return 0;
  
  return getValue(match, oppositionTeam, statName);
}

export const getPercentileRank = (match: MatchData, team: string, statName: string, allMatches: MatchData[]): number => {
  const matchValue = getValue(match, team, statName);
  const values = allMatches
    .map(m => getValue(m, team, statName))
    .filter(v => v !== null && v !== undefined && !isNaN(v) && v !== 0)
    .sort((a, b) => a - b);
  
  if (values.length === 0) return 0;
  
  const rank = values.filter(v => v < matchValue).length;
  return Math.round((rank / values.length) * 100);
}

// Helper function to get all available stats for a team in a match
export const getAvailableStats = (match: MatchData, team: string): string[] => {
  const teamData = match.teams[team];
  if (!teamData || !teamData.stats) return [];
  
  return Object.keys(teamData.stats).filter(key => {
    const value = teamData.stats[key];
    return typeof value === 'number' && value !== 0;
  });
}

// Helper function to check if a stat exists and has meaningful data across matches
export const isValidStat = (statName: string, team: string, matches: MatchData[]): boolean => {
  const validValues = matches
    .map(m => getValue(m, team, statName))
    .filter(v => !isNaN(v) && v !== 0);
  
  return validValues.length >= Math.ceil(matches.length * 0.5); // At least 50% of matches should have this stat
}

// Helper function to calculate running average for xPoints projection
export const calculateXPointsProgression = (matches: MatchData[]): { match: string; matchId: number; xPoints: number; runningAverage: number }[] => {
  const sortedMatches = matches.sort((a, b) => a.matchId - b.matchId);
  
  return sortedMatches.map((match, index) => {
    const xPoints = getValue(match, "Dorking Wanderers", "xPoints");
    const runningTotal = sortedMatches
      .slice(0, index + 1)
      .reduce((sum, m) => sum + getValue(m, "Dorking Wanderers", "xPoints"), 0);
    const runningAverage = (runningTotal / (index + 1)) * 46; // Project over 46 games
    
    return {
      match: match.match,
      matchId: match.matchId,
      xPoints,
      runningAverage
    };
  });
}

// Helper function to get team comparison data for stacked bar charts
export const getTeamComparison = (match: MatchData, stats: string[]): { name: string; dorking: number; opposition: number }[] => {
  return stats.map(statName => ({
    name: statName,
    dorking: getValue(match, "Dorking Wanderers", statName),
    opposition: getOppositionValue(match, statName)
  }));
}

// Helper function to get league average data
export const getLeagueAverageData = async (): Promise<MatchData | null> => {
  try {
    const response = await fetch('/src/utils/data/match_data.json');
    if (!response.ok) return null;
    
    const data: MatchData[] = await response.json();
    return data.find(match => match.matchId === 0) || null;
  } catch (error) {
    console.error('Error getting league average data:', error);
    return null;
  }
}

// Helper function to compare match performance against league average
export const compareToLeagueAverage = (match: MatchData, leagueAverage: MatchData, statName: string): { value: number; leagueAvg: number; percentageDiff: number } => {
  const value = getValue(match, "Dorking Wanderers", statName);
  const leagueAvg = getValue(leagueAverage, "Dorking Wanderers", statName);
  const percentageDiff = leagueAvg !== 0 ? ((value - leagueAvg) / leagueAvg) * 100 : 0;
  
  return {
    value,
    leagueAvg,
    percentageDiff
  };
}