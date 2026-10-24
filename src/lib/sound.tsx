import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { SoundContext, type SoundCue } from './sound-context'

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const contextRef = useRef<AudioContext | null>(null)
  const ambientRef = useRef<{ oscillator: OscillatorNode; gain: GainNode }[]>([])

  const stopAmbient = useCallback(() => {
    const audioContext = contextRef.current
    for (const voice of ambientRef.current) {
      voice.gain.gain.setTargetAtTime(0.0001, audioContext?.currentTime ?? 0, 0.18)
      voice.oscillator.stop((audioContext?.currentTime ?? 0) + 0.8)
    }
    ambientRef.current = []
  }, [])

  const toggle = useCallback(() => {
    if (enabled) {
      stopAmbient()
      setEnabled(false)
      return
    }
    const audioContext = contextRef.current ?? new AudioContext()
    contextRef.current = audioContext
    void audioContext.resume()
    ambientRef.current = [55, 82.4].map((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      oscillator.type = index === 0 ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(index === 0 ? 0.012 : 0.006, audioContext.currentTime + 1.2)
      oscillator.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start()
      return { oscillator, gain }
    })
    setEnabled(true)
  }, [enabled, stopAmbient])

  const play = useCallback((cue: SoundCue) => {
    if (!enabled || !contextRef.current) return
    const audioContext = contextRef.current
    void audioContext.resume()
    const frequencies = cue === 'match' ? [523.25, 659.25, 783.99] : [cue === 'whoosh' ? 220 : 880]
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const filter = audioContext.createBiquadFilter()
      const now = audioContext.currentTime
      oscillator.type = cue === 'whoosh' ? 'sawtooth' : 'sine'
      oscillator.frequency.setValueAtTime(cue === 'whoosh' ? 150 : frequency, now)
      if (cue === 'whoosh') oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.28)
      filter.type = 'lowpass'
      filter.frequency.value = cue === 'whoosh' ? 850 : 3600
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(cue === 'tick' ? 0.012 : 0.035, now + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + (cue === 'whoosh' ? 0.32 : 0.2) + index * 0.035)
      oscillator.connect(filter)
      filter.connect(gain)
      gain.connect(audioContext.destination)
      oscillator.start(now)
      oscillator.stop(now + (cue === 'whoosh' ? 0.34 : 0.24) + index * 0.035)
    })
  }, [enabled])

  useEffect(() => () => {
    stopAmbient()
    void contextRef.current?.close()
  }, [stopAmbient])

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, play, toggle])
  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
