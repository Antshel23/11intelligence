import { motion, AnimatePresence } from 'framer-motion'
import { BarChart } from '../components/charts/BarChart'
import { GaugeChart } from '../components/charts/GaugeChart'
import { useTeamData } from '../hooks/data/useTeamData'
import { useLineupData } from '../hooks/data/useLineupData'
import { getValue, getPercentileRank } from '../utils/processors/teamDataProcessor'
import { TeamSelector } from '../components/common/TeamSelector'
import { Pitch } from '../components/common/Pitch'

function OppositionView() {
  const { data, selectedTeam, setSelectedTeam, isLoading, error, teams } = useTeamData()
  const { matches: lineupMatches, isLoading: lineupLoading, error: lineupError } = useLineupData(selectedTeam)

  const selectedTeamData = data.find(d => d.team === selectedTeam)

  const sections = {
    buildUp: {
      title: "Build Up",
      color: "#7406B5",
      metrics: selectedTeamData ? [
        { 
          name: "Possession", 
          value: getValue(selectedTeamData, 'Possession'),
          percentile: getPercentileRank(selectedTeamData, 'Possession')
        },
        { 
          name: "Long Ball %", 
          value: getValue(selectedTeamData, 'Long pass %'),
          percentile: getPercentileRank(selectedTeamData, 'Long pass %')
        },
        { 
          name: "Build Up Safety" ,
          value: getValue(selectedTeamData, 'Losses low %'),
          percentile: getPercentileRank(selectedTeamData, 'Losses low %')
        },
        { 
          name: "Def/Mid 3rd Progression", 
          value: getValue(selectedTeamData, 'Progressive pass success %'),
          percentile: getPercentileRank(selectedTeamData, 'Progressive pass success %')
        },
        { 
          name: "Final 3rd Progression", 
          value: getValue(selectedTeamData, 'Final third pass success %'),
          percentile: getPercentileRank(selectedTeamData, 'Final third pass success %')
        },
        { 
          name: "Final 3rd Entries", 
          value: getValue(selectedTeamData, 'Final third entries'),
          percentile: getPercentileRank(selectedTeamData, 'Final third entries')
        },
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
          name: "Attacking Efficiency", 
          value: getValue(selectedTeamData, 'Positional attacks leading to shot %'),
          percentile: getPercentileRank(selectedTeamData, 'Positional attacks leading to shot %')
        },
        { 
          name: "Cross Threat", 
          value: getValue(selectedTeamData, 'Box entry via cross'),
          percentile: getPercentileRank(selectedTeamData, 'Box entry via cross')
        },
        { 
          name: "1v1 dribble Threat", 
          value: getValue(selectedTeamData, 'Box entry via run'),
          percentile: getPercentileRank(selectedTeamData, 'Box entry via run')
        },
        { 
          name: "10 space pass Threat", 
          value: getValue(selectedTeamData, 'Deep completed passes'),
          percentile: getPercentileRank(selectedTeamData, 'Deep completed passes')
        },
        { 
          name: "Throughball Threat", 
          value: getValue(selectedTeamData, 'Through balls'),
          percentile: getPercentileRank(selectedTeamData, 'Through balls')
        },
        { 
          name: "Counterattack Threat", 
          value: getValue(selectedTeamData, 'Total counterattacks'),
          percentile: getPercentileRank(selectedTeamData, 'Total counterattacks')
        },
        { 
          name: "Set-piece Threat", 
          value: getValue(selectedTeamData, 'Set piece shot %'),
          percentile: getPercentileRank(selectedTeamData, 'Set piece shot %')
        }
      ] : []
    },
    press: {
      title: "Press",
      color: "#1C79D1",
      metrics: selectedTeamData ? [
        { 
          name: "Press Intensity", 
          value: getValue(selectedTeamData, 'PPDA'),
          percentile: getPercentileRank(selectedTeamData, 'PPDA')
        },
        { 
          name: "Press Efficiency", 
          value: getValue(selectedTeamData, 'Oppo Progressive pass success %'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo Progressive pass success %')
        },
        { 
          name: "Att 3rd Regains", 
          value: getValue(selectedTeamData, 'Recoveries high %'),
          percentile: getPercentileRank(selectedTeamData, 'Recoveries high %')
        },
        { 
          name: "Med 3rd Regains", 
          value: getValue(selectedTeamData, 'Recoveries med %'),
          percentile: getPercentileRank(selectedTeamData, 'Recoveries med %')
        },
        { 
          name: "Transition Protection", 
          value: getValue(selectedTeamData, 'Oppo Total counterattacks'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo Total counterattacks')
        }
      ] : []
    },
    block: {
      title: "Block",
      color: "#1A988B",
      metrics: selectedTeamData ? [
        { 
          name: "Expected Goals Against", 
          value: getValue(selectedTeamData, 'Oppo xG'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo xG')
        },
        { 
          name: "Def 3rd Entry Restriction", 
          value: getValue(selectedTeamData, 'Oppo Final third pass success %'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo Final third pass success %')
        },
        { 
          name: "Chance Restriction", 
          value: getValue(selectedTeamData, 'Oppo open play attacks per final third entry'),
          percentile: getPercentileRank(selectedTeamData, 'Oppo open play attacks per final third entry')
        },
        { 
          name: "Aerial Win %", 
          value: getValue(selectedTeamData, 'Aerial duel success %'),
          percentile: getPercentileRank(selectedTeamData, 'Aerial duel success %')
        }
      ] : []
    }
  }

  const getSectionRating = (metrics: any[]) => {
    if (!metrics.length) return 0
    const percentiles = metrics.map(metric => metric.percentile).sort((a, b) => a - b)
    const middle = Math.floor(percentiles.length / 2)
    
    if (percentiles.length % 2 === 0) {
      // Even number of metrics - average of two middle values
      return Math.round((percentiles[middle - 1] + percentiles[middle]) / 2)
    } else {
      // Odd number of metrics - middle value
      return Math.round(percentiles[middle])
    }
  }

  const formatMatchDate = (timestamp: number): string => {
    return new Date(timestamp * 1000).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short' 
    })
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
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                {/* Left Side - Logo and Title */}
                <div className="flex items-center">
                  <img 
                    src={`league/${selectedTeam}.png`} 
                    alt="Team Logo" 
                    className="h-16 w-16 mr-6"
                  />
                  <div>
                    <div className="text-2xl font-medium text-[#EFEFEF]">
                      {selectedTeam}
                    </div>
                    <div className="text-sm text-white/60">
                      Opposition Profile
                    </div>
                  </div>
                </div>

                {/* Center - Overall Ratings */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-8">
                  {Object.entries(sections).map(([key, section]) => (
                    <div key={key} className="flex flex-col items-center">
                      <div className="h-10 w-20 mb-1">
                        <GaugeChart 
                          value={getSectionRating(section.metrics)}
                          title=""
                          color={section.color}
                          className="w-full h-full text-center"
                        />
                      </div>
                      <div className="text-xs text-[#EFEFEF] text-center mt-1">
                        {section.title}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Right Side - Team Selector */}
                <div style={{ zIndex: 10001 }}>
                  <TeamSelector 
                    selectedTeam={selectedTeam}
                    onTeamChange={setSelectedTeam}
                    teams={teams}
                  />
                </div>
              </div>
            </motion.div>

            {/* Lineup Container */}
            <motion.div 
              className="stat-panel p-5 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
              
              <div className="mb-4 relative z-10">
                <h3 className="text-lg font-medium text-white/90">
                  Recent Formations & Average Positions
                </h3>
                <p className="text-sm text-white/60">
                  Last 5 matches showing starter positions
                </p>
              </div>
              
              <div className="relative z-10">
                {lineupLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-white/60">Loading lineups...</div>
                  </div>
                ) : lineupError ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-red-400">Error loading lineups</div>
                  </div>
                ) : lineupMatches.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-white/60">No lineup data available</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-4">
                    {lineupMatches.slice(0, 5).map((match, index) => (
                      <div key={match.matchId} className="flex justify-center">
                        <Pitch 
                          starters={match.starters}
                          matchTitle={`vs ${match.isHome ? match.awayTeam : match.homeTeam}`}
                          matchDate={formatMatchDate(match.startTimestamp)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Stat Panels Grid */}
            <div className="grid grid-cols-2 gap-6">
              {Object.entries(sections).map(([key, section], index) => (
                <motion.div 
                  key={key}
                  className="stat-panel p-5 relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: (index + 2) * 0.1 }}
                  style={{ minHeight: '280px' }}
                >
                  <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
                  
                  <div className="mb-4 relative z-10">
                    <h3 className="text-lg font-medium text-white/90">
                      {section.title}
                    </h3>
                  </div>
                  <div className="relative z-10">
                    <BarChart
                      data={section.metrics}
                      color={section.color}
                      height={180}
                    />
                  </div>
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