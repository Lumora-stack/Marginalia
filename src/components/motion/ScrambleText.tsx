import { useEffect, useRef, useState } from 'react'
import { useQuality } from '../../lib/quality-context'
import { qualityAtLeast } from '../../lib/quality-types'

const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&'

export default function ScrambleText({ text, className = '' }: { text: string; className?: string }) {
  const [value, setValue] = useState(text)
  const timer = useRef<number | undefined>(undefined)
  const { tier } = useQuality()

  useEffect(() => () => {
    if (timer.current !== undefined) window.clearInterval(timer.current)
  }, [])

  const scramble = () => {
    if (!qualityAtLeast(tier, 'medium')) return
    if (timer.current !== undefined) window.clearInterval(timer.current)
    const characters = text.split('')
    let tick = 0
    timer.current = window.setInterval(() => {
      tick += 1
      setValue(characters.map((character, index) => {
        if (character === ' ' || index < Math.floor(tick / 2)) return character
        return glyphs[Math.floor(Math.random() * glyphs.length)]
      }).join(''))
      if (tick >= text.length * 2) {
        if (timer.current !== undefined) window.clearInterval(timer.current)
        timer.current = undefined
        setValue(text)
      }
    }, 24)
  }
  const reset = () => {
    if (timer.current !== undefined) window.clearInterval(timer.current)
    timer.current = undefined
    setValue(text)
  }

  return (
    <span className={className} aria-label={text} onMouseEnter={scramble} onMouseLeave={reset}>
      {value}
    </span>
  )
}
