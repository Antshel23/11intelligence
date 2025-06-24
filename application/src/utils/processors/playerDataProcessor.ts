import type { Player } from '../../types'

export const processPlayerData = async (): Promise<Player[]> => {
  try {
    const response = await fetch('data/player_data.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: Player[] = await response.json();
    
    if (!data || !data.length) {
      throw new Error('No player data found');
    }

    // Filter out any invalid entries
    const validPlayers = data.filter(player => 
      player && 
      player.name && 
      player.team && 
      player.season && 
      player.position &&
      player.stats
    );

    return validPlayers.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error processing player data:', error);
    throw new Error('Failed to process player data');
  }
}

export const getValue = (player: Player, statName: string): number => {
  const value = player.stats[statName];
  return typeof value === 'number' ? value : 0;
}

export const getPercentileRank = (player: Player, statName: string, allPlayers: Player[]): number => {
  const playerValue = getValue(player, statName);
  const values = allPlayers
    .map(p => getValue(p, statName))
    .filter(v => v !== null && v !== undefined && !isNaN(v) && v !== 0)
    .sort((a, b) => a - b);
  
  if (values.length === 0) return 0;
  
  const rank = values.filter(v => v < playerValue).length;
  return Math.round((rank / values.length) * 100);
}

// Helper function to get all available stats for a player
export const getAvailableStats = (player: Player): string[] => {
  return Object.keys(player.stats).filter(key => {
    const value = player.stats[key];
    return typeof value === 'number' && value !== 0;
  });
}

// Helper function to check if a stat exists and has meaningful data across players
export const isValidStat = (statName: string, players: Player[]): boolean => {
  const validValues = players
    .map(p => getValue(p, statName))
    .filter(v => !isNaN(v) && v !== 0);
  
  return validValues.length >= Math.ceil(players.length * 0.5); // At least 50% of players should have this stat
}