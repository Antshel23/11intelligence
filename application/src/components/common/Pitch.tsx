import React from 'react'
import type { PlayerPosition } from '../../types'

interface PitchProps {
  starters: PlayerPosition[]
  matchTitle: string
  matchDate: string
}

export const Pitch: React.FC<PitchProps> = ({ starters, matchTitle, matchDate }) => {
  // Function to spread player positions for better visibility
  const spreadPosition = (value: number, center: number = 50, spreadFactor: number = 1.3) => {
    // Calculate distance from center
    const distanceFromCenter = value - center
    // Apply spread factor and add back to center
    const spreadValue = center + (distanceFromCenter * spreadFactor)
    // Clamp to ensure positions stay within reasonable bounds (10-90%)
    return Math.max(10, Math.min(90, spreadValue))
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Match Info */}
      <div className="text-center mb-2">
        <div className="text-xs font-medium text-white/90">{matchTitle}</div>
        <div className="text-xs text-white/50">{matchDate}</div>
      </div>

      {/* Pitch Container - Takes up remaining space with proper aspect ratio */}
      <div className="relative bg-green-800/20 border border-white/20 rounded-sm flex-1 min-h-0" style={{ aspectRatio: '3/2' }}>
        
        {/* Pitch Markings */}
        <svg 
          className="absolute inset-0 w-full h-full" 
          viewBox="0 0 300 200"
          preserveAspectRatio="xMidYMid meet"
          style={{ pointerEvents: 'none' }}
        >
          {/* Outer boundary */}
          <rect 
            x="0" 
            y="0" 
            width="300" 
            height="200" 
            fill="none" 
            stroke="white" 
            strokeWidth="2" 
            opacity="0.4"
          />
          
          {/* Center Circle */}
          <circle 
            cx="150" 
            cy="100" 
            r="25" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.3"
          />
          
          {/* Center Line */}
          <line 
            x1="150" 
            y1="0" 
            x2="150" 
            y2="200" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.3"
          />
          
          {/* Center spot */}
          <circle 
            cx="150" 
            cy="100" 
            r="2" 
            fill="white" 
            opacity="0.4"
          />
          
          {/* Left Penalty Area */}
          <rect 
            x="0" 
            y="65" 
            width="44" 
            height="70" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.3"
          />
          
          {/* Right Penalty Area */}
          <rect 
            x="256" 
            y="65" 
            width="44" 
            height="70" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.3"
          />
          
          {/* Left Goal Area */}
          <rect 
            x="0" 
            y="82" 
            width="15" 
            height="36" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.3"
          />
          
          {/* Right Goal Area */}
          <rect 
            x="285" 
            y="82" 
            width="15" 
            height="36" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.3"
          />
          
          {/* Left penalty spot */}
          <circle 
            cx="33" 
            cy="100" 
            r="2" 
            fill="white" 
            opacity="0.4"
          />
          
          {/* Right penalty spot */}
          <circle 
            cx="267" 
            cy="100" 
            r="2" 
            fill="white" 
            opacity="0.4"
          />
        </svg>

        {/* Players */}
        {starters.map((player) => {
          // Flip both X and Y axes to correct the coordinate system
          const flippedX = player.averageX  // Flip X-axis
          const flippedY = 100 - player.averageY  // Flip Y-axis
          
          // Apply spread to coordinates for better visibility
          const xPercent = spreadPosition(flippedX, 50, 1.5) // Horizontal spread
          const yPercent = spreadPosition(flippedY, 50, 1.2) // Vertical spread (less aggressive)

          return (
            <div
              key={player.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${xPercent}%`, 
                top: `${yPercent}%` 
              }}
            >
              {/* Player Name Above Circle */}
              <div className="text-[9px] text-white/90 text-center mb-0.5 font-medium whitespace-nowrap">
                {player.surname}
              </div>
              
              {/* Player Circle with Jersey Number */}
              <div className="w-3.5 h-3.5 bg-blue-500 border border-white rounded-full flex items-center justify-center">
                <span className="text-[7px] font-bold text-white leading-none">
                  {player.jersey_number === "/" ? "?" : player.jersey_number}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}