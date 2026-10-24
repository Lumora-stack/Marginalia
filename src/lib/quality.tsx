import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { QualityContext } from './quality-context'
import type { QualityContextValue } from './quality-context'
import type { QualityTier } from './quality-types'

const tiers: QualityTier[] = ['low', 'medium', 'high', 'ultra']

const queryOverride = (): QualityTier | null => {
  const fx = new URLSearchParams(window.location.search).get('fx')
  return tiers.includes(fx as QualityTier) ? fx as QualityTier : null
}

function detectQuality(): QualityTier {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const mobile = window.matchMedia('(max-width: 700px)').matches
  const device = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }
  const lowMemory = device.deviceMemory !== undefined && device.deviceMemory <= 2
  const lowCpu = device.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 2
  if (reducedMotion || (mobile && (lowMemory || lowCpu))) return 'low'
  if (mobile || lowMemory || lowCpu) return 'medium'
  return 'high'
}

function hasHardLowLimit(): boolean {
  const device = navigator as Navigator & { deviceMemory?: number; hardwareConcurrency?: number }
  const mobile = window.matchMedia('(max-width: 700px)').matches
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    (mobile && (
      (device.deviceMemory !== undefined && device.deviceMemory <= 2) ||
      (device.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 2)
    ))
}

export function QualityProvider({ children }: { children: ReactNode }) {
  const [systemTier, setSystemTier] = useState<QualityTier>(() =>
    typeof window === 'undefined' ? 'high' : detectQuality(),
  )
  const [override, setOverrideState] = useState<QualityTier | null>(() =>
    typeof window === 'undefined' ? null : queryOverride(),
  )
  const [hardLow, setHardLow] = useState(() =>
    typeof window !== 'undefined' && hasHardLowLimit(),
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => {
      setSystemTier(detectQuality())
      setHardLow(hasHardLowLimit())
    }
    media.addEventListener('change', update)
    window.addEventListener('resize', update)
    const handlePopState = () => setOverrideState(queryOverride())
    window.addEventListener('popstate', handlePopState)
    return () => {
      media.removeEventListener('change', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  const setOverride = useCallback((tier: QualityTier | null) => {
    setOverrideState(tier)
    const url = new URL(window.location.href)
    if (tier) url.searchParams.set('fx', tier)
    else url.searchParams.delete('fx')
    window.history.replaceState(window.history.state, '', url)
  }, [])

  const value = useMemo((): QualityContextValue => ({
    tier: hardLow ? 'low' : override ?? systemTier,
    setOverride,
  }), [hardLow, override, setOverride, systemTier])

  useEffect(() => {
    document.documentElement.dataset.fx = value.tier
  }, [value.tier])

  return <QualityContext.Provider value={value}>{children}</QualityContext.Provider>
}
