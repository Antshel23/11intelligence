import { motion } from 'framer-motion'
import type { MatchData } from '../../types'

interface MatchSelectorProps {
  selectedMatch: MatchData | null
  onMatchChange: (match: MatchData) => void
  matches: MatchData[]
}

export const MatchSelector = ({ selectedMatch, onMatchChange, matches }: MatchSelectorProps) => {
  return (
    <select 
      value={selectedMatch?.matchId || ''}
      onChange={(e) => {
        const match = matches.find(m => m.matchId === parseInt(e.target.value))
        if (match) onMatchChange(match)
      }}
      className="bg-purple-600 border border-white/20 rounded-lg px-4 py-2
               text-white text-sm font-medium cursor-pointer min-w-[200px]
               hover:bg-white/15 hover:border-white/30
               focus:border-white/30 focus:outline-none
               focus:ring-2 focus:ring-white/10
               transition-all duration-200"
    >
      <option value="" disabled className="bg-[#04122D] text-white/70">
        Select a match
      </option>
      {matches.map(match => (
        <option 
          key={match.matchId} 
          value={match.matchId} 
          className="bg-[#04122D] text-white"
        >
          {match.match} - {match.home === 'h' ? 'Home' : 'Away'}
        </option>
      ))}
    </select>
  )
}