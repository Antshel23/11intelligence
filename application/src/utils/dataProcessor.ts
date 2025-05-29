import { csvParse } from 'd3'
import type { DSVRowString } from 'd3'
import oppoData from './oppo_data.csv'

export interface TeamStats {
  team: string
  possession: number
  progressivePassSuccess: number
  finalThirdPassSuccess: number
  opponentProgressivePassSuccess: number
  opponentFinalThirdPassSuccess: number
  aerialDuelSuccess: number
  ppda: number
  xG: number
  opponentXG: number
}

export const processData = async (): Promise<TeamStats[]> => {
  try {
    const rawData = await fetch(oppoData)
      .then(response => response.text())
      .then(v => csvParse(v))
    
    if (!rawData || !rawData.length) {
      throw new Error('No data found in CSV')
    }

    // Group data by team
    const teamMap = new Map<string, TeamStats>()
    
    rawData.forEach((row: DSVRowString) => {
      if (!teamMap.has(row.Team)) {
        teamMap.set(row.Team, {
          team: row.Team,
          possession: parseFloat(row.Possession) || 0,
          progressivePassSuccess: parseFloat(row['Progressive pass success %']) || 0,
          finalThirdPassSuccess: parseFloat(row['Final third pass success %']) || 0,
          opponentProgressivePassSuccess: parseFloat(row['Oppo Progressive pass success %']) || 0,
          opponentFinalThirdPassSuccess: parseFloat(row['Oppo Final third pass success %']) || 0,
          aerialDuelSuccess: parseFloat(row['Aerial duel success %']) || 0,
          ppda: parseFloat(row.PPDA) || 0,
          xG: parseFloat(row.xG) || 0,
          opponentXG: parseFloat(row['Oppo xG']) || 0
        })
      }
    })

    // Convert map to array and sort by team name
    const processedData = Array.from(teamMap.values())
      .sort((a, b) => a.team.localeCompare(b.team))
    
    console.log('Processed teams:', processedData.map(d => d.team)) // Debug log
    
    return processedData
  } catch (error) {
    console.error('Error processing data:', error)
    throw new Error('Failed to process team data')
  }
}