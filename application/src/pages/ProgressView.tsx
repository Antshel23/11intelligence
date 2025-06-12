import { motion, AnimatePresence } from 'framer-motion'
import { StackedBarChart } from '../components/charts/StackedBarChart'
import { LineChart } from '../components/charts/LineChart'
import { useMatchData } from '../hooks/data/useMatchData'
import { MatchSelector } from '../components/common/MatchSelector'
import { getValue, getOppositionValue } from '../utils/processors/matchDataProcessor'
import { useMemo } from 'react'

function ProgressView() {
  const { data, selectedMatch, setSelectedMatch, isLoading, error, matches } = useMatchData()
  const selectedMatchData = selectedMatch

  // Sort data by matchId ascending
  const sortedData = useMemo(() => [...data].sort((a, b) => a.matchId - b.matchId), [data])

  // xPoints running average (projected to 46 games)
  const xPointsData = sortedData.map((match, index) => {
    const xPoints = getValue(match, "Dorking Wanderers", "xPoints")
    const runningTotal = sortedData
      .filter(m => m.matchId <= match.matchId)
      .reduce((sum, m) => sum + getValue(m, "Dorking Wanderers", "xPoints"), 0)
    const runningAverage = (runningTotal / (index + 1)) * 46
    return {
      match: match.match,
      matchId: match.matchId,
      value: runningAverage
    }
  })

  // Helper to get last N matches for rolling average
  const rollingWindow = 5

  // xG Difference (5-game rolling average)
  const xgDiffData = sortedData.map((match, index) => {
    const windowStart = Math.max(0, index - rollingWindow + 1)
    const windowMatches = sortedData.slice(windowStart, index + 1)
    const sum = windowMatches.reduce(
      (acc, m) => acc + (getValue(m, "Dorking Wanderers", "xG") - getOppositionValue(m, "xG")),
      0
    )
    return {
      match: match.match,
      matchId: match.matchId,
      value: sum / windowMatches.length
    }
  })

  // Progressive Pass Success Difference (5-game rolling average)
  const progPassDiffData = sortedData.map((match, index) => {
    const windowStart = Math.max(0, index - rollingWindow + 1)
    const windowMatches = sortedData.slice(windowStart, index + 1)
    const sum = windowMatches.reduce(
      (acc, m) => acc + (getValue(m, "Dorking Wanderers", "Progressive pass success %") - getOppositionValue(m, "Progressive pass success %")),
      0
    )
    return {
      match: match.match,
      matchId: match.matchId,
      value: sum / windowMatches.length
    }
  })

  // xG Performance (5-game rolling average)
  const xgPerfData = sortedData.map((match, index) => {
    const windowStart = Math.max(0, index - rollingWindow + 1)
    const windowMatches = sortedData.slice(windowStart, index + 1)
    const sum = windowMatches.reduce(
      (acc, m) => acc + ((getValue(m, "Dorking Wanderers", "Goals") - getValue(m, "Dorking Wanderers", "xG")) - (getOppositionValue(m, "Goals") - getOppositionValue(m, "xG"))),
      0
    )
    return {
      match: match.match,
      matchId: match.matchId,
      value: sum / windowMatches.length
    }
  })

  // --- Match Comparison Section Stats ---

  // Helper for box entries
  const getBoxEntries = (dataObj: any, team: string) =>
    getValue(dataObj, team, "Box entry via run") +
    getValue(dataObj, team, "Box entry via cross") +
    getValue(dataObj, team, "Deep completed passes")


  // Helper for intensity
  const getIntensity = (dataObj: any, team: string, oppTeam: string) => {
    const defDuels = getValue(dataObj, team, "Total Def duels")
    const oppPasses = getValue(dataObj, oppTeam, "Total passes")
    const totalGamePasses = getValue(dataObj, team, "Total passes") + oppPasses
    const totalDefDuels = defDuels + getValue(dataObj, oppTeam, "Total Def duels")
    const totalIntensity = totalDefDuels / totalGamePasses

    return (defDuels / oppPasses) / totalIntensity*100
  }

  // Final Third Section
  const getFinalThirdStats = () => {
    if (!selectedMatchData) return []
    const dorkingBoxEntries = getBoxEntries(selectedMatchData, "Dorking Wanderers")
    const oppBoxEntries = getBoxEntries(selectedMatchData, "Opposition")
    return [
      {
        name: "xG",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "xG"),
        opposition: getOppositionValue(selectedMatchData, "xG")
      },
      {
        name: "xG per box entry",
        dorking: dorkingBoxEntries ? getValue(selectedMatchData, "Dorking Wanderers", "xG") / dorkingBoxEntries : 0,
        opposition: oppBoxEntries ? getOppositionValue(selectedMatchData, "xG") / oppBoxEntries : 0
      },

      {
        name: "Open play shots",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Positional attacks leading to shot"),
        opposition: getOppositionValue(selectedMatchData, "Positional attacks leading to shot")
      },
      {
        name: "Box entries",
        dorking: dorkingBoxEntries,
        opposition: oppBoxEntries
      },
      {
        name: "Box entry via cross",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Box entry via cross"),
        opposition: getOppositionValue(selectedMatchData, "Box entry via cross")
      },
      {
        name: "Box entry via run",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Box entry via run"),
        opposition: getOppositionValue(selectedMatchData, "Box entry via run")
      },
      {
        name: "Deep completed passes",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Deep completed passes"),
        opposition: getOppositionValue(selectedMatchData, "Deep completed passes")
      }
    ]
  }

  // Progression Section
  const getProgressionStats = () => {
    if (!selectedMatchData) return []
    return [
      {
        name: "Possession %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Possession"),
        opposition: getOppositionValue(selectedMatchData, "Possession")
      },
      {
        name: "Progressive pass success %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Progressive pass success %"),
        opposition: getOppositionValue(selectedMatchData, "Progressive pass success %")
      },
      {
        name: "Total final third entries",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Successful final third passes"),
        opposition: getOppositionValue(selectedMatchData, "Successful final third passes")
      },
      {
        name: "Open play attacks",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Total positional attacks"),
        opposition: getOppositionValue(selectedMatchData, "Total positional attacks")
      },
    ]
  }

  // Press Section
  const getPressStats = () => {
    if (!selectedMatchData) return []
    return [
      {
        name: "High regains",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "High recoveries"),
        opposition: getOppositionValue(selectedMatchData, "High recoveries")
      },
      {
        name: "Def duel success %",
        dorking: getValue(selectedMatchData, "Dorking Wanderers", "Def duel success %"),
        opposition: getOppositionValue(selectedMatchData, "Def duel success %")
      },
      {
        name: "Intensity",
        dorking: getIntensity(selectedMatchData, "Dorking Wanderers", "Opposition"),
        opposition: getIntensity(selectedMatchData, "Opposition", "Dorking Wanderers")
      }
    ]
  }

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

            {/* Main Split Layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              
              {/* Left: Match Comparison Panel (full height) */}
              <motion.div 
                className="lg:w-2/3 stat-panel p-5 relative overflow-hidden flex-shrink-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ minHeight: '700px' }}
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
                <div className="relative z-10 flex flex-row h-full">
                  {/* Final Third Section */}
                  <div className="flex-1 flex flex-col pr-6 border-r border-white/15">
                    <div className="font-semibold text-white/80 mb-2">Final Third</div>
                    <StackedBarChart
                      data={getFinalThirdStats()}
                      height={320}
                    />
                  </div>
                  {/* Progression Section */}
                  <div className="flex-1 flex flex-col px-6 border-r border-white/15">
                    <div className="font-semibold text-white/80 mb-2">Progression</div>
                    <StackedBarChart
                      data={getProgressionStats()}
                      height={180}
                    />
                  </div>
                  {/* Press Section */}
                  <div className="flex-1 flex flex-col pl-6">
                    <div className="font-semibold text-white/80 mb-2">Press</div>
                    <StackedBarChart
                      data={getPressStats()}
                      height={140}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Right: 5 stacked time series charts */}
              <div className="lg:w-1/3 flex flex-col gap-4">
                {/* xPts */}
                <motion.div className="stat-panel p-4 relative overflow-hidden flex-1 min-h-[120px]">
                  <div className="mb-2 text-white/80 font-medium text-sm">Expected Points Projection</div>
                  <LineChart
                    data={xPointsData.map(d => ({ match: d.match, matchId: d.matchId, value: d.value }))}
                    height={90}
                    color="#10B981"
                    currentValue={
                      xPointsData.length
                        ? xPointsData.reduce((sum, d) => sum + d.value, 0) / xPointsData.length
                        : undefined
                    }
                    currentValueLabel="Overall avg"
                    valueSuffix=" pts"
                  />
                </motion.div>
                {/* xG Difference */}
                <motion.div className="stat-panel p-4 relative overflow-hidden flex-1 min-h-[120px]">
                  <div className="mb-2 text-white/80 font-medium text-sm">xG Difference (Creating and Preventing Chances)</div>
                  <LineChart
                    data={xgDiffData}
                    height={90}
                    color="#3B82F6"
                    currentValue={
                      xgDiffData.length
                        ? xgDiffData.reduce((sum, d) => sum + d.value, 0) / xgDiffData.length
                        : undefined
                    }
                    currentValueLabel="Overall avg"
                  />
                </motion.div>
                {/* Progressive Pass Success Difference */}
                <motion.div className="stat-panel p-4 relative overflow-hidden flex-1 min-h-[120px]">
                  <div className="mb-2 text-white/80 font-medium text-sm">Progression Control (Buildup and Press)</div>
                  <LineChart
                    data={progPassDiffData}
                    height={90}
                    color="#F59E42"
                    currentValue={
                      progPassDiffData.length
                        ? progPassDiffData.reduce((sum, d) => sum + d.value, 0) / progPassDiffData.length
                        : undefined
                    }
                    currentValueLabel="Overall avg"
                  />
                </motion.div>
                {/* xG Performance */}
                <motion.div className="stat-panel p-4 relative overflow-hidden flex-1 min-h-[120px]">
                  <div className="mb-2 text-white/80 font-medium text-sm">xG Performance (Finishing and Stopping Chances)</div>
                  <LineChart
                    data={xgPerfData}
                    height={90}
                    color="#EF4444"
                    currentValue={
                      xgPerfData.length
                        ? xgPerfData.reduce((sum, d) => sum + d.value, 0) / xgPerfData.length
                        : undefined
                    }
                    currentValueLabel=""
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProgressView