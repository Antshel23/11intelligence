import { motion } from 'framer-motion'

interface TeamSelectorProps {
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  teams: string[];
}

export const TeamSelector = ({ selectedTeam, onTeamChange, teams }: TeamSelectorProps) => {
    return (
      <select 
        value={selectedTeam}
        onChange={(e) => onTeamChange(e.target.value)}
        className="bg-purple-600 border border-white/20 rounded-lg px-4 py-2
                 text-white text-sm font-medium cursor-pointer min-w-[200px]
                 hover:bg-white/15 hover:border-white/30
                 focus:border-white/30 focus:outline-none
                 focus:ring-2 focus:ring-white/10
                 transition-all duration-200"
      >
        <option value="" disabled className="bg-[#04122D] text-white/70">
          Select a team
        </option>
        {teams.map(team => (
          <option 
            key={team} 
            value={team} 
            className="bg-[#04122D] text-white"
          >
            {team}
          </option>
        ))}
      </select>
    )
  }