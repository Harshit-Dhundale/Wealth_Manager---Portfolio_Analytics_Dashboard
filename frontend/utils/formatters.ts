export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatPercent = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value)
}

export const getPerformanceColor = (value: number): string => {
  return value >= 0 ? 'text-green-600' : 'text-red-600'
}

export const getPerformanceBgColor = (value: number): string => {
  return value >= 0 ? 'bg-green-50' : 'bg-red-50'
}
