import { motion, AnimatePresence } from 'framer-motion'
import { StackedBarChart } from '../components/charts/StackedBarChart'
import { LineChart } from '../components/charts/LineChart'
import { useMatchData } from '../hooks/data/useMatchData'
import { MatchSelector } from '../components/common/MatchSelector'
import { getValue, getOppositionValue } from '../utils/processors/matchDataProcessor'

function ProgressView() {
  const { data, selectedMatch, setSelectedMatch, isLoading, error, matches } = useMatchData()

  // Find selected match data using the match object instead of ID
  const selectedMatchData = selectedMatch

  // Calculate xPoints running average
  const xPointsData = data
    .sort((a, b) => a.matchId - b.matchId)
    .map((match, index) => {
      const xPoints = getValue(match, "Dorking Wanderers", "xPoints")
      const runningTotal = data
        .filter(m => m.matchId <= match.matchId)
        .reduce((sum, m) => sum + getValue(m, "Dorking Wanderers", "xPoints"), 0)
      const runningAverage = (runningTotal / (index + 1)) * 46
      
      return {
        match: match.match,
        matchId: match.matchId,
        xPoints: runningAverage
      }
    })

  const getStatsComparison = () => {
    if (!selectedMatchData) return []

    return [
      {
        name: "Possession %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Possession"),
        opposition: getOppositionValue(selectedMatchData, "Possession")
      },
      {
        name: "xG",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "xG"),
        opposition: getOppositionValue(selectedMatchData, "xG")
      },
      {
        name: "Pass Accuracy %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Pass accuracy %"),
        opposition: getOppositionValue(selectedMatchData, "Pass accuracy %")
      },
      {
        name: "Aerial Duel Success %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Aerial duel success %"),
        opposition: getOppositionValue(selectedMatchData, "Aerial duel success %")
      },
      {
        name: "Progressive Pass Success %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Progressive pass success %"),
        opposition: getOppositionValue(selectedMatchData, "Progressive pass success %")
      }
    ]
  }

  const statsComparison = getStatsComparison()

  return (
    <div className="flex flex-col space-y-6 p-6 relative" style={{ zIndex: 1 }}>
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
            className="flex flex-col space-y-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* Header Panel */}
            <motion.div 
              className="stat-panel p-4 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ zIndex: 10000 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                {/* Left Side - Logo and Title */}
                <div className="flex items-center">
                  <img 
                    src="/DWFC.png" 
                    alt="Team Logo" 
                    className="h-16 w-16 mr-6"
                  />
                  <div>
                    <div className="text-2xl font-medium text-[#EFEFEF]">
                      Progress View
                    </div>
                    <div className="text-sm text-white/60">
                      Match Analysis & Season Progression
                    </div>
                  </div>
                </div>

                {/* Center - Match Info */}
                {selectedMatchData && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-center">
                      <div className="text-lg font-medium text-[#EFEFEF]">
                        {selectedMatchData.match}
                      </div>
                      <div className="text-sm text-white/60">
                        {selectedMatchData.home === 'h' ? 'Home' : 'Away'} • {selectedMatchData.date}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Side - Match Selector */}
                <div style={{ zIndex: 10001 }}>
                  <MatchSelector 
                    selectedMatch={selectedMatch}
                    onMatchChange={setSelectedMatch}
                    matches={matches}
                  />
                </div>
              </div>
            </motion.div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Match Comparison Panel - Takes 2 columns on large screens */}
              <motion.div 
                className="lg:col-span-2 stat-panel p-5 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
                
                <div className="mb-4 relative z-10">
                  <h3 className="text-lg font-medium text-white/90">
                    Match Comparison
                  </h3>
                  <div className="text-sm text-white/60 mt-1">
                    Dorking Wanderers vs Opposition
                  </div>
                </div>
                <div className="relative z-10">
                  {statsComparison.length > 0 ? (
                    <StackedBarChart
                      data={statsComparison}
                      height={350}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-white/40">
                      Select a match to view comparison
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Season Progression Panel - Takes 1 column on large screens */}
              <motion.div 
                className="lg:col-span-1 stat-panel p-5 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-green-500 to-transparent" />
                
                <div className="mb-4 relative z-10">
                  <h3 className="text-lg font-medium text-white/90">
                    Season Progression
                  </h3>
                  <div className="text-sm text-white/60 mt-1">
                    Expected Points (46 game projection)
                  </div>
                </div>
                <div className="relative z-10">
                  {xPointsData.length > 0 ? (
                    <LineChart
                      data={xPointsData}
                      height={350}
                      color="#10B981"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[350px] text-white/40">
                      No progression data available
                    </div>
                  )}
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProgressView