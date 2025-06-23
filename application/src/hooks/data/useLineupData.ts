import { useState, useEffect } from 'react'
import { getTeamMatches } from '../../utils/processors/lineupDataProcessor'
import type { MatchLineup } from '../../types'

export function useLineupData(teamName: string) {
  const [data, setData] = useState<MatchLineup[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchLineup | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!teamName || teamName.trim() === '') {
        setData([])
        setSelectedMatch(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`Loading lineup data for team: "${teamName}"`);
        const lineupData = await getTeamMatches(teamName)
        
        console.log(`Found ${lineupData.length} matches for ${teamName}`);
        
        setData(lineupData)
        if (lineupData.length > 0) {
          setSelectedMatch(lineupData[0]) // Most recent match
        } else {
          setSelectedMatch(null)
        }
      } catch (err) {
        setError('Failed to load lineup data')
        console.error('Error loading lineup data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [teamName]) // Re-run when teamName changes

  return {
    data,
    selectedMatch,
    setSelectedMatch,
    isLoading,
    error,
    matches: data
  }
}