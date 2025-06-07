import { useState, useEffect } from 'react'
import { processData } from '../utils/dataProcessor'
import type { TeamStats } from '../types'

export function useTeamData() {
  const [data, setData] = useState<TeamStats[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const teamData = await processData()
        setData(teamData)
        if (teamData.length > 0) {
          setSelectedTeam(teamData[0].team)
        }
      } catch (err) {
        setError('Failed to load team data')
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  return {
    data,
    selectedTeam,
    setSelectedTeam,
    isLoading,
    error,
    teams: data.map(d => d.team)
  }
}