import { useState, useEffect } from 'react'
import { processPlayerData } from '../../utils/processors/playerDataProcessor'
import type { Player } from '../../types'

export function usePlayerData() {
  const [data, setData] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const playerData = await processPlayerData()
        
        setData(playerData)
        if (playerData.length > 0) {
          setSelectedPlayer(playerData[0])
        }
      } catch (err) {
        setError('Failed to load player data')
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  return {
    data,
    selectedPlayer,
    setSelectedPlayer,
    isLoading,
    error,
    players: data
  }
}