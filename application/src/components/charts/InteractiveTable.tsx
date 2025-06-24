import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface TableData {
  id: string
  name: string
  team: string
  position: string
  [key: string]: string | number | any
}

interface Column {
  key: string
  label: string
  sortable?: boolean
  format?: (value: any) => string
}

interface InteractiveTableProps {
  data: TableData[]
  columns: Column[]
  title: string
  color: string
  height?: number
}

export const InteractiveTable: React.FC<InteractiveTableProps> = ({
  data,
  columns,
  title,
  color,
  height = 800
}) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>(null)

  // Function to get color based on percentile value (0-100)
  const getCellColor = (percentile: number) => {
    if (percentile >= 80) return '#22c55e' // Green
    if (percentile >= 60) return '#84cc16' // Light green
    if (percentile >= 40) return '#eab308' // Yellow/Amber
    if (percentile >= 20) return '#f97316' // Orange
    return '#ef4444' // Red
  }

  const sortedData = useMemo(() => {
    if (!sortConfig) return data

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      // Handle nested object values (for stats) - sort by percentile
      if (typeof aValue === 'object' && aValue?.percentile !== undefined) {
        aValue = aValue.percentile
      }
      if (typeof bValue === 'object' && bValue?.percentile !== undefined) {
        bValue = bValue.percentile
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      const aString = String(aValue).toLowerCase()
      const bString = String(bValue).toLowerCase()

      if (sortConfig.direction === 'asc') {
        return aString < bString ? -1 : aString > bString ? 1 : 0
      } else {
        return aString > bString ? -1 : aString < bString ? 1 : 0
      }
    })
  }, [data, sortConfig])

  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key)
    if (!column?.sortable) return

    setSortConfig(current => {
      if (current?.key === key) {
        return current.direction === 'asc' 
          ? { key, direction: 'desc' }
          : null
      }
      return { key, direction: 'asc' }
    })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↑' : '↓'
  }

  // Determine column width based on column type
  const getColumnClasses = (column: Column) => {
    const baseClasses = "text-center text-[10px] font-bold text-white uppercase tracking-wider"
    const hoverClasses = column.sortable ? 'cursor-pointer hover:bg-gray-700/50 transition-colors' : ''
    
    // Wide columns for player info
    if (column.key === 'name') {
      return `px-4 py-3 text-left min-w-32 ${baseClasses} ${hoverClasses}`
    }
    if (column.key === 'team') {
      return `px-3 py-3 text-left min-w-24 ${baseClasses} ${hoverClasses}`
    }
    if (column.key === 'position') {
      return `px-2 py-3 min-w-16 ${baseClasses} ${hoverClasses}`
    }
    
    // Compact columns for stats
    return `px-2 py-3 w-20 max-w-20 ${baseClasses} ${hoverClasses}`
  }

  const getCellClasses = (column: Column) => {
    if (column.key === 'name') {
      return "px-4 py-3 text-left min-w-30"
    }
    if (column.key === 'team') {
      return "px-3 py-3 text-left min-w-22"
    }
    if (column.key === 'position') {
      return "px-2 py-3 text-center min-w-16"
    }
    return "px-2 py-3 w-24 max-w-24 text-center"
  }

  const renderCell = (row: TableData, column: Column) => {
    const cellValue = row[column.key]

    // Handle nested object values (for stats) - show only percentile
    if (typeof cellValue === 'object' && cellValue?.percentile !== undefined) {
      const percentile = cellValue.percentile
      const backgroundColor = getCellColor(percentile)
      
      return (
        <div 
          className="relative px-3 py-2 rounded-md text-white font-bold text-center min-w-12"
          style={{ 
            backgroundColor: backgroundColor + '30', // 30% opacity background
            border: `1px solid ${backgroundColor}60`
          }}
        >
          <div className="text-sm">
            {Math.round(percentile)}
          </div>
        </div>
      )
    }

    // Regular cell for non-stat columns (name, team, etc.)
    return (
      <span className="text-white/90 font-medium text-sm">
        {column.format ? column.format(cellValue) : String(cellValue)}
      </span>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white/90">{title}</h3>
        <p className="text-sm text-white/60">
          Click column headers to sort • {data.length} players • Values show percentile rankings (0-100)
        </p>
      </div>

      {/* Keep height constraint but hide scrollbars */}
      <div 
        className="rounded-lg border border-white/10 bg-gray-900/30 overflow-hidden"
        style={{ 
          height: `${height}px`,
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none'  /* IE and Edge */
        }}
      >
        <div 
          className="h-full overflow-y-scroll pr-4 -mr-4"
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none'  /* IE and Edge */
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none; /* Chrome, Safari and Opera */
            }
          `}</style>
          <div className="min-w-max">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-800/95 backdrop-blur z-20">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      onClick={() => handleSort(column.key)}
                      className={getColumnClasses(column)}
                      style={{ borderBottom: `3px solid ${color}` }}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="leading-tight break-words hyphens-auto text-center">
                          {column.label}
                        </span>
                        {column.sortable && (
                          <span className="text-white/60 text-xs">
                            {getSortIcon(column.key)}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-900/20">
                {sortedData.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-gray-800/20 transition-colors border-b border-white/10"
                  >
                    {columns.map((column) => (
                      <td key={column.key} className={getCellClasses(column)}>
                        {renderCell(row, column)}
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}