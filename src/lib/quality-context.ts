import { createContext, useContext } from 'react'
import type { QualityTier } from './quality-types'

export interface QualityContextValue {
  tier: QualityTier
}

export const QualityContext = createContext<QualityContextValue | null>(null)

export function useQuality() {
  const context = useContext(QualityContext)
  if (!context) throw new Error('useQuality must be used within QualityProvider')
  return context
}
