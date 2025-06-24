import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { BarChart } from '../components/charts/BarChart'
import { InteractiveTable } from '../components/charts/InteractiveTable'
import { usePlayerData } from '../hooks/data/usePlayerData'
import { getValue, getPercentileRank } from '../utils/processors/playerDataProcessor'
import { PlayerSelector } from '../components/common/PlayerSelector'
import { MultiPlayerSelector } from '../components/common/MultiPlayerSelector'
import type { PlayerFilters } from '../components/common/MultiPlayerSelector'
import { ViewToggle } from '../components/common/ViewToggle'

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
  
  const [view, setView] = useState<'individual' | 'multi'>('individual')
  const [multiPlayerData, setMultiPlayerData] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

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
    
    return panelTitles[category] || panelTitles['CM']
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

  // Get all relevant stats for a position (for table columns)
  const getPositionRelevantStats = (position: string) => {
    const category = getPositionCategory(position)
    const allStats = [
      ...PANEL_STATS[category].panel1,
      ...PANEL_STATS[category].panel2,
      ...PANEL_STATS[category].panel3,
      ...PANEL_STATS[category].panel4
    ]
    // Remove duplicates and return unique stats
    return [...new Set(allStats)]
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

// Update the handlePlayerSearch function to prevent duplicates:

const handlePlayerSearch = async (filters: PlayerFilters) => {
  setIsSearching(true)
  try {
    // Filter players based on ALL the search criteria
    let filteredPlayers = data.filter(player => {
      // Check season match (REQUIRED)
      if (filters.season && player.season !== filters.season) {
        return false
      }
      
      // Check league match (REQUIRED)  
      if (filters.league && player.league !== filters.league) {
        return false
      }
      
      // Check position match (REQUIRED)
      if (filters.position && player.position !== filters.position) {
        return false
      }
      
      // Check team match (OPTIONAL - only filter if team is specified)
      if (filters.team && player.team !== filters.team) {
        return false
      }
      
      return true
    })

    // Remove duplicates based on unique player identification
    const uniquePlayers = filteredPlayers.filter((player, index, self) => {
      return index === self.findIndex(p => 
        p.name === player.name && 
        p.team === player.team && 
        p.season === player.season &&
        p.league === player.league
      )
    })

    console.log('Original filtered players:', filteredPlayers.length)
    console.log('Unique players:', uniquePlayers.length)

    // Get position-specific stats for the table
    const positionStats = getPositionRelevantStats(filters.position)
    
    // Transform to table format with position-specific stats
    const tableData = uniquePlayers.map((player, index) => {
      // Create a more unique ID using multiple player properties
      const uniqueId = `${player.name}-${player.team}-${player.season}-${player.league}-${index}`
      
      const baseData = {
        id: uniqueId, // Use the unique ID
        name: player.name,
        team: player.team,
        position: player.position,
        season: player.season,
        league: player.league
      }

      // Add position-specific stats dynamically
      const positionSpecificData: any = {}
      positionStats.forEach(statName => {
        const key = statName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
        const value = getValue(player, statName)
        const percentile = getPercentileRank(player, statName, uniquePlayers) // Use unique players for percentile calculation
        
        positionSpecificData[key] = {
          value: value,
          percentile: percentile,
          displayName: STAT_DISPLAY_NAMES[statName] || statName,
          originalName: statName,
          formatted: typeof value === 'number' ? 
            (statName.includes('%') ? `${value.toFixed(1)}%` : value.toFixed(2)) : 
            value
        }
      })

      return {
        ...baseData,
        ...positionSpecificData,
        rating: Math.round((
          getPercentileRank(player, positionStats[0], uniquePlayers) +
          getPercentileRank(player, positionStats[1], uniquePlayers) +
          getPercentileRank(player, positionStats[2], uniquePlayers)
        ) / 3)
      }
    })

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    console.log('Final table data:', tableData.length)
    setMultiPlayerData(tableData)
  } catch (error) {
    console.error('Error searching players:', error)
  } finally {
    setIsSearching(false)
  }
}

  // Generate dynamic table columns based on position
 // Replace the getTableColumns function with this corrected version:

// Generate dynamic table columns based on position
const getTableColumns = () => {
  if (multiPlayerData.length === 0) return []

  const baseColumns = [
    { key: 'name', label: 'Player', sortable: true },
    { key: 'team', label: 'Team', sortable: true },
  ]

  // Get the first player to determine position and stats
  const firstPlayer = multiPlayerData[0]
  const positionStats = getPositionRelevantStats(firstPlayer.position)
  
  // Create columns for position-specific stats (limit to 6 for table width)
  const statColumns = positionStats.map(statName => {
    const key = statName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const displayName = STAT_DISPLAY_NAMES[statName] || statName
    
    return {
      key: key,
      label: displayName,
      sortable: true,
      format: (statObject: any) => {
        if (!statObject) return 'N/A'
        
        // If it's already a formatted string, return it
        if (statObject.formatted) return statObject.formatted
        
        // Otherwise try to format the value
        const value = statObject.value
        if (typeof value === 'number') {
          if (statName.includes('%')) {
            return `${value.toFixed(1)}%`
          }
          return value.toFixed(2)
        }
        
        return value || 'N/A'
      }
    }
  })

  return [...baseColumns, ...statColumns]
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
                {/* Left Side - Logo, Title, and Toggle */}
                <div className="flex items-center space-x-6">
                    <div>
                  </div>
                  
                  <ViewToggle view={view} onViewChange={setView} />
                </div>

                {/* Center - Player Info (only in individual view) */}
                {view === 'individual' && selectedPlayer && (
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

                {/* Right Side - Selector */}
                <div style={{ zIndex: 10001 }}>
                  {view === 'individual' ? (
                    <PlayerSelector 
                      selectedPlayer={selectedPlayer}
                      onPlayerChange={setSelectedPlayer}
                      players={players}
                    />
                  ) : (
                    <MultiPlayerSelector 
                      onSearch={handlePlayerSearch}
                      loading={isSearching}
                      players={players}
                    />
                  )}
                </div>
              </div>
            </motion.div>

            {/* Individual View Content */}
            {view === 'individual' && (
              <>
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
              </>
            )}

            {/* Multi View Content */}
            {view === 'multi' && (
              <motion.div 
                className="stat-panel p-5 relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ minHeight: '500px' }}
              >
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-gradient-to-br from-green-500 to-transparent" />
                
                <div className="relative z-10">
                  {isSearching ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-white/60">Searching players...</div>
                    </div>
                  ) : multiPlayerData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <div className="text-white/60 text-center">
                        <div className="text-lg mb-2">No players found</div>
                        <div className="text-sm">Use the "Find Players" button to search for players by position, league, and season</div>
                      </div>
                    </div>
                  ) : (
                    <InteractiveTable
                      data={multiPlayerData}
                      columns={getTableColumns()}
                      title={`${multiPlayerData[0]?.position || 'Player'} Statistical Comparison`}
                      color="#10B981"
                      height={650}
                    />
                  )}
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