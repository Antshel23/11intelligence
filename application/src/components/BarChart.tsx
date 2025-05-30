import { useRef, useEffect } from 'react'
import { select, scaleLinear, scaleBand, axisLeft, max } from 'd3'
import { motion } from 'framer-motion'

interface BarChartProps {
  data: { name: string; value: number; percentile: number }[]
  color: string
  height: number
}

export const BarChart: React.FC<BarChartProps> = ({ data, color, height }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = select(svgRef.current)
    const width = 1800
    const margin = { top: 0, right: 300, bottom: 0, left: 160 }

    const x = scaleLinear()
      .domain([0, 100])
      .range([0, width - margin.left - margin.right])

    const y = scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.4)

    svg.selectAll('*').remove()

    // Define gradients
    const defs = svg.append('defs')
    
    // Normal gradient
    const gradient = defs.append('linearGradient')
      .attr('id', `gradient-${color.slice(1)}`)
      .attr('x1', '0%')
      .attr('x2', '100%')
    
    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.9)
    
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.7)

    // Hover gradient
    const gradientHover = defs.append('linearGradient')
      .attr('id', `gradient-hover-${color.slice(1)}`)
      .attr('x1', '0%')
      .attr('x2', '100%')
    
    gradientHover.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', color)
      .attr('stop-opacity', 1)
    
    gradientHover.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', color)
      .attr('stop-opacity', 0.8)

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Add grid lines with dash pattern
    g.selectAll('line.grid')
      .data([0, 25, 50, 75, 100])
      .join('line')
      .attr('class', 'grid')
      .attr('x1', d => x(d))
      .attr('x2', d => x(d))
      .attr('y1', 0)
      .attr('y2', height - margin.top - margin.bottom)
      .style('stroke', 'rgba(255, 255, 255, 0.08)')
      .style('stroke-dasharray', '4,4')
      .style('stroke-width', 1)

    // Enhanced axis styling
    g.append('g')
      .call(axisLeft(y))
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('color', 'rgba(255, 255, 255, 0.85)')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())

    // Create bar groups
    const bars = g.selectAll('g.bar')
      .data(data)
      .join('g')
      .attr('class', 'bar')
      .attr('transform', d => `translate(0,${y(d.name)})`)

    // Add background bars
    bars.append('rect')
      .attr('height', y.bandwidth())
      .attr('fill', 'rgba(255, 255, 255, 0.03)')
      .attr('rx', 6)
      .attr('x', 0)
      .attr('width', x(100))

    // Add main bars with enhanced styling
    bars.append('rect')
      .attr('height', y.bandwidth())
      .attr('fill', `url(#gradient-${color.slice(1)})`)
      .attr('rx', 6)
      .attr('x', 0)
      .attr('width', d => x(d.percentile))
      .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))')
      .style('transition', 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)')
      .on('mouseover', function(event, d) {
        select(this)
          .transition()
          .duration(200)
          .attr('fill', `url(#gradient-hover-${color.slice(1)})`)
          .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))')
        
        // Highlight text
        select(this.parentNode)
          .selectAll('text')
          .transition()
          .duration(200)
          .style('fill', 'rgba(255, 255, 255, 1)')
      })
      .on('mouseout', function() {
        select(this)
          .transition()
          .duration(200)
          .attr('fill', `url(#gradient-${color.slice(1)})`)
          .style('filter', 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))')
        
        // Reset text
        select(this.parentNode)
          .select('text.value')
          .transition()
          .duration(200)
          .style('fill', 'rgba(255, 255, 255, 0.7)')
      })

    // Add percentile labels
    bars.append('text')
      .attr('class', 'percentile')
      .attr('x', d => x(d.percentile) + 12)
      .attr('y', y.bandwidth() / 2 - 8)
      .attr('dy', '0.35em')
      .text(d => `Score: ${Math.round(d.percentile)}`)
      .style('font-size', '18px')
      .style('font-weight', '700')
      .style('fill', 'rgba(255, 255, 255, 0.95)')
      .style('filter', 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))')

    // Add value labels
    bars.append('text')
      .attr('class', 'value')
      .attr('x', d => x(d.percentile) + 12)
      .attr('y', y.bandwidth() / 2 + 12)
      .attr('dy', '0.35em')
      .text(d => `Value: ${d.value.toFixed(2)}`)
      .style('font-size', '14px')
      .style('font-weight', '500')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))')

  }, [data, color, height])

  return (
    <motion.svg
      ref={svgRef}
      width="100%"
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      preserveAspectRatio="xMinYMin meet"
      viewBox={`0 0 800 ${height}`}
      className="chart-container"
    />
  )
}

export default BarChart