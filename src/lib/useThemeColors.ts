import { useEffect, useState } from 'react'
import { AdditiveBlending, NormalBlending } from 'three'

const darkPalette = {
  isDark: true,
  background: '#0d0d0f',
  accent: '#d4af37',
  particle: '#f2d77b',
  keyLight: '#f1c95f',
  ambientLight: '#fff8e5',
  ambientIntensity: 0.4,
  secondaryLight: '#f0ede6',
  secondaryIntensity: 3,
  particleBlending: AdditiveBlending,
}

const lightPalette = {
  isDark: false,
  background: '#f7f5f1',
  accent: '#85650d',
  particle: '#725816',
  keyLight: '#9a7b1f',
  ambientLight: '#665a3a',
  ambientIntensity: 0.85,
  secondaryLight: '#584d32',
  secondaryIntensity: 2,
  particleBlending: NormalBlending,
}

export function useThemeColors() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => setIsDark(root.classList.contains('dark')))
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark ? darkPalette : lightPalette
}
