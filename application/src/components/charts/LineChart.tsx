interface LineChartData {
  match: string
  matchId: number
  xPoints: number
}

interface LineChartProps {
  data: LineChartData[]
  height: number
  color: string
}

export function LineChart({ data, height, color }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full flex items-center justify-center text-white/40" style={{ height }}>
        No data available
      </div>
    )
  }

  if (data.length === 1) {
    return (
      <div className="w-full flex items-center justify-center text-white/40" style={{ height }}>
        Need at least 2 matches for progression chart
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.xPoints))
  const minValue = Math.min(...data.map(d => d.xPoints))
  const range = maxValue - minValue
  
  // Add padding but ensure we don't get too zoomed in
  const padding = Math.max(range * 0.1, 5) // At least 5 points padding
  const adjustedMax = maxValue + padding
  const adjustedMin = Math.max(0, minValue - padding)
  const adjustedRange = adjustedMax - adjustedMin

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = ((adjustedMax - item.xPoints) / adjustedRange) * 100
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full" style={{ height }}>
      <div className="relative w-full h-full">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/40 -ml-12 py-2">
          <span>{adjustedMax.toFixed(0)}</span>
          <span>{((adjustedMax + adjustedMin) / 2).toFixed(0)}</span>
          <span>{adjustedMin.toFixed(0)}</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="10" height="20" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.2"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Area under curve */}
            <polygon
              points={`0,100 ${points} 100,100`}
              fill={`${color}20`}
              className="transition-all duration-500"
            />
            
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke={color}
              strokeWidth="0.8"
              className="transition-all duration-500"
            />
            
            {/* Data points */}
            {data.map((item, index) => {
              const x = (index / (data.length - 1)) * 100
              const y = ((adjustedMax - item.xPoints) / adjustedRange) * 100
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="1"
                  fill={color}
                  className="transition-all duration-500"
                />
              )
            })}
          </svg>

          {/* Current value indicator */}
          {data.length > 0 && (
            <div className="absolute top-4 right-4 bg-black/50 rounded-lg px-3 py-2">
              <div className="text-xs text-white/60">Current Projection</div>
              <div className="text-lg font-bold" style={{ color }}>
                {data[data.length - 1].xPoints.toFixed(1)} pts
              </div>
            </div>
          )}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 flex justify-between text-xs text-white/40 mt-2">
          <span>Match 1</span>
          <span>Match {data.length}</span>
        </div>
      </div>
    </div>
  )
}