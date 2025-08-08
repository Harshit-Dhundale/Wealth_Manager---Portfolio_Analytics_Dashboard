'use client'

import useSWR from 'swr'
import { fetchPortfolioData } from '@/utils/apiClient'
import { PortfolioData } from '@/utils/types'

export function usePortfolioData() {
  const { data, error, isLoading, mutate } = useSWR<PortfolioData>(
    'portfolio',
    fetchPortfolioData,
    {
      // refreshInterval: 30000,
      revalidateOnFocus: true,
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (err) => console.error('Error fetching portfolio data:', err),
      onSuccess: (data) => console.log('Portfolio data loaded:', data)
    }
  )

  return {
    data,
    isLoading,
    error,
    mutate,
  }
}
