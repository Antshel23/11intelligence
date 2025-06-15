import { motion, AnimatePresence } from 'framer-motion'
import { RadarChart } from '../components/charts/RadarChart'
import { BarChart } from '../components/charts/BarChart'
import { usePlayerData } from '../hooks/data/usePlayerData'
import { getValue, getPercentileRank } from '../utils/processors/playerDataProcessor'
import { PlayerSelector } from '../components/common/PlayerSelector'

// MANUAL STAT PANEL ASSIGNMENTS - EDIT THESE TO CHANGE WHICH STATS GO IN EACH PANEL
const PANEL_STATS = {
  'CB': {
    panel1: ["Defensive duels won, %", "Successful defensive actions per 90", "PAdj Interceptions", "Aerial duels won, %"],
    panel2: ["xA per 90", "xG per 90", "xA/shot assist", "xG/shot"],
    panel3: ["Progressive runs per 90", "Successful dribbles per 90", "Progressive passes per 90", "Passes to final third per 90"],
    panel4: ["Accurate progressive passes, %", "Accurate passes to final third, %", "Accurate long passes, %", "Accurate short / medium passes, %"]
  },
  'FB': {
    panel1: ["Defensive duels won, %", "Successful defensive actions per 90", "PAdj Interceptions", "Aerial duels won, %"],
    panel2: ["xA per 90", "xA/shot assist", "Shot assists per 90", "Through passes per 90"],
    panel3: ["Progressive runs per 90", "Successful dribbles per 90", "Progressive passes per 90", "Passes to final third per 90"],
    panel4: ["Accurate progressive passes, %", "Accurate passes to final third, %", "Accurate long passes, %", "Accurate short / medium passes, %"]
  },
  'CM': {
    panel1: ["Defensive duels won, %", "Successful defensive actions per 90", "PAdj Interceptions", "Aerial duels won, %"],
    panel2: ["xA per 90", "xG per 90", "Deep completions per 90", "Shot assists per 90"],
    panel3: ["Progressive passes per 90", "Passes to final third per 90", "Accurate progressive passes, %", "Accurate passes to final third, %"],
    panel4: ["Progressive runs per 90", "Successful dribbles per 90", "Passes to penalty area per 90", "Through passes per 90"]
  },
  'WIDE': {
    panel1: ["Defensive duels won, %", "Successful defensive actions per 90", "PAdj Interceptions", "Aerial duels won, %"],
    panel2: ["xG per 90", "xG performance", "xG/shot", "Touches in box per 90"],
    panel3: ["xA per 90", "Deep completions per 90", "Shot assists per 90", "Passes to penalty area per 90"],
    panel4: ["Progressive runs per 90", "Successful dribbles per 90", "Accelerations per 90", "Fouls suffered per 90"]
  },
  'FW': {
    panel1: ["Defensive duels won, %", "Successful defensive actions per 90", "PAdj Interceptions", "Aerial duels won, %"],
    panel2: ["xG per 90", "xG performance", "xG/shot", "Touches in box per 90"],
    panel3: ["Accurate short / medium passes, %", "Aerial duels per 90", "Progressive runs per 90", "Successful dribbles per 90",],
    panel4: [ "xA per 90", "Deep completions per 90", "Shot assists per 90", "Through passes per 90"]
  }
}

// STAT DISPLAY NAMES - EDIT THESE TO CHANGE HOW STATS APPEAR ON THE FRONTEND
const STAT_DISPLAY_NAMES = {
  "Defensive duels won, %": "Duel Success",
  "Successful defensive actions per 90": "Defensive Activity",
  "PAdj Interceptions": "Interceptions",
  "Aerial duels won, %": "Aerial Success",
  "xA per 90": "Expected Assists",
  "xG per 90": "Expected Goals",
  "xA/shot assist": "Avg Chance Qual Made",
  "xG/shot": "Avg Chance Qual",
  "Through passes per 90": "Through Balls",
  "Progressive runs per 90": "Prog Carries",
  "Successful dribbles per 90": "Successful Dribbles",
  "Progressive passes per 90": "Prog Passes",
  "Passes to final third per 90": "Final 3rd Passes",
  "Accurate progressive passes, %": "Prog Pass Success",
  "Accurate passes to final third, %": "Final 3rd Pass Success",
  "Accurate long passes, %": "Long Pass Success",
  "Accurate short / medium passes, %": "Short Pass Success",
  "Deep completions per 90": "Combinations in high 10",
  "Passes to penalty area per 90": "Passes into Box",
  "xG performance": "Finishing Performance",
  "Touches in box per 90": "Touches in Box",
  "Accelerations per 90": "Accelerations",
  "Fouls suffered per 90": "Fouls Suffered",
  "Shot assists per 90": "Shot Assists",
  "Aerial duels per 90": "Aerial Activity"
}

