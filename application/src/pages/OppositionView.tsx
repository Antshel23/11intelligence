import { motion, AnimatePresence } from 'framer-motion'
import { BarChart } from '../components/charts/BarChart'
import { GaugeChart } from '../components/charts/GaugeChart'
import { useTeamData } from '../hooks/data/useTeamData'
import { getValue, getPercentileRank } from '../utils/processors/teamDataProcessor'
import { TeamSelector } from '../components/common/TeamSelector'

function OppositionView() {
  const { data, selectedTeam, setSelectedTeam, isLoading, error, teams } = useTeamData()

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
          name: "xG against", 
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
          name: "Aerial Success", 
          value: getValue(selectedTeamData, 'Aerial duel success %'),
          percentile: getPercentileRank(selectedTeamData, 'Aerial duel success %')
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
  className="stat-panel p-2.5"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* Single Row Layout */}
  <div className="flex items-center justify-between">
    {/* Left Side - Logo and Team Name */}
    <div className="flex items-center">
      <img 
        src="/img400400.png" 
        alt="Team Logo" 
        className="h-16 w-16 mr-6"
      />
      <div className="text-2xl font-medium text-[#EFEFEF]">
        {selectedTeam || 'Select a team'}
      </div>
    </div>

    {/* Center - Overall Ratings */}
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-8">
      {Object.entries(sections).map(([key, section]) => (
        <div key={key} className="flex flex-col items-center">
          <div className="h-10 w-20 mb--1">
            <GaugeChart 
              value={getSectionRating(section.metrics)}
              title=""
              color={section.color}
              className="w-full h-full text-center"
            />
          </div>
          <div className="text-xs text-[#EFEFEF] text-center">
            {section.title}
          </div>
        </div>
      ))}
    </div>

    {/* Right Side - Team Selector */}
    <TeamSelector 
      selectedTeam={selectedTeam}
      onTeamChange={setSelectedTeam}
      teams={teams}
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
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-white/90">
                      {section.title}
                    </h3>
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