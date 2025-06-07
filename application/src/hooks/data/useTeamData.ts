import { useState, useEffect } from 'react'
import { processTeamData } from '../../utils/processors/teamDataProcessor'
import type { TeamStats } from '../../types'

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
        const teamData = await processTeamData()
        
        // Filter to only include teams where season='24/25'
        const filteredData = teamData.filter(team => team.season === '24/25')
        
        setData(filteredData)
        if (filteredData.length > 0) {
          setSelectedTeam(filteredData[0].team)
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