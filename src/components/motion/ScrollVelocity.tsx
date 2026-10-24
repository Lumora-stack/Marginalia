import { useEffect } from 'react'

export default function ScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let previousY = window.scrollY
    let velocity = 0
    let frame = 0

    const decay = () => {
      velocity *= 0.84
      document.documentElement.style.setProperty('--scroll-skew', `${Math.max(-2.4, Math.min(2.4, velocity * 0.018))}deg`)
      document.documentElement.style.setProperty('--scroll-offset', `${Math.max(-24, Math.min(24, velocity * 0.12))}px`)
      if (Math.abs(velocity) > 0.15) frame = requestAnimationFrame(decay)
      else frame = 0
    }
    const onScroll = () => {
      const nextY = window.scrollY
      velocity = nextY - previousY
      previousY = nextY
      if (!frame) frame = requestAnimationFrame(decay)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
      document.documentElement.style.removeProperty('--scroll-skew')
      document.documentElement.style.removeProperty('--scroll-offset')
    }
  }, [])

  return null
}
