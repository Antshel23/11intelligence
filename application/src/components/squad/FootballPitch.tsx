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
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Professional 3-5-2 formation - shifted left by 20px
  const pitchPositions: PitchPosition[] = [
    // Goalkeeper
    { id: 'gk', x: 39.5, y: 11, label: 'GK' },
    
    // Centre Backs (3) - more spread out
    { id: 'cb1', x: 19, y: 32, label: 'RCB' },
    { id: 'cb2', x: 39.5, y: 26, label: 'CB' },
    { id: 'cb3', x: 60, y: 32, label: 'LCB' },
    
    // Wing Backs - wider spacing
    { id: 'rm', x: 14, y: 55, label: 'RM' },
    { id: 'lm', x: 64, y: 55, label: 'LM' },
    
    // Central Midfield (2) - more spread
    { id: 'dm', x: 39.5, y: 42, label: 'DM' },
    { id: 'cm1', x: 29, y: 58, label: 'RCM' },
    { id: 'cm2', x: 50, y: 58, label: 'LCM' },
    
    // Strikers (2) - wider spacing
    { id: 'st1', x: 29, y: 75, label: 'RS' },
    { id: 'st2', x: 50, y: 75, label: 'LS' },
  ]
  
  // Substitute positions - more spaced out vertically
  const substitutePositions = [
    { id: 'sub1', x: 78, y: 9, label: 'S1' },
    { id: 'sub2', x: 78, y: 23, label: 'S2' },
    { id: 'sub3', x: 78, y: 37, label: 'S3' },
    { id: 'sub4', x: 78, y: 51, label: 'S4' },
    { id: 'sub5', x: 78, y: 65, label: 'S5' },
    { id: 'sub6', x: 78, y: 79, label: 'S6' },
    { id: 'sub7', x: 78, y: 93, label: 'S7' },
  ]

  // Squad players positions - next to subs with horizontal spacing
  const squadPlayersOnPitch = players.filter(p => p.pitch_position === 'squad')
  const squadPositions = squadPlayersOnPitch.map((_, index) => ({
    id: `squad_${index}`,
    x: 92,
    y: 12 + (index * 14), // Increased spacing from 12 to 14
    label: 'SQ'
  }))

  const getPlayerAtPitchPosition = (pitchPosition: string) => {
    return players.find(p => p.pitch_position === pitchPosition)
  }

  const getSquadPlayerByIndex = (index: number) => {
    return squadPlayersOnPitch[index]
  }

  const getPlayerImagePath = (playerName: string) => {
    return `/player_logos/${playerName}.webp`
  }

  const handleImageError = (playerId: string) => {
    setImageErrors(prev => new Set(prev).add(playerId))
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

  const renderPlayerCircle = (player: Player, size: string, isSubstitute: boolean, isHighlighted: boolean) => {
    const hasImageError = imageErrors.has(player.id)
    const imagePath = getPlayerImagePath(player.name)
    
    return (
      <div 
        className={`${size} rounded-full border-00 flex items-center justify-center transition-all duration-200 overflow-hidden ${
          isHighlighted 
            ? 'scale-110 border-yellow-400' 
            : 'border-white hover:scale-105'
        }`}
        style={{ 
          backgroundColor: hasImageError ? (
            player.fitness === 'red' ? '#DC2626' : 
            player.fitness === 'orange' ? '#EA580C' : 
            isSubstitute ? '#8B5CF6' : '#2563EB'
          ) : 'transparent',
          borderColor: isHighlighted ? '#FCD34D' : '#FFFFFF'
        }}
      >
        {!hasImageError ? (
          <img
            src={imagePath}
            alt={player.name}
            className="w-full h-full object-cover rounded-full"
            style={{
              objectPosition: 'center -60%',
              transform: 'scale(1.3)'
            }}
            loading="lazy"
            decoding="async"
            onError={() => handleImageError(player.id)}
          />
        ) : (
          <span className={`text-white font-bold ${size === 'w-12 h-12' ? 'text-xs' : 'text-xs'}`}>
            YTH
          </span>
        )}
      </div>
    )
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
            {/* Player Circle - BIGGER SIZE */}
            <div className="relative">
              {renderPlayerCircle(player, 'w-20 h-20', isSubstitute, isHighlighted)}
              
              {/* Remove button */}
              <button
                onClick={() => onPlayerRemove(player.id)}
                className={`absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700`}
              >
                ×
              </button>
            </div>
            
            {/* Player Name */}
            <div className={`mt-1 px-2 py-1 bg-black/60 rounded text-white font-medium text-center whitespace-nowrap backdrop-blur-sm ${isSubstitute ? 'text-xs' : 'text-sm'}`}>
              {isSubstitute ? player.name.split(' ')[1] || player.name.split(' ')[0] : player.name.split(' ')[1]}
            </div>
            
            {/* Fitness indicator */}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Empty position - BIGGER SIZE */}
            <div className={`${isSubstitute ? 'w-16 h-16' : 'w-16 h-16'} rounded-full border-2 border-dashed flex items-center justify-center transition-all duration-200 cursor-pointer ${
              isHighlighted 
                ? 'scale-110 border-yellow-400 bg-yellow-400/20' 
                : 'border-white/50 hover:border-white/80 hover:bg-white/10'
            }`}>
              <span className={`text-white/70 font-medium ${isSubstitute ? 'text-sm' : 'text-sm'}`}>
                {pos.label}
              </span>
            </div>
            
            <div className={`mt-1 px-2 py-1 bg-black/40 rounded text-white/60 font-medium text-center ${isSubstitute ? 'text-xs' : 'text-sm'}`}>
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
          {/* Player Circle - BIGGER SIZE */}
          <div className="relative">
            {renderPlayerCircle(player, 'w-12 h-12', false, isHighlighted)}
          </div>
          
          {/* Player Name */}
          <div className="mt-1 px-1 py-0.5 bg-black/60 rounded text-white font-medium text-center whitespace-nowrap backdrop-blur-sm text-xs">
            {player.name.split(' ')[1] || player.name.split(' ')[0]}
          </div>
          
          {/* Fitness indicator */}
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