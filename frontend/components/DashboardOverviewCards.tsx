'use client'

import { usePortfolioContext } from '@/context/PortfolioContext'
import DataCard from '@/components/ui/DataCard' // Updated import path
import { formatCurrency, formatPercent } from '@/utils/formatters'
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react'

export default function DashboardOverviewCards() {
  const { data, isLoading, error } = usePortfolioContext()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading data</div>
  if (!data) return null

  const overview = {
  totalValue: data.overview.totalValue,
  gainLoss: data.overview.totalGainLoss,
  performancePercent: data.overview.totalGainLossPercent,
  holdingsCount: data.overview.holdingsCount
}

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <DataCard
        title="Total Value"
        value={formatCurrency(overview.totalValue)}
        icon={<DollarSign className="h-6 w-6" />}
        trend="up"
      />
      
      <DataCard
        title="Gain/Loss"
        value={formatCurrency(overview.gainLoss)}
        icon={overview.gainLoss >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
        trend={overview.gainLoss >= 0 ? "up" : "down"}
        className={overview.gainLoss >= 0 ? "text-green-600" : "text-red-600"}
      />
      
      <DataCard
        title="Performance"
        value={formatPercent(overview.performancePercent)}
        icon={overview.performancePercent >= 0 ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
        trend={overview.performancePercent >= 0 ? "up" : "down"}
        className={overview.performancePercent >= 0 ? "text-green-600" : "text-red-600"}
      />
      
      <DataCard
        title="Holdings"
        value={overview.holdingsCount.toString()}
        icon={<PieChart className="h-6 w-6" />}
        trend="neutral"
      />
    </div>
  )
}
