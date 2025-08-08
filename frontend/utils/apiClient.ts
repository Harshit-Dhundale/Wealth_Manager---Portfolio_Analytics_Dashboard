import { PortfolioData } from '@/utils/types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/portfolio`;

export const fetchPortfolioData = async (): Promise<PortfolioData> => {
  const [holdings, summary, performance, allocation] = await Promise.all([
    fetch(`${API_BASE_URL}/holdings`).then(res => res.json()),
    fetch(`${API_BASE_URL}/summary`).then(res => res.json()),
    fetch(`${API_BASE_URL}/performance`).then(res => res.json()),
    fetch(`${API_BASE_URL}/allocation`).then(res => res.json()),
  ]);

  return {
    overview: {
      totalValue: summary.totalValue,
      totalInvested: summary.totalInvested,
      totalGainLoss: summary.totalGainLoss,
      totalGainLossPercent: summary.totalGainLossPercent,
      holdingsCount: holdings.length
    },
    allocations: allocation,
    holdings: holdings.map((h: any) => ({
      symbol: h.symbol,
      name: h.name,
      quantity: h.quantity,
      price: h.currentPrice,
      value: h.value,
      gainLoss: h.gainLoss,
      gainLossPercent: h.gainLossPercent,
      sector: h.sector,
      marketCap: h.marketCap
    })),
    performance: performance,
    topPerformers: {
      best: summary.topPerformer,
      worst: summary.worstPerformer,
      diversification: summary.diversificationScore,
      riskScore: mapRiskLevelToScore(summary.riskLevel)
    }
  };
};

function mapRiskLevelToScore(riskLevel: string): number {
  switch (riskLevel.toLowerCase()) {
    case 'low': return 3;
    case 'moderate': return 6;
    case 'high': return 8;
    default: return 5;
  }
}
