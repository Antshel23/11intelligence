import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart } from '../components/charts/RadarChart'
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
              style={{ zIndex: 1000 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-blue-500/10 pointer-events-none" />
              
              <div className="flex items-center justify-between relative z-10">
                {/* Left Side - Logo and Title */}
                <div className="flex items-center">
                  <img 
                    src="/TUFC.png" 
                    alt="Team Logo" 
                    className="h-16 w-16 mr-6"
                  />
                  <div>
                    <div className="text-2xl font-medium text-[#EFEFEF]">
                      Player Analysis
                    </div>
                    <div className="text-sm text-white/60">
                      Position-Specific Performance Profile
                    </div>
                  </div>
                </div>

                {/* Center - Player Info */}
                {selectedPlayer && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-center">
                      <div className="text-lg font-medium text-[#EFEFEF]">
                        {selectedPlayer.name}
                      </div>
                      <div className="text-sm text-white/60">
                        {selectedPlayer.position} • {selectedPlayer.team}
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Side - Player Selector */}
                <div style={{ zIndex: 999999 }}>
                  <PlayerSelector 
                    selectedPlayer={selectedPlayer}
                    onPlayerChange={setSelectedPlayer}
                    players={players}
                  />
                </div>
              </div>
            </motion.div>

            {/* Main Content Panel */}
            {selectedPlayer ? (
              <motion.div 
                className="stat-panel p-5 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ minHeight: '700px', zIndex: 100 }}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
                <div className="mb-4 relative z-10">
                  <h3 className="text-lg font-medium text-white/90">
                    Performance Radar
                  </h3>
                  <div className="text-sm text-white/60 mt-1">
                    Percentile rankings vs {getPositionCategory(selectedPlayer.position)} players
                  </div>
                </div>
                <div className="relative z-10 flex justify-center">
                  <RadarChart
                    data={getRadarData()}
                    height={500}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                className="stat-panel p-5 relative overflow-hidden flex items-center justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ minHeight: '700px', zIndex: 100 }}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
                <div className="text-center relative z-10">
                  <h3 className="text-xl font-medium text-white/90 mb-4">
                    Select a Player
                  </h3>
                  <p className="text-white/70">
                    Choose a player to view their position-specific performance metrics and radar chart
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PlayerView