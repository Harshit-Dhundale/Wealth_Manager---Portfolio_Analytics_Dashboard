export interface PortfolioOverview {
  totalValue: number
  totalInvested: number
  totalGainLoss: number
  totalGainLossPercent: number
  holdingsCount: number
}

export interface AllocationItem {
  name: string
  value: number
  percentage: number
}

export interface Holding {
  symbol: string
  name: string
  quantity: number
  price: number
  value: number
  gainLoss: number
  gainLossPercent: number
  sector: string
  marketCap: string
}

export interface PerformanceData {
  date: string
  value: number
}

export interface TopPerformer {
  symbol: string
  name: string
  gainPercent: number
}

export interface PortfolioData {
  overview: PortfolioOverview
  allocations: {
    bySector: Record<string, { value: number; percentage: number }>
    byMarketCap: Record<string, { value: number; percentage: number }>
  }
  holdings: Holding[]
  performance: {
    timeline: {
      date: string
      portfolio: number
      nifty50: number
      gold: number
    }[]
    returns: {
      portfolio: Record<string, number>
      nifty50: Record<string, number>
      gold: Record<string, number>
    }
  }
  topPerformers: {
    best: TopPerformer
    worst: TopPerformer
    diversification: number
    riskScore: number
  }
}