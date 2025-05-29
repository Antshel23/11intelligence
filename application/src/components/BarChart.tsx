import { useRef, useEffect } from 'react'
import { select, scaleLinear, scaleBand, axisLeft, max } from 'd3'
import { motion } from 'framer-motion'

interface BarChartProps {
  data: { name: string; value: number }[]
  color: string
  height: number
}

export const BarChart: React.FC<BarChartProps> = ({ data, color, height }) => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current) return

    const svg = select(svgRef.current)
    const width = 300
    const margin = { top: 10, right: 30, bottom: 10, left: 120 }

    const x = scaleLinear()
      .domain([0, max(data, d => d.value) || 0])
      .range([0, width - margin.left - margin.right])

    const y = scaleBand()
      .domain(data.map(d => d.name))
      .range([0, height - margin.top - margin.bottom])
      .padding(0.3)

    svg.selectAll('*').remove()

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    g.append('g')
      .call(axisLeft(y))
      .style('font-size', '12px')

    g.selectAll('rect')
      .data(data)
      .join('rect')
      .attr('y', d => y(d.name) || 0)
      .attr('height', y.bandwidth())
      .attr('fill', color)
      .attr('rx', 4)
      .attr('x', 0)
      .attr('width', d => x(d.value))

    // Add value labels
    g.selectAll('text.value')
      .data(data)
      .join('text')
      .attr('class', 'value')
      .attr('x', d => x(d.value) + 5)
      .attr('y', d => (y(d.name) || 0) + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text(d => d.value.toFixed(1))
      .style('font-size', '12px')
      .style('fill', '#666')

  }, [data, color, height])

  return (
    <motion.svg
      ref={svgRef}
      width="100%"
      height={height}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    />
  )
}