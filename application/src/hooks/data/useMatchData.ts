import { useState, useEffect } from 'react'
import { processMatchData } from '../../utils/processors/matchDataProcessor'
import type { MatchData } from '../../types'

export function useMatchData() {
  const [data, setData] = useState<MatchData[]>([])
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const matchData = await processMatchData()
        
        setData(matchData)
        if (matchData.length > 0) {
          setSelectedMatch(matchData[0])
        }
      } catch (err) {
        setError('Failed to load match data')
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  return {
    data,
    selectedMatch,
    setSelectedMatch,
    isLoading,
    error,
    matches: data
  }
}