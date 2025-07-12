import { useState } from 'react'
import { Player } from '../../pages/SquadView'

interface SquadListProps {
  players: Player[]
  onFitnessChange: (playerId: string, fitness: 'red' | 'orange' | 'green') => void
  onPositionChange: (playerId: string, position: string) => void
}

interface DragPreviewProps {
  player: Player
  fitness: 'red' | 'orange' | 'green'
}

const DragPreview = ({ player, fitness }: DragPreviewProps) => {
  const getFitnessColor = (fitness: string) => {
    switch (fitness) {
      case 'green': return 'bg-green-500'
      case 'orange': return 'bg-orange-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-white text-xs font-bold mb-1 text-center whitespace-nowrap bg-black/30 px-2 py-0.5 rounded">
        {player.name.split(' ')[0]}
      </div>
      <div className="w-10 h-10 bg-blue-600 border-2 border-white rounded-full flex flex-col items-center justify-center">
        <div className={`w-2 h-2 rounded-full ${getFitnessColor(fitness)} mb-0.5`}></div>
        <span className="text-white text-xs font-bold">
          {player.position}
        </span>
      </div>
    </div>
  )
}

export function SquadList({ players, onFitnessChange, onPositionChange }: SquadListProps) {
  const [editingPlayer, setEditingPlayer] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'fitness' | 'position' | null>(null)
  const [dragPreview, setDragPreview] = useState<Player | null>(null)

  const positions = ['GK', 'DEF', 'MID', 'FWD', 'WIDE']
  const fitnessLevels: ('red' | 'orange' | 'green')[] = ['red', 'orange', 'green']

  const handleDragStart = (e: React.DragEvent, player: Player) => {
    e.dataTransfer.setData('text/plain', player.id)
    e.dataTransfer.effectAllowed = 'move'
    
    // Create custom drag image
    const dragElement = document.createElement('div')
    dragElement.style.position = 'absolute'
    dragElement.style.top = '-1000px'
    dragElement.style.pointerEvents = 'none'
    document.body.appendChild(dragElement)
    
    // Set custom drag image
    e.dataTransfer.setDragImage(dragElement, 25, 25)
    
    // Clean up after a brief delay
    setTimeout(() => {
      document.body.removeChild(dragElement)
    }, 0)
    
    setDragPreview(player)
  }

  const handleDragEnd = () => {
    setDragPreview(null)
  }

  const getFitnessColor = (fitness: string) => {
    switch (fitness) {
      case 'green': return 'bg-green-500'
      case 'orange': return 'bg-orange-500'
      case 'red': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getFitnessLabel = (fitness: string) => {
    switch (fitness) {
      case 'green': return 'Available'
      case 'orange': return 'Minor'
      case 'red': return 'Unavailable'
      default: return 'Unknown'
    }
  }

  const getPitchPositionLabel = (pitchPosition: string) => {
    if (pitchPosition === 'squad') return 'Squad'
    if (pitchPosition === 'sub') return 'Substitute'
    return pitchPosition.toUpperCase()
  }

  const getPitchPositionColor = (pitchPosition: string) => {
    if (pitchPosition === 'squad') return 'bg-gray-500/20 text-gray-400'
    if (pitchPosition === 'sub') return 'bg-purple-500/20 text-purple-400'
    return 'bg-green-500/20 text-green-400'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="bg-white/5 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-white/10 sticky top-0">
              <tr>
                <th className="text-left text-white font-semibold py-1.5 px-2 text-xs">Name</th>
                <th className="text-left text-white font-semibold py-1.5 px-2 text-xs">Pitch Position</th>
                <th className="text-left text-white font-semibold py-1.5 px-2 text-xs">Position</th>
                <th className="text-left text-white font-semibold py-1.5 px-2 text-xs">Fitness</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr
                  key={player.id}
                  className="border-b border-white/10 hover:bg-white/5 cursor-move"
                  draggable
                  onDragStart={(e) => handleDragStart(e, player)}
                  onDragEnd={handleDragEnd}
                >
                  <td className="py-1.5 px-2">
                    <span className="text-white font-medium text-xs">{player.name}</span>
                  </td>
                  
                  <td className="py-1.5 px-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getPitchPositionColor(player.pitch_position)}`}>
                      {getPitchPositionLabel(player.pitch_position)}
                    </span>
                  </td>
                  
                  <td className="py-1.5 px-2">
                    {editingPlayer === player.id && editingField === 'position' ? (
                      <select
                        value={player.position}
                        onChange={(e) => {
                          onPositionChange(player.id, e.target.value)
                          setEditingPlayer(null)
                          setEditingField(null)
                        }}
                        onBlur={() => {
                          setEditingPlayer(null)
                          setEditingField(null)
                        }}
                        className="bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs"
                        autoFocus
                      >
                        {positions.map(pos => (
                          <option key={pos} value={pos}>{pos}</option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="text-blue-400 hover:text-blue-300 cursor-pointer text-xs"
                        onClick={() => {
                          setEditingPlayer(player.id)
                          setEditingField('position')
                        }}
                      >
                        {player.position}
                      </span>
                    )}
                  </td>
                  
                  <td className="py-1.5 px-2">
                    {editingPlayer === player.id && editingField === 'fitness' ? (
                      <select
                        value={player.fitness}
                        onChange={(e) => {
                          onFitnessChange(player.id, e.target.value as 'red' | 'orange' | 'green')
                          setEditingPlayer(null)
                          setEditingField(null)
                        }}
                        onBlur={() => {
                          setEditingPlayer(null)
                          setEditingField(null)
                        }}
                        className="bg-gray-700 text-white px-1.5 py-0.5 rounded text-xs"
                        autoFocus
                      >
                        {fitnessLevels.map(level => (
                          <option key={level} value={level}>
                            {getFitnessLabel(level)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className="flex items-center space-x-1.5 cursor-pointer hover:opacity-80"
                        onClick={() => {
                          setEditingPlayer(player.id)
                          setEditingField('fitness')
                        }}
                      >
                        <div className={`w-2.5 h-2.5 rounded-full ${getFitnessColor(player.fitness)}`}></div>
                        <span className="text-white text-xs">{getFitnessLabel(player.fitness)}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Drag Preview */}
      {dragPreview && (
        <div 
          className="fixed pointer-events-none z-50 opacity-80"
          style={{ 
            left: '-1000px', 
            top: '-1000px' 
          }}
        >
          <DragPreview player={dragPreview} fitness={dragPreview.fitness} />
        </div>
      )}
    </div>
  )
}