import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Search, X } from 'lucide-react'
import type { Player } from '../../types'

interface MultiPlayerSelectorProps {
  onSearch: (filters: PlayerFilters) => void
  loading?: boolean
  players: Player[]
}

// Export the PlayerFilters interface
export interface PlayerFilters {
  position: string
  league: string
  season: string
  team?: string
}

const positions = [
  'CB', 'FB', 'CM', 'WIDE', 'FW'
]

export const MultiPlayerSelector: React.FC<MultiPlayerSelectorProps> = ({ 
  onSearch, 
  loading = false,
  players
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState<string>('')
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [selectedPosition, setSelectedPosition] = useState<string>('')

  // Get unique seasons, leagues, and teams - EXACT COPY from PlayerSelector
  const { seasons, leagues, teams } = useMemo(() => {
    const seasons = Array.from(new Set(players.map(p => p.season))).sort()
    const leagues = Array.from(new Set(players.map(p => p.league))).sort()
    
    // Filter teams based on selected league
    const teams = selectedLeague 
      ? Array.from(new Set(players.filter(p => p.league === selectedLeague).map(p => p.team))).sort()
      : []
    
    return { seasons, leagues, teams }
  }, [players, selectedLeague])

  const handleSearch = () => {
    if (!selectedSeason || !selectedLeague || !selectedPosition) {
      return // Don't search if required fields are empty
    }
    
    const filters: PlayerFilters = {
      position: selectedPosition,
      league: selectedLeague,
      season: selectedSeason,
      team: selectedTeam || undefined
    }
    
    onSearch(filters)
    setIsOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setSelectedSeason('')
    setSelectedLeague('')
    setSelectedTeam('')
    setSelectedPosition('')
  }

  const closeModal = () => {
    setIsOpen(false)
    resetForm()
  }

  // Reset team selection when league changes - EXACT COPY from PlayerSelector
  const handleLeagueChange = (league: string) => {
    setSelectedLeague(league)
    setSelectedTeam('') // Reset team when league changes
  }

  const canSearch = selectedSeason && selectedLeague && selectedPosition

  // Modal content to be portaled - EXACT COPY from PlayerSelector
  const modalContent = isOpen ? (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        style={{ 
          zIndex: 999998
        }}
        onClick={closeModal}
      />
      
      {/* Modal Content */}
      <div 
        className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-900 border border-white/20 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden"
        style={{
          zIndex: 999999
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Find Players</h2>
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

          {/* League Selector */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              League *
            </label>
            <select
              value={selectedLeague}
              onChange={(e) => handleLeagueChange(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select League</option>
              {leagues.map(league => (
                <option key={league} value={league} className="bg-gray-800">
                  {league}
                </option>
              ))}
            </select>
          </div>

          {/* Team Selector */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Club <span className="text-white/50">(optional)</span>
            </label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              disabled={!selectedLeague}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">{selectedLeague ? 'All Clubs' : 'Select League First'}</option>
              {teams.map(team => (
                <option key={team} value={team} className="bg-gray-800">
                  {team}
                </option>
              ))}
            </select>
          </div>

          {/* Position Selector */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Position *
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Select Position</option>
              {positions.map(position => (
                <option key={position} value={position} className="bg-gray-800">
                  {position}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        {canSearch && (
          <div className="p-6 border-t border-white/10">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-medium
                         hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed 
                         transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {loading ? 'Searching...' : 'Search Players'}
            </button>
          </div>
        )}

        {/* Instructions */}
        {!canSearch && (
          <div className="p-6 border-t border-white/10">
            <div className="text-center text-white/50 text-sm">
              Please select season, league and position to search for players
            </div>
          </div>
        )}
      </div>
    </>
  ) : null

  return (
    <>
      {/* Find Players Button */}
      <button
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="bg-purple-600 border border-white/20 rounded-lg px-4 py-2
                 text-white text-sm font-medium cursor-pointer min-w-[200px]
                 hover:bg-white/15 hover:border-white/30
                 focus:border-white/30 focus:outline-none
                 focus:ring-2 focus:ring-white/10
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transition-all duration-200"
      >
        {loading ? 'Searching...' : 'Find Players'}
      </button>

      {/* Portal the modal to document.body */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  )
}