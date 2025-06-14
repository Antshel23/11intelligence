interface StackedBarData {
  name: string
  dorking: number
  opposition: number
}

interface StackedBarChartProps {
  data: StackedBarData[]
  height: number
}

export function StackedBarChart({ data, height }: StackedBarChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-white/40" style={{ height }}>
        No data available
      </div>
    )
  }

  return (
    <div className="w-full" style={{ height }}>
      <div className="space-y-6">
        {data.map((item, index) => {
          const total = item.dorking + item.opposition
          let dorkingPercentage, oppositionPercentage
          
          if (total === 0) {
            // If both values are 0, split equally
            dorkingPercentage = oppositionPercentage = 50
          } else {
            // Calculate the difference ratio to emphasize larger differences
            const difference = Math.abs(item.dorking - item.opposition)
            const average = total / 2
            const differenceRatio = average > 0 ? difference / average : 0
            
            // Base proportions
            const baseDorkingPercentage = (item.dorking / total) * 100
            const baseOppositionPercentage = (item.opposition / total) * 100
            
            // Apply emphasis based on difference magnitude
            // Larger differences get more pronounced visual representation
            const emphasis = Math.min(differenceRatio * 0.5, 0.3) // Cap emphasis at 30%
            
            if (item.dorking > item.opposition) {
              dorkingPercentage = Math.min(baseDorkingPercentage + (emphasis * 100), 85)
              oppositionPercentage = 100 - dorkingPercentage
            } else if (item.opposition > item.dorking) {
              oppositionPercentage = Math.min(baseOppositionPercentage + (emphasis * 100), 85)
              dorkingPercentage = 100 - oppositionPercentage
            } else {
              dorkingPercentage = baseDorkingPercentage
              oppositionPercentage = baseOppositionPercentage
            }
          }

          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/90 font-medium">{item.name}</span>
              </div>
              
              <div className="h-8 bg-gray-700 rounded-lg overflow-hidden flex relative">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${dorkingPercentage}%` }}
                />
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                  style={{ width: `${oppositionPercentage}%` }}
                />
                
                {/* Centered labels */}
                {dorkingPercentage > 0 && (
                  <div 
                    className="absolute top-0 h-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ 
                      left: 0,
                      width: `${dorkingPercentage}%`
                    }}
                  >
                    {item.dorking}
                  </div>
                )}
                {oppositionPercentage > 0 && (
                  <div 
                    className="absolute top-0 h-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ 
                      right: 0,
                      width: `${oppositionPercentage}%`
                    }}
                  >
                    {item.opposition}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}