import { motion } from 'framer-motion'

interface HeaderProps {
  selectedTeam: string
  onTeamChange: (team: string) => void
  teams: string[]
}

export const Header = ({ selectedTeam, onTeamChange, teams }: HeaderProps) => {
  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-14 bg-[#EEEEEE] fixed top-0 right-0 left-0 z-10 
                 flex items-center justify-between px-6 border-b border-gray-200"
    >
      <img src="/image.png" alt="Company Logo" className="h-14 w-auto" />
      <div>
        <select 
          value={selectedTeam}
          onChange={(e) => onTeamChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-lg px-3 py-1.5
                   text-gray-800 text-sm font-medium cursor-pointer
                   hover:border-blue-400 focus:border-blue-400 focus:outline-none
                   focus:ring-2 focus:ring-blue-100
                   transition-all duration-200"
        >
          <option value="" className="text-gray-500">Select a team</option>
          {teams.map(team => (
            <option 
              key={team} 
              value={team} 
              className="text-gray-800"
            >
              {team}
            </option>
          ))}
        </select>
      </div>
    </motion.header>
  )
}