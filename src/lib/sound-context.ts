import { createContext, useContext } from 'react'

export type SoundCue = 'tick' | 'whoosh' | 'match'

export interface SoundContextValue {
  enabled: boolean
  toggle: () => void
  play: (cue: SoundCue) => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)

export function useMuseumSound() {
  const context = useContext(SoundContext)
  if (!context) throw new Error('useMuseumSound must be used within SoundProvider')
  return context
}
