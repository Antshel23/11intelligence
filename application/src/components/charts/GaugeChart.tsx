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

  // Function to get color based on percentile value
  const getGaugeColor = (percentile: number) => {
    if (percentile <= 30) return '#EF4444' // Red
    if (percentile <= 70) return '#F59E0B' // Yellow/Orange
    return '#10B981' // Green
  }

  useEffect(() => {
    if (!svgRef.current) return
  
    const width = 75   // Reduced from 120
    const height = 75  // Reduced from 120
    const radius = Math.min(width, height) / 2
    
    select(svgRef.current).selectAll('*').remove()
    
    const svg = select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
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
  
    // Foreground arc with red/yellow/green color scale
    svg.append('path')
      .datum({ endAngle: (-Math.PI / 2) + (Math.PI * (value / 100)) })
      .style('fill', getGaugeColor(value))
      .style('opacity', 0.85)
      .attr('d', gaugeArc as any)
      .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))')
  
    // Add value text - positioned in center of gauge
    svg.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.5em')  // Adjusted for better centering
      .style('fill', 'white')
      .style('font-size', '10px')  // Smaller font for smaller gauge
      .style('font-weight', '600')
      .style('font-family', 'system-ui, sans-serif')
      .text(`${value}`)
  
  }, [value, color])
  
  return (
    <motion.div 
      className={`flex flex-col items-center ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg ref={svgRef} className="block" />  {/* Remove w-full h-full */}
      <span className="text-xs text-white/80 mt-1 text-center leading-tight">{title}</span>
    </motion.div>
  )
}
export default GaugeChart