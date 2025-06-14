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
    </div>
  )
}