import { motion } from 'framer-motion'

const menuItems = [
  { id: 'match', label: 'Match', icon: '📊' },
  { id: 'opponent', label: 'Opponent', icon: '🎯' },
  { id: 'recruitment', label: 'Recruitment', icon: '🔍' }
]

export const Sidebar = () => {
  return (
    <motion.aside 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-48 bg-[#04122D] fixed left-0 top-14 h-[calc(100vh-3.5rem)]
                 border-r border-white/10"
    >
      <nav className="py-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm
                     text-white/70 hover:text-white hover:bg-white/5
                     transition-colors duration-200"
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </motion.aside>
  )
}