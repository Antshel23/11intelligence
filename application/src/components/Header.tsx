import { motion } from 'framer-motion'
import { RiTeamLine, RiFootballLine, RiUserLine } from 'react-icons/ri'

interface HeaderProps {
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ selectedTab, onTabChange }: HeaderProps) => {
  const navItems = [
    { icon: RiTeamLine, label: 'Opposition', id: 'opposition' },
    { icon: RiFootballLine, label: 'Match', id: 'match' },
    { icon: RiUserLine, label: 'Player', id: 'player' },
  ]

  return (
    <motion.header 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-14 bg-[#EEEEEE] fixed top-0 right-0 left-0 z-10 
                 flex items-center justify-between px-6 border-b border-gray-200"
    >
      <div className="flex items-center">
        <img src="/image.png" alt="Company Logo" className="h-14 w-auto" />
      </div>

      {/* Navigation Items moved to right */}
      <nav className="flex items-center space-x-2">
        {navItems.map((item, index) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg
                       text-sm font-medium transition-all duration-200
                       ${selectedTab === item.id
                         ? 'bg-blue-50 text-blue-600' 
                         : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <item.icon className={`w-5 h-5 ${selectedTab === item.id ? 'text-blue-600' : 'text-gray-500'}`} />
            <span>{item.label}</span>
          </motion.button>
        ))}
      </nav>
    </motion.header>
  )
}