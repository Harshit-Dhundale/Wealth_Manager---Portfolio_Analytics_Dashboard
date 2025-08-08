import { Suspense } from 'react'
import { PortfolioProvider } from '@/context/PortfolioContext'
import DashboardOverviewCards from '@/components/DashboardOverviewCards'
import AllocationCharts from '@/components/AllocationCharts'
import HoldingsTable from '@/components/HoldingsTable'
import PerformanceChart from '@/components/PerformanceChart'
import TopPerformers from '@/components/TopPerformers'
import LoadingSkeleton from '@/components/ui/LoadingSkeleton'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

export default function Dashboard() {
  return (
    <PortfolioProvider>
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Dashboard</h1>
            <p className="text-gray-600">Track your investments and performance</p>
          </div>

          <div className="space-y-8">
            {/* Overview Cards */}
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton type="cards" />}>
                <DashboardOverviewCards />
              </Suspense>
            </ErrorBoundary>

            {/* Optimized Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-4">
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton type="chart" />}>
                    <AllocationCharts />
                  </Suspense>
                </ErrorBoundary>
              </div>
              <div className="lg:col-span-1">
                <ErrorBoundary>
                  <Suspense fallback={<LoadingSkeleton type="chart" />}>
                    <TopPerformers />
                  </Suspense>
                </ErrorBoundary>
              </div>
            </div>

            {/* Performance Chart */}
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton type="chart" />}>
                <PerformanceChart />
              </Suspense>
            </ErrorBoundary>

            {/* Holdings Table */}
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton type="table" />}>
                <HoldingsTable />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </PortfolioProvider>
  )
}