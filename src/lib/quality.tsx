import { useEffect, useState, type ReactNode } from 'react'
import { QualityContext } from './quality-context'
import type { QualityContextValue } from './quality-context'
import type { QualityTier } from './quality-types'

function detectQuality(): QualityTier {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  const mobile = window.matchMedia('(max-width: 700px)').matches || coarsePointer
  const device = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }
  const lowMemory = device.deviceMemory !== undefined && device.deviceMemory <= 2
  const lowCpu = device.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 2
  if (reducedMotion || (mobile && (lowMemory || lowCpu))) return 'low'
  if (mobile || lowMemory || lowCpu) return 'medium'
  return 'high'
}

export function QualityProvider({ children }: { children: ReactNode }) {
  const [systemTier, setSystemTier] = useState<QualityTier>(() =>
    typeof window === 'undefined' ? 'high' : detectQuality(),
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarsePointer = window.matchMedia('(pointer: coarse)')
    const update = () => setSystemTier(detectQuality())
    media.addEventListener('change', update)
    coarsePointer.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      media.removeEventListener('change', update)
      coarsePointer.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const value: QualityContextValue = { tier: systemTier }

  useEffect(() => {
    document.documentElement.dataset.quality = value.tier
  }, [value.tier])

  return <QualityContext.Provider value={value}>{children}</QualityContext.Provider>
}
