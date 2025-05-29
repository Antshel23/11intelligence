import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart } from './components/BarChart'
import { processData } from './utils/dataProcessor'
import type { TeamStats } from './utils/dataProcessor'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'

function App() {
  const [data, setData] = useState<TeamStats[]>([])
  const [selectedTeam, setSelectedTeam] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const teamData = await processData()
        console.log('Loaded teams:', teamData.map(d => d.team))
        setData(teamData)
        if (teamData.length > 0) {
          setSelectedTeam(teamData[0].team)
        }
      } catch (err) {
        setError('Failed to load team data')
        console.error('Error loading data:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const selectedTeamData = data.find(d => d.team === selectedTeam)

  const sections = [
    {
      title: "On the Ball",
      color: "#2563eb",
      metrics: selectedTeamData ? [
        { name: "Possession", value: selectedTeamData.possession },
        { name: "Progressive Pass %", value: selectedTeamData.progressivePassSuccess },
        { name: "Final Third Pass %", value: selectedTeamData.finalThirdPassSuccess }
      ] : []
    },
    {
      title: "Against the Ball",
      color: "#dc2626",
      metrics: selectedTeamData ? [
        { name: "Opp. Progressive Pass %", value: selectedTeamData.opponentProgressivePassSuccess },
        { name: "Opp. Final Third Pass %", value: selectedTeamData.opponentFinalThirdPassSuccess },
        { name: "Aerial Duel Success %", value: selectedTeamData.aerialDuelSuccess },
        { name: "PPDA", value: selectedTeamData.ppda }
      ] : []
    },
    {
      title: "Summary",
      color: "#ca8a04",
      metrics: selectedTeamData ? [
        { name: "xG", value: selectedTeamData.xG },
        { name: "Opponent xG", value: selectedTeamData.opponentXG }
      ] : []
    }
  ]

  const renderContent = () => (
    <div className="min-h-screen bg-[#04122D]">
      <Header 
        selectedTeam={selectedTeam}
        onTeamChange={setSelectedTeam}
        teams={data.map(d => d.team)}
      />
      <Sidebar />
      <main className="ml-48 pt-20 px-6 pb-8">
        <AnimatePresence>
          {selectedTeam ? (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {sections.map(section => (
                  <motion.section
                    key={section.title}
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-5
                             border border-white/10 hover:border-white/20
                             transition-colors duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-lg font-medium text-white/90 mb-4">
                      {section.title}
                    </h2>
                    <BarChart
                      data={section.metrics}
                      color={section.color}
                      height={section.metrics.length * 50 + 40}
                    />
                  </motion.section>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-[60vh]"
            >
              <h2 className="text-lg text-white/60">
                Select a team to view analytics
              </h2>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#04122D] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg text-white/80"
        >
          Loading data...
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#04122D] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-lg text-red-400"
        >
          {error}
        </motion.div>
      </div>
    )
  }

  return renderContent()
}

export default App