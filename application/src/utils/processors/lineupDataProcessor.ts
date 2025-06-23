import type { LineupData, TeamLineup, MatchLineup, PlayerPosition } from '../../types'

export const processLineupData = async (): Promise<LineupData> => {
  try {
    const response = await fetch('/src/utils/data/lineup_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: LineupData = await response.json();
    
    if (!data || !data.teams || !data.teams.length) {
      throw new Error('No lineup data found');
    }

    return data;
  } catch (error) {
    console.error('Error processing lineup data:', error);
    throw new Error('Failed to process lineup data');
  }
}

export const getTeamMatches = async (teamName: string): Promise<MatchLineup[]> => {
  try {
    const data = await processLineupData();
    
    // Find team by exact name match
    const team = data.teams.find(t => 
      t.team_name === teamName
    );
    
    if (!team) {
      console.warn(`Team "${teamName}" not found in lineup data`);
      return [];
    }

    const matchLineups: MatchLineup[] = [];

    for (const match of team.last_5_matches) {
      if (!match.players || (!match.players.home && !match.players.away)) {
        console.warn(`No player data for match ${match.id}`);
        continue;
      }

      // Determine if team was home or away by comparing team name with homeTeam/awayTeam
      const isHome = match.homeTeam === team.team_name;
      const isAway = match.awayTeam === team.team_name;
      
      if (!isHome && !isAway) {
        console.warn(`Team "${team.team_name}" not found in match teams: ${match.homeTeam} vs ${match.awayTeam}`);
        continue;
      }

      // Get the correct team's players
      const teamPlayers = isHome ? match.players.home : match.players.away;
      
      if (!teamPlayers || teamPlayers.length === 0) {
        console.warn(`No players found for ${isHome ? 'home' : 'away'} team in match ${match.id}`);
        continue;
      }

      // Filter only starters
      const starters = teamPlayers.filter(player => player.started === true);

      matchLineups.push({
        matchId: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        startTimestamp: match.startTimestamp,
        isHome: isHome,
        starters: starters
      });
    }

    // Sort by most recent first
    return matchLineups.sort((a, b) => b.startTimestamp - a.startTimestamp);
  } catch (error) {
    console.error('Error getting team matches:', error);
    return [];
  }
}

export const getMatchStarters = (matchLineup: MatchLineup): PlayerPosition[] => {
  return matchLineup.starters;
}

export const formatMatchTitle = (matchLineup: MatchLineup): string => {
  return `${matchLineup.homeTeam} vs ${matchLineup.awayTeam}`;
}

export const formatMatchDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'short' 
  });
}

export const getStarterCount = (matchLineup: MatchLineup): number => {
  return matchLineup.starters.length;
}