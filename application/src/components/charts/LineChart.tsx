import React from "react"

interface LineChartData {
  match: string
  matchId: number
  value: number
}

interface LineChartProps {
  data: LineChartData[]
  height: number
  color?: string
  currentValue?: number
  currentValueLabel?: string
  valueSuffix?: string
}

export function LineChart({
  data,
  height,
  color = "#2563eb", // Tailwind blue-600
  currentValue,
  currentValueLabel = "Current value",
  valueSuffix = "",
}: LineChartProps) {
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

  // Axis: set min and max exactly at data points
  const values = data.map((d) => d.value)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const adjustedMin = minValue
  const adjustedMax = maxValue
  const adjustedRange = adjustedMax - adjustedMin === 0 ? 1 : adjustedMax - adjustedMin

  // Smooth line with cubic Bezier
  function getSmoothLine(points: { x: number; y: number }[]) {
    if (points.length < 2) return ""
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const xc = (p0.x + p1.x) / 2
      const yc = (p0.y + p1.y) / 2
      d += ` Q ${xc},${p0.y} ${xc},${yc} T ${p1.x},${p1.y}`
    }
    return d
  }

  const svgWidth = Math.max(100, (data.length - 1) * 20) // 20 units per point, minimum 100

  // Map data to SVG coordinates using dynamic width
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * svgWidth
    const y = adjustedRange === 0
      ? 50
      : ((adjustedMax - item.value) / adjustedRange) * 100
    return { x, y }
  })

  // Area under curve for subtle fill
  const areaPath = [
    `M ${points[0].x},100`,
    ...points.map((p) => `L ${p.x},${p.y}`),
    `L ${points[points.length - 1].x},100`,
    "Z",
  ].join(" ")

  return (
    <div className="w-full" style={{ height }}>
      <div className="relative w-full h-full">
        <div className="pl-2 pr-2 h-full relative">
          <svg
            className="w-full h-full"
            viewBox={`0 0 ${svgWidth} 100`}
            preserveAspectRatio="none"
          >
            {/* Area under curve */}
            <path
              d={areaPath}
              fill={`${color}22`}
              style={{ transition: "all 0.5s" }}
            />
            {/* Smooth line */}
            <path
              d={getSmoothLine(points)}
              fill="none"
              stroke={color}
              strokeWidth="2"
              style={{ transition: "all 0.5s" }}
            />
            {/* Highlight last data point */}
            {points.length > 1 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="2.5"
                fill={color}
                stroke="#fff"
                strokeWidth="1"
                style={{ transition: "all 0.5s" }}
              />
            )}
          </svg>

          {/* Current value indicator */}
          {typeof currentValue === "number" && (
            <div className="absolute top-0 right-0 bg-black/60 rounded-lg px-1 py-0 shadow">
              <div className="text-lg font-bold" style={{ color }}>
                {currentValue.toFixed(1)}
                {valueSuffix}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}