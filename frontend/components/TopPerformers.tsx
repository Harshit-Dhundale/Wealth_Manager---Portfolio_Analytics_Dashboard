"use client";

import { usePortfolioContext } from "@/context/PortfolioContext";
import { formatPercent } from "@/utils/formatters";
import { TrendingUp, TrendingDown, Shield, Target } from "lucide-react";

export default function TopPerformers() {
  const { data, isLoading, error } = usePortfolioContext();

  // Add to loading state
  if (isLoading)
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
        <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg p-4 h-20 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  if (error) return <div>Error loading top performers</div>;
  if (!data) return null;

  const topPerformers = data.topPerformers;

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-full">
      <h3 className="text-lg font-semibold mb-4">Key Metrics</h3>

      <div className="flex flex-col gap-4">
        {/* Best Performer */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">
                Best Performer
              </span>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              ▲ {formatPercent(topPerformers.best.gainPercent)}
            </span>
          </div>
          <div className="text-md font-bold text-green-900 truncate">
            {topPerformers.best.symbol}
          </div>
          <div className="text-xs text-green-700 truncate">
            {topPerformers.best.name}
          </div>
        </div>

        {/* Worst Performer */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-800">
                Worst Performer
              </span>
            </div>
            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
              ▼ {formatPercent(Math.abs(topPerformers.worst.gainPercent))}
            </span>
          </div>
          <div className="text-md font-bold text-red-900 truncate">
            {topPerformers.worst.symbol}
          </div>
          <div className="text-xs text-red-700 truncate">
            {topPerformers.worst.name}
          </div>
        </div>

        {/* Diversification Score */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">
                Diversification
              </span>
            </div>
            <span className="text-xs font-medium text-blue-800">
              {topPerformers.diversification}/100
            </span>
          </div>
          <div className="text-sm text-blue-700">
            {topPerformers.diversification >= 80
              ? "Well Diversified"
              : topPerformers.diversification >= 60
              ? "Moderate"
              : "Needs Improvement"}
          </div>
        </div>

        {/* Risk Score */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">
                Risk Score
              </span>
            </div>
            <span className="text-xs font-medium text-orange-800">
              {topPerformers.riskScore}/10
            </span>
          </div>
          <div className="text-sm text-orange-700">
            {topPerformers.riskScore <= 3
              ? "Low"
              : topPerformers.riskScore <= 7
              ? "Moderate"
              : "High"}
          </div>
        </div>
      </div>
    </div>
  );
}
