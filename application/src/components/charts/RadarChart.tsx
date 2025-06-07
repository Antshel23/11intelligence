import React from 'react'

interface RadarChartProps {
  data: Array<{
    name: string
    value: number
    percentile: number
  }>
  height?: number
}

export function RadarChart({ data, height = 700 }: RadarChartProps) {
  
  // Function to get color based on value (0-100)
  const getBarColor = (value: number) => {
    if (value >= 80) return '#22c55e' // Green
    if (value >= 60) return '#84cc16' // Light green
    if (value >= 40) return '#eab308' // Yellow/Amber
    if (value >= 20) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  return (
    <div className="w-full flex flex-col min-h-[500px]">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-medium text-white/90 text-center">Performance Metrics</h3>
        <p className="text-sm text-white/60 text-center">Percentile rankings compared to players in same position (0-100)</p>
      </div>
      
      {/* Bar Chart - Full Width */}
      <div className="flex-1 space-y-3 overflow-y-auto max-h-[600px] pr-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            {/* Metric name */}
            <div className="w-64 text-right">
              <span className="text-white/90 text-sm font-medium" title={item.name}>
                {item.name}
              </span>
            </div>
            
            {/* Bar container */}
            <div className="flex-1 relative">
              <div className="w-full h-9 bg-white/10 rounded-lg overflow-hidden">
                <div 
                  className="h-full rounded-lg transition-all duration-300 flex items-center justify-end pr-3"
                  style={{ 
                    width: `${Math.max(item.value, 5)}%`,
                    backgroundColor: getBarColor(item.value)
                  }}
                >
                  <span className="text-white text-sm font-bold">
                    {Math.round(item.value)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Color legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex justify-center items-center space-x-8 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#ef4444]"></div>
            <span className="text-white/70">Poor (0-20)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#f97316]"></div>
            <span className="text-white/70">Below Avg (20-40)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#eab308]"></div>
            <span className="text-white/70">Average (40-60)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#84cc16]"></div>
            <span className="text-white/70">Good (60-80)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded bg-[#22c55e]"></div>
            <span className="text-white/70">Excellent (80-100)</span>
          </div>
        </div>
      </div>
    </div>
  )
}