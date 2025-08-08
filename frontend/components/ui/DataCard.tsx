import { ReactNode } from 'react'

interface DataCardProps {
  title: string
  value: string
  icon: ReactNode
  trend: 'up' | 'down' | 'neutral'
  className?: string
}

export default function DataCard({ title, value, icon, trend, className = '' }: DataCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50'
      case 'down': return 'text-red-600 bg-red-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${className || 'text-gray-900'}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${getTrendColor()}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
