import { useRef, useEffect } from 'react'
import { select, arc } from 'd3'
import { motion } from 'framer-motion'

interface GaugeChartProps {
  value: number
  title: string
  color: string
  className?: string
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ value, title, color, className }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const width = 70  // Even smaller
    const height = 70 // Even smaller
    const radius = Math.min(width, height) / 2
    
    select(svgRef.current).selectAll('*').remove()
    
    const svg = select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width/2},${height/2})`)

    const gaugeArc = arc()
      .innerRadius(radius * 0.65)
      .outerRadius(radius)
      .startAngle(-Math.PI / 2)

    // Background arc
    svg.append('path')
      .datum({ endAngle: Math.PI / 2 })
      .style('fill', 'rgba(255, 255, 255, 0.05)')
      .attr('d', gaugeArc as any)

    // Foreground arc
    svg.append('path')
      .datum({ endAngle: (-Math.PI / 2) + (Math.PI * (value / 100)) })
      .style('fill', color)
      .style('opacity', 0.85)
      .attr('d', gaugeArc as any)
      .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))')

    // Add value text
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.1em')
      .style('fill', 'white')
      .style('font-size', '16px')
      .style('font-weight', '600')
      .text(`${value}`)

  }, [value, color])

  return (
    <motion.div 
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg ref={svgRef} className="w-full h-full" />
      <span className="text-xs text-white/80 mt-1 text-center leading-tight">{title}</span>
    </motion.div>
  )
}

export default GaugeChart