function PlayerView() {
  const { data, selectedPlayer, setSelectedPlayer, isLoading, error, players } = usePlayerData()

  // Get position-specific panel titles
  const getPanelTitles = (position: string) => {
    const category = getPositionCategory(position)
    
    const panelTitles = {
      'CB': {
        panel1: "Defensive",
        panel2: "Final Third",
        panel3: "Progression",
        panel4: "Passing"
      },
      'FB': {
        panel1: "Defensive",
        panel2: "Final Third", 
        panel3: "Progression",
        panel4: "Passing"
      },
      'CM': {
        panel1: "Defensive",
        panel2: "Final Third",
        panel3: "Deep Progression",
        panel4: "High Progression"
      },
      'WIDE': {
        panel1: "Defensive",
        panel2: "Finishing",
        panel3: "Chance Creation",
        panel4: "1v1"
      },
      'FW': {
        panel1: "Defensive",
        panel2: "Finishing",
        panel3: "Link Up",
        panel4: "Creation"
      }
    }
    
    return panelTitles[category] || panelTitles['MF']
  }

  // Get position-specific stats
  const getPositionCategory = (position: string): keyof typeof PANEL_STATS => {
    const positionMap: { [key: string]: keyof typeof PANEL_STATS } = {
      'CB': 'CB', 'LCB': 'CB', 'RCB': 'CB',
      'FB': 'FB', 'LB': 'FB', 'RB': 'FB', 'LWB': 'FB', 'RWB': 'FB',
      'CM': 'CM', 'CDM': 'CM', 'CAM': 'CM',
      'WIDE': 'WIDE', 'RM': 'WIDE', 'LW': 'WIDE', 'RW': 'WIDE',
      'FW': 'FW', 'CF': 'FW', 'LF': 'FW', 'RF': 'FW'
    }
    return positionMap[position.toUpperCase()] || 'CM'
  }

  const getPanelStats = (position: string, panel: 'panel1' | 'panel2' | 'panel3' | 'panel4') => {
    const category = getPositionCategory(position)
    return PANEL_STATS[category][panel] || []
  }

  const getStatData = (statNames: string[]) => {
    if (!selectedPlayer) return []
    
    const samePositionPlayers = data.filter(p => p.position === selectedPlayer.position)
    
    return statNames.map(statName => ({
      name: STAT_DISPLAY_NAMES[statName] || statName, // Use display name if available
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
                    src="/DWFC.png" 
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

{/* Four Stat Panels in 2x2 Grid */}
{selectedPlayer ? (
  <div className="grid grid-cols-2 gap-6">
    {/* Panel 1 - Top Left */}
    <motion.div 
      className="stat-panel p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      style={{ minHeight: '280px' }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-red-500 to-transparent" />
      <div className="mb-4 relative z-10">
        <h3 className="text-lg font-medium text-white/90">
          {getPanelTitles(selectedPlayer.position).panel1}
        </h3>
      </div>
      <div className="relative z-10">
        <BarChart
          data={getStatData(getPanelStats(selectedPlayer.position, 'panel1'))}
          color="#EF4444"
          height={180}
        />
      </div>
    </motion.div>

    {/* Panel 2 - Top Right */}
    <motion.div 
      className="stat-panel p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ minHeight: '280px' }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-blue-500 to-transparent" />
      <div className="mb-4 relative z-10">
        <h3 className="text-lg font-medium text-white/90">
          {getPanelTitles(selectedPlayer.position).panel2}
        </h3>
      </div>
      <div className="relative z-10">
        <BarChart
          data={getStatData(getPanelStats(selectedPlayer.position, 'panel2'))}
          color="#3B82F6"
          height={180}
        />
      </div>
    </motion.div>

    {/* Panel 3 - Bottom Left */}
    <motion.div 
      className="stat-panel p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      style={{ minHeight: '280px' }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-green-500 to-transparent" />
      <div className="mb-4 relative z-10">
        <h3 className="text-lg font-medium text-white/90">
          {getPanelTitles(selectedPlayer.position).panel3}
        </h3>
      </div>
      <div className="relative z-10">
        <BarChart
          data={getStatData(getPanelStats(selectedPlayer.position, 'panel3'))}
          color="#10B981"
          height={180}
        />
      </div>
    </motion.div>

    {/* Panel 4 - Bottom Right */}
    <motion.div 
      className="stat-panel p-5 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      style={{ minHeight: '280px' }}
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
      <div className="mb-4 relative z-10">
        <h3 className="text-lg font-medium text-white/90">
          {getPanelTitles(selectedPlayer.position).panel4}
        </h3>
      </div>
      <div className="relative z-10">
        <BarChart
          data={getStatData(getPanelStats(selectedPlayer.position, 'panel4'))}
          color="#8B5CF6"
          height={180}
        />
      </div>
    </motion.div>
  </div>
) : (
  <motion.div 
    className="stat-panel p-5 relative overflow-hidden flex items-center justify-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.1 }}
    style={{ minHeight: '580px', zIndex: 100 }}
  >
    <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-purple-500 to-transparent" />
    <div className="text-center relative z-10">
      <h3 className="text-xl font-medium text-white/90 mb-4">
        Select a Player
      </h3>
      <p className="text-white/70">
        Choose a player to view their position-specific performance metrics
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