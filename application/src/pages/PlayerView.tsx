import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart } from '../components/charts/RadarChart'
import { GaugeChart } from '../components/charts/GaugeChart'
import { usePlayerData } from '../hooks/data/usePlayerData'
import { getValue, getPercentileRank } from '../utils/processors/playerDataProcessor'
import { PlayerSelector } from '../components/common/PlayerSelector'

const POSITION_STATS = {
  'CB': ["Defensive duels won, %", "Aerial duels won, %", "PAdj Interceptions", "Progressive runs per 90", "Successful dribbles per 90", 'Progressive passes per 90', 'Passes to final third per 90', 'Accurate progressive passes, %', 'Accurate passes to final third, %', 'Accurate long passes, %'],
  'FB': ["Defensive duels won, %", "Aerial duels won, %", "PAdj Interceptions", "Progressive runs per 90", "Successful dribbles per 90", 'Progressive passes per 90', 'Passes to final third per 90', 'Accurate progressive passes, %', 'Accurate passes to final third, %', 'Dangerous attacking actions per 90'],
  'CM': ["Successful defensive actions per 90", "Progressive runs per 90", "Successful dribbles per 90", 'Progressive passes per 90', 'Passes to final third per 90', 'Accurate progressive passes, %', 'Through passes per 90', 'xA per 90', 'xG per 90', 'Dangerous attacking actions per 90'],
  'WIDE': ["Successful defensive actions per 90", "Progressive runs per 90", "Successful dribbles per 90", 'Fouls suffered per 90', 'Passes to final third per 90', 'Key passes per 90', 'xA per 90', 'xA/shot assist', 'xG per 90', 'Dangerous attacking actions per 90'],
  'FW': ['Accurate short / medium passes, %', 'Passes to penalty area per 90', "Successful dribbles per 90", 'Deep completions per 90', 'xA per 90', 'xA/shot assist', 'xG per 90', 'xG/shot', 'xG performance', 'Dangerous attacking actions per 90']
}

function PlayerView() {
  const { data, selectedPlayer, setSelectedPlayer, isLoading, error, players } = usePlayerData()

  // Get position-specific stats
  const getPositionCategory = (position: string): keyof typeof POSITION_STATS => {
    const positionMap: { [key: string]: keyof typeof POSITION_STATS } = {
      'CB': 'CB', 'LCB': 'CB', 'RCB': 'CB',
      'FB': 'FB', 'LB': 'FB', 'RB': 'FB', 'LWB': 'FB', 'RWB': 'FB',
      'CM': 'CM', 'CDM': 'CM', 'CAM': 'CM',
      'LM': 'WIDE', 'RM': 'WIDE', 'LW': 'WIDE', 'RW': 'WIDE',
      'ST': 'FW', 'CF': 'FW', 'LF': 'FW', 'RF': 'FW'
    }
    return positionMap[position.toUpperCase()] || 'CM'
  }

  const getPositionStats = (position: string): string[] => {
    const category = getPositionCategory(position)
    return POSITION_STATS[category]
  }

  const getRadarData = () => {
    if (!selectedPlayer) return []
    
    const stats = getPositionStats(selectedPlayer.position)
    const samePositionPlayers = data.filter(p => p.position === selectedPlayer.position)
    
    return stats.map(statName => ({
      name: statName,
      value: getValue(selectedPlayer, statName),
      percentile: getPercentileRank(selectedPlayer, statName, samePositionPlayers)
    }))
  }

  // Get overall rating categories
  const getOverallRatings = () => {
    if (!selectedPlayer) return {}
    
    const stats = getPositionStats(selectedPlayer.position)
    const radarData = getRadarData()
    
    // Group stats into categories based on position
    const categories = {
      technical: radarData.slice(0, Math.ceil(stats.length / 3)),
      physical: radarData.slice(Math.ceil(stats.length / 3), Math.ceil(stats.length * 2 / 3)),
      tactical: radarData.slice(Math.ceil(stats.length * 2 / 3))
    }

    return {
      technical: {
        title: "Technical",
        color: "#7406B5",
        rating: categories.technical.length ? 
          Math.round(categories.technical.reduce((acc, stat) => acc + stat.percentile, 0) / categories.technical.length) : 0
      },
      physical: {
        title: "Physical", 
        color: "#D50033",
        rating: categories.physical.length ?
          Math.round(categories.physical.reduce((acc, stat) => acc + stat.percentile, 0) / categories.physical.length) : 0
      },
      tactical: {
        title: "Tactical",
        color: "#1C79D1", 
        rating: categories.tactical.length ?
          Math.round(categories.tactical.reduce((acc, stat) => acc + stat.percentile, 0) / categories.tactical.length) : 0
      }
    }
  }

  return (
    <div className="flex flex-col space-y-8 relative z-10">
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
            className="flex flex-col space-y-8 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >

            {/* Header Panel */}
            <motion.div 
              className="stat-panel p-2.5 relative z-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Single Row Layout */}
              <div className="flex items-center justify-between">
                {/* Left Side - Logo and Player Name */}
                <div className="flex items-center">
                  <div className="h-16 w-16 mr-6 bg-white/10 rounded-full flex items-center justify-center">
                    {selectedPlayer ? (
                      <span className="text-2xl font-bold text-white/90">
                        {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    ) : (
                      <span className="text-white/50 text-sm">Select</span>
                    )}
                  </div>
                  <div>
                    <div className="text-2xl font-medium text-[#EFEFEF]">
                      {selectedPlayer?.name || 'Select a player'}
                    </div>
                    {selectedPlayer && (
                      <div className="text-sm text-white/70 mt-1">
                        {selectedPlayer.position} • {selectedPlayer.team} • {selectedPlayer.season}
                      </div>
                    )}
                  </div>
                </div>

                {/* Center - Overall Ratings */}
                {selectedPlayer && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center space-x-8">
                    {Object.entries(getOverallRatings()).map(([key, category]) => (
                      <div key={key} className="flex flex-col items-center">
                        <div className="h-10 w-20 mb-1">
                          <GaugeChart 
                            value={category.rating}
                            title=""
                            color={category.color}
                            className="w-full h-full text-center"
                          />
                        </div>
                        <div className="text-xs text-[#EFEFEF] text-center">
                          {category.title}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Right Side - Player Selector */}
                <div className="relative z-30">
                  <PlayerSelector 
                    selectedPlayer={selectedPlayer}
                    onPlayerChange={setSelectedPlayer}
                    players={players}
                  />
                </div>
              </div>
            </motion.div>

            {/* Stat Panel */}
            {selectedPlayer ? (
              <motion.div 
                className="stat-panel p-8 relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <RadarChart
                  data={getRadarData()}
                  height={500}
                />
              </motion.div>
            ) : (
              <motion.div 
                className="stat-panel p-8 text-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <h3 className="text-xl font-medium text-white/90 mb-4">
                  Player Analysis
                </h3>
                <p className="text-white/70">
                  Select a player to view their position-specific performance metrics
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PlayerView