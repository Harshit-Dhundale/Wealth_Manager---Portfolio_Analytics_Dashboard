'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { usePortfolioData } from '@/hooks/usePortfolioData'
import { PortfolioData } from '@/utils/types'

interface PortfolioContextType {
  data: PortfolioData | undefined
  isLoading: boolean
  error: any
  mutate: () => void
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined)

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const portfolioData = usePortfolioData()

  return (
    <PortfolioContext.Provider value={portfolioData}>
      {children}
    </PortfolioContext.Provider>
  )
}

export function usePortfolioContext() {
  const context = useContext(PortfolioContext)
  if (context === undefined) {
    throw new Error('usePortfolioContext must be used within a PortfolioProvider')
  }
  return context
}
