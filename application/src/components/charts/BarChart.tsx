import React from 'react'

interface BarChartProps {
  data: Array<{
    name: string
    value: number
    percentile: number
  }>
  color: string
  height?: number
}

export function BarChart({ data, color, height = 600 }: BarChartProps) {
  
  // Function to get color based on percentile value (0-100)
  const getBarColor = (value: number) => {
    if (value >= 80) return '#22c55e' // Green
    if (value >= 60) return '#84cc16' // Light green
    if (value >= 40) return '#eab308' // Yellow/Amber
    if (value >= 20) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  return (
    <div className="w-full flex flex-col">
      
      {/* Bar Chart - Full Width */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[500px] pr-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {/* Metric name - Right aligned and closer to bars */}
            <div className="w-40 text-right">
              <span className="text-white/90 text-xs font-medium p-2" title={item.name}>
                {item.name}
              </span>
            </div>
            
            {/* Bar container */}
            <div className="flex-1 relative">
              <div className="w-full h-7 bg-white/10 rounded-lg overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-all duration-300 flex items-center justify-end pr-3"
                  style={{ 
                    width: `${Math.max(item.percentile, 5)}%`,
                    backgroundColor: getBarColor(item.percentile)
                  }}
                >
                  <span className="text-white text-xs font-bold text-right">
                    {Math.round(item.percentile)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BarChart