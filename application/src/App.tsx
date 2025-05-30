import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart } from './components/BarChart'
import { processData, getValue, getPercentileRank } from './utils/dataProcessor'
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
      title: "Attacking",
      color: "#2563eb",
      metrics: selectedTeamData ? [
        { 
          name: "Goals", 
          value: getValue(selectedTeamData, 'Goals'),
          percentile: getPercentileRank(selectedTeamData, 'Goals')
        },
        { 
          name: "Expected Goals", 
          value: getValue(selectedTeamData, 'xG'),
          percentile: getPercentileRank(selectedTeamData, 'xG')
        },
        { 
          name: "Total Shots", 
          value: getValue(selectedTeamData, 'Total shots'),
          percentile: getPercentileRank(selectedTeamData, 'Total shots')
        }
      ] : []
    },
    {
      title: "Shooting Efficiency",
      color: "#dc2626",
      metrics: selectedTeamData ? [
        { 
          name: "Shots on Target", 
          value: getValue(selectedTeamData, 'Shots on target'),
          percentile: getPercentileRank(selectedTeamData, 'Shots on target')
        },
        { 
          name: "SOT %", 
          value: getValue(selectedTeamData, 'SOT %'),
          percentile: getPercentileRank(selectedTeamData, 'SOT %')
        },
      ] : []
    },
    {
      title: "Passing",
      color: "#ca8a04",
      metrics: selectedTeamData ? [
        { 
          name: "Total Passes", 
          value: getValue(selectedTeamData, 'Total passes'),
          percentile: getPercentileRank(selectedTeamData, 'Total passes')
        },
        { 
          name: "Accurate Passes", 
          value: getValue(selectedTeamData, 'Accurate passes'),
          percentile: getPercentileRank(selectedTeamData, 'Accurate passes')
        },
        { 
          name: "Pass Accuracy", 
          value: getValue(selectedTeamData, 'Pass accuracy %'),
          percentile: getPercentileRank(selectedTeamData, 'Pass accuracy %')
        },
        {
          name: "Passes per 90",
          value: getValue(selectedTeamData, 'Total passes'),
          percentile: getPercentileRank(selectedTeamData, 'Total passes')
        }
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
      <main className="ml-48 pt-20 px-8 pb-8">
        <AnimatePresence>
          {selectedTeam ? (
            <motion.div 
              className="space-y-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid gap-8 grid-cols-1">
                {sections.map(section => (
                  <motion.section
                    key={section.title}
                    className="bg-white/5 backdrop-blur-sm rounded-lg p-6
                             border border-white/10 hover:border-white/20
                             transition-colors duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className="text-xl font-medium text-white/90 mb-6">
                      {section.title}
                    </h2>
                    <BarChart
                      data={section.metrics}
                      color={section.color}
                      height={section.metrics.length * 60 + 40}
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