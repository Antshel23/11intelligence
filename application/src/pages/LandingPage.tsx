import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FeatureCard } from '../components/navigation/FeatureCard'

function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      title: "Opposition",
      description: "Analyze opposition lineups and key metrics",
      color: "#7406B5",
      icon: "🎯",
      route: "/opposition"
    },
    {
      title: "Player",
      description: "Individual player performance metrics",
      color: "#D50033",
      icon: "👤",
      route: "/player"
    },
    {
      title: "Progress",
      description: "Track team performance over time, including match-specific and overall trends",
      color: "#1A988B",
      icon: "📈",
      route: "/progress"
    },
    {
      title: "Coming Soon",
      description: "Sqaud Depth Planner for Recruitment & Match Planner with ability to plugin injuries and suspensions",
      color: "#ffffff",
      icon: "⏳",
      route: "/"
  }
  ]

  return (
    <div className="flex flex-col space-y-10 p-10 relative" style={{ zIndex: 1 }}>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="stat-panel p-6 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            onClick={() => navigate(feature.route)}
          >
            {/* Background gradient */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{ 
                background: `linear-gradient(135deg, ${feature.color} 0%, transparent 100%)` 
              }}
            />
            
            {/* Content */}
            <div className="relative z-10 text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-white/70">
                {feature.description}
              </p>
            </div>

            {/* Hover border effect */}
            <div 
              className="absolute inset-0 border-2 border-transparent hover:border-opacity-50 rounded transition-all duration-200"
              style={{ borderColor: feature.color }}
            />
          </motion.div>
        ))}
      </div>
              {/* Logo */}
              <div className="mb-6">
          <img 
            src="league_logos/Dorking Wanderers.png" 
            alt="Dorking Wanderers FC" 
            className="w-96 h-96 mx-auto object-contain"
          />
        </div>
    </div>
  )
}

export default LandingPage