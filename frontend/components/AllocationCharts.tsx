'use client'

import { usePortfolioContext } from '@/context/PortfolioContext'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useState, useMemo } from 'react'

const BASE_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#f59e0b', '#8b5cf6']

export default function AllocationCharts() {
  const { data, isLoading, error } = usePortfolioContext()
  const [sectorHover, setSectorHover] = useState<string | null>(null)
  const [marketCapHover, setMarketCapHover] = useState<string | null>(null)

  // Generate distinct colors for all sectors
  const generateColors = useMemo(() => {
    if (!data) return BASE_COLORS;
    
    const sectorCount = Object.keys(data.allocations.bySector).length
    const colors = [...BASE_COLORS]
    
    for (let i = BASE_COLORS.length; i < sectorCount; i++) {
      const hue = Math.floor((i * 137.5) % 360)
      colors.push(`hsl(${hue}, 70%, 60%)`)
    }
    
    return colors
  }, [data])

  // Group small allocations into "Others"
  const allocations = useMemo(() => {
    if (!data) return { sector: [], marketCap: [] };

    const processAllocations = (allocations: Record<string, { value: number; percentage: number }>, threshold = 5) => {
      const entries = Object.entries(allocations)
      const main = entries.filter(([_, { percentage }]) => percentage >= threshold)
      const other = entries.filter(([_, { percentage }]) => percentage < threshold)
      
      if (other.length > 0) {
        const otherSum = other.reduce((sum, [_, { value }]) => sum + value, 0)
        const otherPercentage = other.reduce((sum, [_, { percentage }]) => sum + percentage, 0)
        return [
          ...main.map(([name, data]) => ({ name, ...data })),
          { name: 'Other', value: otherSum, percentage: otherPercentage }
        ]
      }
      
      return entries.map(([name, data]) => ({ name, ...data }))
    }

    return {
      sector: processAllocations(data.allocations.bySector),
      marketCap: processAllocations(data.allocations.byMarketCap)
    }
  }, [data])

  // Render loading/error states after hooks
  if (isLoading) return <div className="bg-white rounded-lg p-6 h-80 flex items-center justify-center">Loading charts...</div>
  if (error) return <div className="bg-white rounded-lg p-6 h-80 flex items-center justify-center text-red-600">Error loading charts</div>
  if (!data) return <div className="bg-white rounded-lg p-6 h-80 flex items-center justify-center">No data available</div>

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-blue-600">{`Value: $${data.value.toLocaleString()}`}</p>
          <p className="text-gray-600">{`${data.percentage.toFixed(1)}%`}</p>
        </div>
      )
    }
    return null
  }

  // Custom legend with scroll for many items
  const renderLegend = (props: any, type: 'sector' | 'marketCap') => (
    <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
      {props.payload?.map((entry: any, index: number) => (
        <div 
          key={`legend-${index}`} 
          className={`flex items-center py-1 px-2 rounded-md ${
            (type === 'sector' && sectorHover === entry.value) || 
            (type === 'marketCap' && marketCapHover === entry.value)
              ? 'bg-gray-100' 
              : ''
          }`}
          onMouseEnter={() => type === 'sector' 
            ? setSectorHover(entry.value) 
            : setMarketCapHover(entry.value)}
          onMouseLeave={() => type === 'sector' 
            ? setSectorHover(null) 
            : setMarketCapHover(null)}
        >
          <div 
            className="w-3 h-3 mr-2 rounded-full" 
            style={{ backgroundColor: entry.color }} 
          />
          <span className="text-sm truncate flex-1 min-w-0">
            {entry.value}
          </span>
          <span className="text-sm font-medium ml-2">
            {allocations[type][index].percentage.toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-6">Portfolio Allocation</h3>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sector Allocation */}
        <div className="flex-1">
          <h4 className="text-md font-medium mb-4 text-center">By Sector</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations.sector}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ name, percentage }) => 
                    percentage >= 5 ? `${percentage.toFixed(1)}%` : ''
                  }
                >
                  {allocations.sector.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={generateColors[index % generateColors.length]} 
                      strokeWidth={sectorHover === entry.name ? 2 : 0}
                      stroke="#000"
                      opacity={sectorHover && sectorHover !== entry.name ? 0.4 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={(props) => renderLegend(props, 'sector')}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Market Cap Allocation */}
        <div className="flex-1">
          <h4 className="text-md font-medium mb-4 text-center">By Market Cap</h4>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations.marketCap}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ percentage }) => `${percentage.toFixed(1)}%`}
                >
                  {allocations.marketCap.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={generateColors[index % generateColors.length]} 
                      strokeWidth={marketCapHover === entry.name ? 2 : 0}
                      stroke="#000"
                      opacity={marketCapHover && marketCapHover !== entry.name ? 0.4 : 1}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  content={(props) => renderLegend(props, 'marketCap')}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}