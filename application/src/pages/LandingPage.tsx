import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FeatureCard } from '../components/navigation/FeatureCard'

function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      title: "Opposition",
      description: "Analyze opposition team performance, tactics, and key metrics",
      color: "#7406B5",
      icon: "🎯",
      route: "/opposition"
    },
    {
      title: "Player",
      description: "Individual player statistics and performance analysis",
      color: "#D50033",
      icon: "👤",
      route: "/player"
    },
    {
      title: "Squad",
      description: "Complete squad overview and team composition insights",
      color: "#1C79D1",
      icon: "👥",
      route: "/squad"
    },
    {
      title: "Progress",
      description: "Track team and player development over time",
      color: "#1A988B",
      icon: "📈",
      route: "/progress"
    }
  ]

  return (
    <div className="min-h-screen bg-[#181D21] flex flex-col items-center justify-center px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Analytics Dashboard
        </h1>
        <p className="text-lg text-white/70">
          Choose a feature to explore team and player insights
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <FeatureCard
              {...feature}
              onClick={() => navigate(feature.route)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default LandingPage