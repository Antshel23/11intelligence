import { useRef, useEffect, useState } from 'react'
import { select, scaleLinear, scaleBand, axisLeft } from 'd3'
import { motion } from 'framer-motion'

interface BarChartProps {
  data: { name: string; value: number; percentile: number }[]
  color: string
  height: number
}

export const BarChart: React.FC<BarChartProps> = ({ data, color, height }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  // Helper function for responsive font sizes
  const getResponsiveFontSize = (base: number, scale: number) => {
    const isMobile = containerWidth < 768
    const isTablet = containerWidth >= 768 && containerWidth < 1024
    const defaultSize = isMobile ? base - 1 : isTablet ? base : base + 1
    return `${Math.max(defaultSize, Math.min(base + 2, containerWidth * scale))}px`
  }

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const containerRect = svgRef.current.parentElement?.getBoundingClientRect()
        setContainerWidth(containerRect?.width || 0)
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    if (!svgRef.current || !containerWidth) return

    const svg = select(svgRef.current)
    const margin = { 
      top: 0, 
      right: Math.min(100, containerWidth * 0.08),
      bottom: 0, 
      left: Math.min(240, containerWidth * 0.25)
    }
    const width = containerWidth

    const x = scaleLinear()
      .domain([0, 100])
      .range([0, width - margin.left - margin.right])

    const y = scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.5)

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

    // Add grid lines
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
      .style('font-size', getResponsiveFontSize(13, 0.012))
      .style('font-weight', '600')
      .style('color', 'rgba(255, 255, 255, 0.9)')
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => {
        g.selectAll('.tick text')
          .style('font-weight', '500')
          .call(wrap, margin.left - 40)
          .attr('transform', 'translate(-10,0)')
      })

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
      .on('mouseover', function() {
        select(this)
          .transition()
          .duration(200)
          .attr('fill', `url(#gradient-hover-${color.slice(1)})`)
          .style('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))')
        
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
        
        select(this.parentNode)
          .selectAll('text.value')
          .transition()
          .duration(200)
          .style('fill', 'rgba(255, 255, 255, 0.7)')
      })

    // Add percentile labels
    bars.append('text')
      .attr('class', 'percentile')
      .attr('x', d => x(d.percentile) + 8)
      .attr('y', y.bandwidth() / 2)
      .attr('dy', '-0.2em')
      .text(d => Math.round(d.percentile))
      .style('font-size', getResponsiveFontSize(15, 0.014))
      .style('font-weight', '700')
      .style('fill', 'rgba(255, 255, 255, 0.95)')
      .style('filter', 'drop-shadow(0 2px 3px rgba(0,0,0,0.2))')

    // Add value labels
    bars.append('text')
      .attr('class', 'value')
      .attr('x', d => x(d.percentile) + 8)
      .attr('y', y.bandwidth() / 2)
      .attr('dy', '1.2em')
      .text(d => d.value.toFixed(1))
      .style('font-size', getResponsiveFontSize(12, 0.011))
      .style('font-weight', '500')
      .style('fill', 'rgba(255, 255, 255, 0.7)')
      .style('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))')

    svg.attr('viewBox', `0 0 ${width} ${height}`)

  }, [data, color, height, containerWidth])

  // Text wrapping helper function
  function wrap(text: any, width: number) {
    text.each(function() {
      const text = select(this)
      const words = text.text().split(/\s+/).reverse()
      let word
      let line: string[] = []
      let lineNumber = 0
      const lineHeight = 1.2
      const y = text.attr('y')
      const dy = parseFloat(text.attr('dy')) || 0
      let tspan = text.text(null).append('tspan')
        .attr('x', -6)
        .attr('y', y)
        .attr('dy', dy + 'em')

      while (word = words.pop()) {
        line.push(word)
        tspan.text(line.join(' '))
        if (tspan.node()?.getComputedTextLength()! > width) {
          line.pop()
          tspan.text(line.join(' '))
          line = [word]
          tspan = text.append('tspan')
            .attr('x', -6)
            .attr('y', y)
            .attr('dy', `${++lineNumber * lineHeight}em`)
            .text(word)
        }
      }

      // Center multi-line text vertically
      const lines = text.selectAll('tspan')
      const totalLines = lines.size()
      lines.attr('dy', (d: any, i: number) => {
        const offset = totalLines > 1 
          ? (i - (totalLines - 1) / 2) * lineHeight 
          : 0
        return i === 0 ? dy + offset + 'em' : offset + 'em'
      })
    })
  }

  return (
    <motion.svg
      ref={svgRef}
      width="100%"
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      preserveAspectRatio="xMinYMin meet"
      className="chart-container"
    />
  )
}

export default BarChart