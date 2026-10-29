import { useEffect, useState } from 'react'

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
}

const acidLimePalette = {
  isDark: true,
  background: '#030407',
  accent: '#D4FF24',
  particle: '#1558C9',
  keyLight: '#D4FF24',
  ambientLight: '#1558C9',
  ambientIntensity: 0.4,
  secondaryLight: '#1558C9',
  secondaryIntensity: 3,
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
}

export function useThemeColors() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  )
  const [isAcidLime, setIsAcidLime] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'acid-lime',
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
      setIsAcidLime(root.dataset.theme === 'acid-lime')
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class', 'data-theme'] })
    return () => observer.disconnect()
  }, [])

  return isAcidLime ? acidLimePalette : isDark ? darkPalette : lightPalette
}
