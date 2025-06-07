import { useState, useMemo } from 'react'
import { Search, X } from 'lucide-react'
import type { Player } from '../../types'

interface PlayerSelectorProps {
  selectedPlayer: Player | null
  onPlayerChange: (player: Player | null) => void
  players: Player[]
}

export function PlayerSelector({ selectedPlayer, onPlayerChange, players }: PlayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  // Get unique seasons and teams
  const { seasons, teams } = useMemo(() => {
    const seasons = Array.from(new Set(players.map(p => p.season))).sort()
    const teams = Array.from(new Set(players.map(p => p.team))).sort()
    return { seasons, teams }
  }, [players])

  // Filter players based on season, team, and search
  const filteredPlayers = useMemo(() => {
    if (!selectedSeason || !selectedTeam) return []

    return players.filter(player => {
      const matchesSeason = player.season === selectedSeason
      const matchesTeam = player.team === selectedTeam
      const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSeason && matchesTeam && matchesSearch
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [players, selectedSeason, selectedTeam, searchTerm])

  const handlePlayerSelect = (player: Player) => {
    onPlayerChange(player)
    setIsOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedSeason('')
    setSelectedTeam('')
    setSearchTerm('')
  }

  const closeModal = () => {
    setIsOpen(false)
    resetForm()
  }

  return (
    <>
      {/* Find Player Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg 
                   transition-colors duration-200 shadow-lg hover:shadow-xl relative z-10"
      >
        Find Player
      </button>

      {/* Modal Overlay - Positioned to avoid header */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ 
              zIndex: 50,
              top: '80px' // Start below header
            }}
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div 
            className="fixed left-1/2 transform -translate-x-1/2 bg-gray-900 border border-white/20 rounded-xl shadow-2xl w-full max-w-md max-h-[calc(100vh-100px)]"
            style={{
              zIndex: 51,
              top: '90px' // Position below header with margin
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-semibold text-white">Find Player</h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              {/* Season Selector */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Season *
                </label>
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Season</option>
                  {seasons.map(season => (
                    <option key={season} value={season} className="bg-gray-800">
                      {season}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Selector */}
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Club *
                </label>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select Club</option>
                  {teams.map(team => (
                    <option key={team} value={team} className="bg-gray-800">
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search (only show if season and team selected) */}
              {selectedSeason && selectedTeam && (
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Search Players
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                                 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Player List */}
            {selectedSeason && selectedTeam && (
              <div className="border-t border-white/10">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-white/80 mb-3">
                    Available Players ({filteredPlayers.length})
                  </h3>
                </div>
                
                <div className="max-h-64 overflow-y-auto">
                  {filteredPlayers.length > 0 ? (
                    filteredPlayers.map((player, index) => (
                      <button
                        key={`${player.name}-${index}`}
                        onClick={() => handlePlayerSelect(player)}
                        className="w-full px-6 py-4 text-left hover:bg-white/5 transition-colors
                                   border-b border-white/5 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-white font-medium">{player.name}</div>
                            <div className="text-white/60 text-sm">{player.position}</div>
                          </div>
                          <div className="text-white/40 text-sm">
                            {player.team}
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-white/50">
                      No players found
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            {(!selectedSeason || !selectedTeam) && (
              <div className="p-6 border-t border-white/10">
                <div className="text-center text-white/50 text-sm">
                  Please select both season and club to see available players
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}