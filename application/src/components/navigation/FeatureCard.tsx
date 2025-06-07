import { motion } from 'framer-motion'

interface FeatureCardProps {
  title: string
  description: string
  color: string
  icon: string
  onClick: () => void
}

export function FeatureCard({ title, description, color, icon, onClick }: FeatureCardProps) {
  return (
    <motion.div
      className="stat-panel p-6 cursor-pointer group"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className="text-center">
        <div 
          className="text-4xl mb-4 p-4 rounded-full inline-block"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        <h3 
          className="text-xl font-semibold mb-3 group-hover:text-opacity-80"
          style={{ color }}
        >
          {title}
        </h3>
        <p className="text-white/70 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}