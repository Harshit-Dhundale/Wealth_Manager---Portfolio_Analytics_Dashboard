"use client";

import { useState, useEffect, useMemo, JSX } from "react";
import { usePortfolioContext } from "@/context/PortfolioContext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatPercent } from "@/utils/formatters";
import { subMonths, subYears, parseISO, format } from 'date-fns';
import { BarChart2, Check, AlertCircle } from 'lucide-react';

const timeframes = [
  { label: "1M", value: "1m" },
  { label: "3M", value: "3m" },
  { label: "1Y", value: "1y" },
  { label: "All", value: "all" },
];

export default function PerformanceChart() {
  const { data, isLoading, error } = usePortfolioContext();
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [filteredReturns, setFilteredReturns] = useState<any>({});

  useEffect(() => {
    if (!data) return;
    
    // Find most recent date in dataset
    const lastDate = parseISO(
      data.performance.timeline[data.performance.timeline.length - 1].date
    );
    
    let filteredTimeline = [...data.performance.timeline];
    let returnsPeriod = '1year';
    
    switch (selectedTimeframe) {
      case '1m':
        filteredTimeline = filterByDateRange(lastDate, 1, 'months');
        returnsPeriod = '1month';
        break;
      case '3m':
        filteredTimeline = filterByDateRange(lastDate, 3, 'months');
        returnsPeriod = '3months';
        break;
      case '1y':
        filteredTimeline = filterByDateRange(lastDate, 1, 'years');
        returnsPeriod = '1year';
        break;
      default:
        returnsPeriod = '1year';
    }
    
    // Sort chronologically
    filteredTimeline.sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
    
    setFilteredData(
      filteredTimeline.map(item => ({
        date: item.date,
        Portfolio: item.portfolio,
        'Nifty 50': item.nifty50,
        Gold: item.gold
      }))
    );
    
    setFilteredReturns({
      portfolio: data.performance.returns.portfolio[returnsPeriod],
      nifty50: data.performance.returns.nifty50[returnsPeriod],
      gold: data.performance.returns.gold[returnsPeriod]
    });
  }, [selectedTimeframe, data]);

  const filterByDateRange = (lastDate: Date, amount: number, unit: 'months' | 'years') => {
    // Add data validation checks
    if (!data || !data.performance || !data.performance.timeline.length) {
      return [];
    }

    const cutoffDate = unit === 'months' 
      ? subMonths(lastDate, amount)
      : subYears(lastDate, amount);
    
    return data!.performance.timeline.filter(item => 
      parseISO(item.date) >= cutoffDate
    );
  };

  // Memoize expensive calculations
  const chartData = useMemo(() => (
    filteredData.map(item => ({ ...item }))
  ), [filteredData]);

  if (isLoading) return <div>Loading performance chart...</div>;
  
  // Enhanced error handling
  if (error) return (
    <div className="bg-white rounded-lg border p-6">
      <div className="text-red-600 flex flex-col items-center py-8">
        <AlertCircle className="w-12 h-12 mb-3" />
        <h3 className="text-lg font-semibold">Data Loading Failed</h3>
        <p className="text-gray-600 mt-1">
          Unable to load performance data. Please try again later.
        </p>
      </div>
    </div>
  );

  if (!data) return null;

  const { performance } = data;

  // Enhanced date formatting based on timeframe
  const formatDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    
    // Different formats based on timeframe
    if (selectedTimeframe === 'all' || selectedTimeframe === '1y') {
      return format(date, 'MMM yy');
    }
    return format(date, 'MMM dd');
  };

  // Improved currency formatter
  const formatCurrencyShort = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${Math.round(value)}`;
  };

  // Improved tooltip with timeframe context
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg min-w-[180px]">
          <p className="font-medium mb-2">
            {selectedTimeframe === 'all' || selectedTimeframe === '1y' 
              ? format(parseISO(label), 'MMMM yyyy') 
              : format(parseISO(label), 'MMM dd, yyyy')}
          </p>
          {payload.map((entry: any) => (
            <p key={entry.name} className="flex items-center">
              <span 
                className="inline-block w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="font-medium mr-2">{entry.name}:</span>
              <span>${entry.value.toLocaleString('en-US')}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-lg font-semibold">Performance Comparison</h3>
        <div className="flex flex-wrap gap-2">
          {timeframes.map((timeframe) => (
            <button
              key={timeframe.value}
              onClick={() => setSelectedTimeframe(timeframe.value)}
              className={`
                px-3 py-1.5 text-sm rounded-md transition-all
                flex items-center
                ${
                  selectedTimeframe === timeframe.value
                    ? 'bg-blue-600 text-white shadow-md font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {timeframe.label}
              {selectedTimeframe === timeframe.value && (
                <Check className="ml-1.5 h-4 w-4" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80 mb-6">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 25,
                left: 25,
                bottom: 30
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                tick={{ fontSize: 11 }}
                minTickGap={20}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis 
                tickFormatter={formatCurrencyShort}
                tick={{ fontSize: 11 }}
                width={55}
                domain={['auto', 'auto']}
              />
              <Tooltip 
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Legend 
                verticalAlign="top" 
                height={40}
                wrapperStyle={{ 
                  paddingBottom: 10,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              />
              <Line
                type="monotone"
                dataKey="Portfolio"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Nifty 50"
                stroke="#16a34a"
                strokeWidth={2}
                dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="Gold"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: "#f59e0b", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center p-4">
              <BarChart2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p>No data available for selected timeframe</p>
              <p className="text-sm mt-1">
                Try selecting a different range
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Returns Comparison Table */}
      <div className="border-t pt-6">
        <h4 className="text-md font-medium mb-4">Returns Comparison</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Portfolio</div>
            <div className="text-2xl font-bold text-blue-700">
              {filteredReturns.portfolio !== undefined 
                ? formatPercent(filteredReturns.portfolio)
                : formatPercent(performance.returns.portfolio['1year'])}
            </div>
            <div className="text-xs text-blue-600">vs selected period</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Nifty 50</div>
            <div className="text-2xl font-bold text-green-700">
              {filteredReturns.nifty50 !== undefined 
                ? formatPercent(filteredReturns.nifty50)
                : formatPercent(performance.returns.nifty50['1year'])}
            </div>
            <div className="text-xs text-green-600">vs selected period</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-sm text-yellow-600 font-medium">Gold</div>
            <div className="text-2xl font-bold text-yellow-700">
              {filteredReturns.gold !== undefined 
                ? formatPercent(filteredReturns.gold)
                : formatPercent(performance.returns.gold['1year'])}
            </div>
            <div className="text-xs text-yellow-600">vs selected period</div>
          </div>
        </div>
      </div>
    </div>
  );
}