import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart } from '../components/charts/BarChart'
import { GaugeChart } from '../components/charts/GaugeChart'
import { processData, getValue, getPercentileRank } from '../utils/dataProcessor'
import type { TeamStats } from '../utils/dataProcessor'
import { TeamSelector } from '../components/common/TeamSelector'

function OppositionView() {
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

  const sections = {
    buildUp: {
      title: "Build Up",
      color: "#7406B5",
      metrics: selectedTeamData ? [
        { 
          name: "Long Ball", 
          value: getValue(selectedTeamData, 'Long pass %'),
          percentile: getPercentileRank(selectedTeamData, 'Long pass %')
        },
        { 
          name: "Progressive Passes", 
          value: getValue(selectedTeamData, 'Total progressive passes'),
          percentile: getPercentileRank(selectedTeamData, 'Total progressive passes')
        },
        { 
          name: "Final Third Entries", 
          value: getValue(selectedTeamData, 'Total final third passes'),
          percentile: getPercentileRank(selectedTeamData, 'Total final third passes')
        },
        { 
          name: "Possession", 
          value: getValue(selectedTeamData, 'Possession'),
          percentile: getPercentileRank(selectedTeamData, 'Possession')
        }
      ] : []
    },
    chanceCreation: {
      title: "Chance Creation",
      color: "#D50033",
      metrics: selectedTeamData ? [
        { 
          name: "Expected Goals", 
          value: getValue(selectedTeamData, 'xG'),
          percentile: getPercentileRank(selectedTeamData, 'xG')
        },
        { 
          name: "Box entry via cross", 
          value: getValue(selectedTeamData, 'Box entry via cross'),
          percentile: getPercentileRank(selectedTeamData, 'Box entry via cross')
        },
        { 
          name: "Box entry via run", 
          value: getValue(selectedTeamData, 'Box entry via run'),
          percentile: getPercentileRank(selectedTeamData, 'Box entry via run')
        },
        { 
          name: "Goals", 
          value: getValue(selectedTeamData, 'Goals'),
          percentile: getPercentileRank(selectedTeamData, 'Goals')
        }
      ] : []
    },
    press: {
      title: "Press",
      color: "#1C79D1",
      metrics: selectedTeamData ? [
        { 
          name: "High Recoveries", 
          value: getValue(selectedTeamData, 'High recoveries'),
          percentile: getPercentileRank(selectedTeamData, 'High recoveries')
        },
        { 
          name: "Med Recoveries", 
          value: getValue(selectedTeamData, 'Med recoveries'),
          percentile: getPercentileRank(selectedTeamData, 'Med recoveries')
        },
        { 
          name: "Press Success", 
          value: getValue(selectedTeamData, 'Oppo Progressive pass success %'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo Progressive pass success %')
        },
        { 
          name: "PPDA", 
          value: getValue(selectedTeamData, 'PPDA'),
          percentile: getPercentileRank(selectedTeamData, 'PPDA')
        }
      ] : []
    },
    block: {
      title: "Block",
      color: "#1A988B",
      metrics: selectedTeamData ? [
        { 
          name: "Blocks", 
          value: getValue(selectedTeamData, 'Oppo xG'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo xG')
        },
        { 
          name: "Interceptions", 
          value: getValue(selectedTeamData, 'Interceptions'),
          percentile: getPercentileRank(selectedTeamData, 'Interceptions')
        },
        { 
          name: "Clearances", 
          value: getValue(selectedTeamData, 'Clearances'),
          percentile: getPercentileRank(selectedTeamData, 'Clearances')
        },
        { 
          name: "Aerial Duels Won", 
          value: getValue(selectedTeamData, 'Aerial duels won %'),
          percentile: getPercentileRank(selectedTeamData, 'Aerial duels won %')
        }
      ] : []
    }
  }

  const getSectionRating = (metrics: any[]) => {
    if (!metrics.length) return 0
    return Math.round(
      metrics.reduce((acc, metric) => acc + metric.percentile, 0) / metrics.length
    )
  }

  return (
    <div className="flex flex-col space-y-8">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-[60vh]"
          >
            <div className="text-lg text-white/60">Loading...</div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center h-[60vh]"
          >
            <div className="text-lg text-red-400">{error}</div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex flex-col space-y-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header Panel */}
            <motion.div 
              className="stat-panel p-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium text-white/90">
                  Opposition Summary: {selectedTeam || 'Select a team'}
                </h2>
                <TeamSelector 
                  selectedTeam={selectedTeam}
                  onTeamChange={setSelectedTeam}
                  teams={data.map(d => d.team)}
                />
              </div>
            </motion.div>

            {/* Stat Panels Grid */}
            <div className="grid grid-cols-2 gap-8">
              {Object.entries(sections).map(([key, section], index) => (
                <motion.div 
                  key={key}
                  className="stat-panel p-5"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-white/90 flex-1">
                      {section.title}
                    </h3>
                    <div className="flex items-center justify-center h-12 w-12">
                      <GaugeChart 
                        value={getSectionRating(section.metrics)}
                        title=""
                        color={section.color}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  <BarChart
                    data={section.metrics}
                    color={section.color}
                    height={240}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OppositionView