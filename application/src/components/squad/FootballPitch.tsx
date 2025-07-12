import { useState } from 'react'
import { Player } from '../../pages/SquadView'

interface FootballPitchProps {
  players: Player[]
  onPlayerDrop: (playerId: string, pitchPosition: string) => void
  onPlayerRemove: (playerId: string) => void
}

interface PitchPosition {
  id: string
  x: number
  y: number
  label: string
}

export function FootballPitch({ players, onPlayerDrop, onPlayerRemove }: FootballPitchProps) {
  const [draggedOver, setDraggedOver] = useState<string | null>(null)

  // Professional 3-5-2 formation - shifted left by 20px
  const pitchPositions: PitchPosition[] = [
    // Goalkeeper
    { id: 'gk', x: 39.5, y: 15, label: 'GK' },
    
    // Centre Backs (3)
    { id: 'cb1', x: 20.5, y: 35, label: 'RCB' },
    { id: 'cb2', x: 39.5, y: 28, label: 'CB' },
    { id: 'cb3', x: 57.5, y: 35, label: 'LCB' },
    
    // Wing Backs
    { id: 'lm', x: 15, y: 58, label: 'LM' },
    { id: 'rm', x: 64, y: 58, label: 'RM' },
    
    // Central Midfield (2)
    { id: 'dm', x: 39.5, y: 42, label: 'DM' },
    { id: 'cm1', x: 29, y: 55, label: 'RCM' },
    { id: 'cm2', x: 50, y: 55, label: 'LCM' },
    
    // Strikers (2)
    { id: 'st1', x: 29, y: 74, label: 'RS' },
    { id: 'st2', x: 50, y: 74, label: 'LS' },
  ]

  // Substitute positions on the right side
  const substitutePositions = [
    { id: 'sub1', x: 78, y: 16, label: 'S1' },
    { id: 'sub2', x: 78, y: 28, label: 'S2' },
    { id: 'sub3', x: 78, y: 40, label: 'S3' },
    { id: 'sub4', x: 78, y: 52, label: 'S4' },
    { id: 'sub5', x: 78, y: 66, label: 'S5' },
    { id: 'sub6', x: 78, y: 78, label: 'S6' },
    { id: 'sub7', x: 78, y: 90, label: 'S7' },
  ]

  // Squad players positions - next to subs with horizontal spacing
  const squadPlayersOnPitch = players.filter(p => p.pitch_position === 'squad')
  const squadPositions = squadPlayersOnPitch.map((_, index) => ({
    id: `squad_${index}`,
    x: 92,
    y: 16 + (index * 12),
    label: 'SQ'
  }))

  const getPlayerAtPitchPosition = (pitchPosition: string) => {
    return players.find(p => p.pitch_position === pitchPosition)
  }

  const getSquadPlayerByIndex = (index: number) => {
    return squadPlayersOnPitch[index]
  }

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      playerId: player.id,
      fromPosition: player.pitch_position
    }))
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, positionId: string) => {
    e.preventDefault()
    setDraggedOver(positionId)
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (e: React.DragEvent, targetPitchPosition: string) => {
    e.preventDefault()
    setDraggedOver(null)
    
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'))
    const { playerId, fromPosition } = dragData
    
    // Find the player currently at target position
    const targetPlayer = getPlayerAtPitchPosition(targetPitchPosition)
    
    if (targetPlayer) {
      // Swap positions - move target player to dragged player's original position
      onPlayerDrop(targetPlayer.id, fromPosition)
    }
    
    // Move dragged player to target position
    onPlayerDrop(playerId, targetPitchPosition)
  }

  const handleSquadDrop = (e: React.DragEvent, squadIndex: number) => {
    e.preventDefault()
    setDraggedOver(null)
    
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'))
    const { playerId, fromPosition } = dragData
    
    // Find the squad player at this index
    const targetSquadPlayer = squadPlayersOnPitch[squadIndex]
    
    if (targetSquadPlayer && targetSquadPlayer.id !== playerId) {
      // Swap positions
      onPlayerDrop(targetSquadPlayer.id, fromPosition)
    }
    
    // Move dragged player to squad
    onPlayerDrop(playerId, 'squad')
  }

  const getFitnessColor = (fitness: string) => {
    switch (fitness) {
      case 'green': return '#22C55E'
      case 'orange': return '#F97316'
      case 'red': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const renderPlayerPosition = (pos: PitchPosition, isSubstitute = false) => {
    const player = getPlayerAtPitchPosition(pos.id)
    const isHighlighted = draggedOver === pos.id
    
    return (
      <div
        key={pos.id}
        className="absolute"
        style={{ 
          left: `${pos.x}%`, 
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onDragOver={(e) => handleDragOver(e, pos.id)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleDrop(e, pos.id)}
      >
        {player ? (
          <div 
            className="flex flex-col items-center group cursor-move"
            draggable
            onDragStart={(e) => handleDragStart(e, player)}
          >
            {/* Player Circle */}
            <div className="relative">
              <div 
                className={`${isSubstitute ? 'w-12 h-12' : 'w-12 h-12'} rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-200 ${
                  isHighlighted 
                    ? 'scale-110 border-yellow-400' 
                    : 'border-white hover:scale-105'
                }`}
                style={{ 
                  backgroundColor: player.fitness === 'red' ? '#DC2626' : 
                                 player.fitness === 'orange' ? '#EA580C' : 
                                 isSubstitute ? '#8B5CF6' : '#2563EB',
                  borderColor: isHighlighted ? '#FCD34D' : '#FFFFFF'
                }}
              >
                <span className={`text-white font-bold ${isSubstitute ? 'text-xs' : 'text-xs'}`}>
                  {player.name.split(' ')[1]?.[0] || player.name[0]}
                </span>
              </div>
              
              {/* Remove button - only show on hover */}
              <button
                onClick={() => onPlayerRemove(player.id)}
                className={`absolute -top-1 -right-1 ${isSubstitute ? 'w-4 h-4' : 'w-4 h-4'} bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700`}
              >
                ×
              </button>
            </div>
            
            {/* Player Name */}
            <div className={`mt-0.5 px-1 py-0.5 bg-black/60 rounded text-white font-medium text-center whitespace-nowrap backdrop-blur-sm ${isSubstitute ? 'text-xs' : 'text-xs'}`}>
              {isSubstitute ? player.name.split(' ')[1] || player.name.split(' ')[0] : player.name.split(' ')[1]}
            </div>
            
            {/* Fitness indicator */}
            <div 
              className={`rounded-full mt-0.5 ${isSubstitute ? 'w-1.5 h-1.5' : 'w-1.5 h-1.5'}`}
              style={{ backgroundColor: getFitnessColor(player.fitness) }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Empty position */}
            <div className={`${isSubstitute ? 'w-12 h-12' : 'w-12 h-12'} rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isHighlighted 
                ? 'scale-110 border-yellow-400 bg-yellow-400/20' 
                : 'border-white/50 hover:border-white/80 hover:bg-white/10'
            }`}>
              <span className={`text-white/70 font-medium ${isSubstitute ? 'text-xs' : 'text-xs'}`}>
                {pos.label}
              </span>
            </div>
            
            <div className={`mt-0.5 px-1 py-0.5 bg-black/40 rounded text-white/60 font-medium text-center ${isSubstitute ? 'text-xs' : 'text-xs'}`}>
              Empty
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderSquadPlayer = (player: Player, index: number) => {
    const squadPos = squadPositions[index]
    if (!squadPos) return null
    
    const isHighlighted = draggedOver === `squad_${index}`
    
    return (
      <div
        key={`squad_${index}`}
        className="absolute"
        style={{ 
          left: `${squadPos.x}%`, 
          top: `${squadPos.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
        onDragOver={(e) => handleDragOver(e, `squad_${index}`)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => handleSquadDrop(e, index)}
      >
        <div 
          className="flex flex-col items-center group cursor-move"
          draggable
          onDragStart={(e) => handleDragStart(e, player)}
        >
          {/* Player Circle */}
          <div className="relative">
            <div 
              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all duration-200 ${
                isHighlighted 
                  ? 'scale-110 border-yellow-400' 
                  : 'border-white hover:scale-105'
              }`}
              style={{ 
                backgroundColor: player.fitness === 'red' ? '#DC2626' : 
                               player.fitness === 'orange' ? '#EA580C' : '#6B7280',
                borderColor: isHighlighted ? '#FCD34D' : '#FFFFFF'
              }}
            >
              <span className="text-white font-bold text-xs">
                {player.name.split(' ')[1]?.[0] || player.name[0]}
              </span>
            </div>
          </div>
          
          {/* Player Name */}
          <div className="mt-0.5 px-1 py-0.5 bg-black/60 rounded text-white font-medium text-center whitespace-nowrap backdrop-blur-sm text-xs">
            {player.name.split(' ')[1] || player.name.split(' ')[0]}
          </div>
          
          {/* Fitness indicator */}
          <div 
            className="rounded-full mt-0.5 w-1 h-1"
            style={{ backgroundColor: getFitnessColor(player.fitness) }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Professional Football Pitch - shifted left */}
      <div className="flex-1 relative bg-gradient-to-b from-green-600 to-green-700 rounded-lg shadow-2xl border border-green-500/30">
        
        {/* Pitch Markings - shifted left by 20px */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 300 330"
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: 'none' }}
        >
          {/* Outer pitch boundary - shifted left */}
          <rect 
            x="0" 
            y="15" 
            width="220" 
            height="300" 
            fill="none" 
            stroke="white" 
            strokeWidth="3"
            opacity="0.9"
          />
          
          {/* Center line */}
          <line 
            x1="0" 
            y1="165" 
            x2="220" 
            y2="165" 
            stroke="white" 
            strokeWidth="2.5"
            opacity="0.8"
          />
          
          {/* Center spot */}
          <circle 
            cx="110" 
            cy="165" 
            r="2" 
            fill="white"
            opacity="0.9"
          />
          
          {/* Penalty areas */}
          <rect 
            x="35" 
            y="15" 
            width="150" 
            height="55" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5"
            opacity="0.8"
          />
          
          <rect 
            x="35" 
            y="260" 
            width="150" 
            height="55" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5"
            opacity="0.8"
          />
          
          {/* Goal areas */}
          <rect 
            x="70" 
            y="15" 
            width="80" 
            height="20" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
            opacity="0.8"
          />
          
          <rect 
            x="70" 
            y="295" 
            width="80" 
            height="20" 
            fill="none" 
            stroke="white" 
            strokeWidth="2"
            opacity="0.8"
          />
        
        </svg>

        {/* Main pitch positions */}
        {pitchPositions.map((pos) => renderPlayerPosition(pos, false))}

        {/* Substitute positions */}
        {substitutePositions.map((pos) => renderPlayerPosition(pos, true))}
        
        {/* Squad players */}
        {squadPlayersOnPitch.map((player, index) => renderSquadPlayer(player, index))}
      </div>
    </div>
  )
}