import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Fixture {
  id: string
  date: string // YYYY-MM-DD format
  opposition: string
  isHome: boolean
  competition: string
}

interface FixtureData {
  season: string
  team: string
  fixtures: Fixture[]
}

function LandingPage() {
  const [fixtures, setFixtures] = useState<Fixture[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Load fixture data on component mount
  useEffect(() => {
    const loadFixtures = async () => {
      try {
        const response = await fetch('data/fixture_data.json')
        const data: FixtureData = await response.json()
        setFixtures(data.fixtures)
      } catch (error) {
        console.error('Error loading fixtures:', error)
        setFixtures([])
      }
    }
    
    loadFixtures()
  }, [])
  
  // Get current month and year
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  
  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]
  
  // Get fixture for a specific date
  const getFixtureForDate = (day: number): Fixture | undefined => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return fixtures.find(fixture => fixture.date === dateString)
  }
  
  // Generate badge path from opposition name
  const getBadgePath = (opposition: string): string => {
    return `/league_logos/${opposition}.png`
  }
  
  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }
  
  // Generate calendar days
  const calendarDays = []
  
  // Empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  return (
    <div className="flex flex-col space-y-6 p-6 relative h-screen overflow-hidden" style={{ zIndex: 1 }}>
      {/* Calendar Container - Fixed height like other pages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="stat-panel p-4 relative overflow-hidden"
        style={{ height: 'calc(100vh - 140px)' }}
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 pointer-events-none" />
        
        <div className="relative z-10 h-full flex flex-col">
          {/* Calendar Header - Compact */}
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-bold text-white">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            
            <button 
              onClick={goToNextMonth}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Days of Week Header - Compact */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-white/60 font-medium py-1 text-sm">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Bigger boxes, exact 6 rows to fill space */}
          <div className="grid grid-cols-7 gap-2 flex-1" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} />
              }
              
              const fixture = getFixtureForDate(day)
              const isToday = new Date().getDate() === day && 
                            new Date().getMonth() === currentMonth && 
                            new Date().getFullYear() === currentYear
              
              return (
                <motion.div
                  key={`${currentMonth}-${currentYear}-${day}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.01 }}
                  className={`border rounded-lg p-2 flex flex-col relative min-h-0 ${
                    isToday 
                      ? 'border-yellow-400 bg-yellow-400/10' 
                      : 'border-white/20 hover:border-white/40'
                  } ${fixture ? 'bg-white/5' : ''}`}
                >
                  {/* Date and Home/Away - Top */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-lg">{day}</span>
                    {fixture ? (
                      <div className={`px-1 py-0.5 rounded text-xs font-medium ${
                        fixture.isHome 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-purple-500 text-white'
                      }`}>
                        {fixture.isHome ? 'Home' : 'Away'}
                      </div>
                    ) : (
                      <span className="text-white/50 text-xs">{shortMonthNames[currentMonth]}</span>
                    )}
                  </div>
                  
                  {/* Opposition Badge - Center */}
                  {fixture && (
                    <div className="flex-1 flex items-center justify-center">
                      <img 
                        src={getBadgePath(fixture.opposition)}
                        alt={fixture.opposition}
                        className="w-12 h-12 object-contain"
                        onError={(e) => {
                          
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LandingPage