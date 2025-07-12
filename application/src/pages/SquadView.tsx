import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FootballPitch } from '../components/squad/FootballPitch'
import { SquadList } from '../components/squad/SquadList'

export interface Player {
  id: string
  name: string
  position: string
  pitch_position: string
  fitness: 'red' | 'orange' | 'green'
}

interface SquadData {
  players: Player[]
}

function SquadView() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    
    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = 'auto'
      document.documentElement.style.overflow = 'auto'
    }
  }, [])
  
  useEffect(() => {
    const loadSquad = async () => {
      try {
        const response = await fetch('/data/squad_data.json')
        const data: SquadData = await response.json()
        setPlayers(data.players)
      } catch (error) {
        console.error('Error loading squad:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSquad()
  }, [])

  const updatePlayerFitness = (playerId: string, fitness: 'red' | 'orange' | 'green') => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, fitness } : player
    ))
  }

  const updatePlayerPosition = (playerId: string, position: string) => {
    setPlayers(prev => prev.map(player => 
      player.id === playerId ? { ...player, position } : player
    ))
  }

  const movePlayerToPitch = (playerId: string, targetPitchPosition: string) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return { ...player, pitch_position: targetPitchPosition }
      }
      return player
    }))
  }

  const removePlayerFromPitch = (playerId: string) => {
    setPlayers(prev => prev.map(player => {
      if (player.id === playerId) {
        return { ...player, pitch_position: 'squad' }
      }
      return player
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-[#EFEFEF] text-lg">Loading squad...</div>
      </div>
    )
  }

  return (
    <div className="h-screen p-2 overflow-hidden">
      <div className="grid grid-cols-5 gap-4">
        {/* Left 3/5 - Football Pitch */}
        <div className="col-span-3 stat-panel2 p-2 overflow-hidden flex flex-col">
          <FootballPitch 
            players={players}
            onPlayerDrop={movePlayerToPitch}
            onPlayerRemove={removePlayerFromPitch}
          />
        </div>
  
        {/* Right 2/5 - Squad List */}
        <div className="col-span-2 stat-panel2 p-2 overflow-hidden flex flex-col">
          <SquadList 
            players={players}
            onFitnessChange={updatePlayerFitness}
            onPositionChange={updatePlayerPosition}
          />
        </div>
      </div>
    </div>
  )
}

export default SquadView