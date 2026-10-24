import { useEffect, useRef } from 'react'
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useQuality } from '../../lib/quality-context'
import { useMuseumSound } from '../../lib/sound-context'

export default function RouteWipe() {
  const { pathname } = useLocation()
  const { tier } = useQuality()
  const previousPath = useRef(pathname)
  const sound = useMuseumSound()
  const playSound = useRef(sound.play)
  const controls = useAnimationControls()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    playSound.current = sound.play
  }, [sound.play])

  useEffect(() => {
    if (previousPath.current === pathname) return
    previousPath.current = pathname
    if (tier === 'low' || reducedMotion) return
    playSound.current('whoosh')
    controls.stop()
    controls.set({ scaleY: 0, transformOrigin: 'top' })
    void controls.start({
      scaleY: 1,
      transition: { duration: 0.36, ease: [0.76, 0, 0.24, 1] },
    }).then(() => controls.start({
      scaleY: 0,
      transformOrigin: 'bottom',
      transition: { duration: 0.36, ease: [0.76, 0, 0.24, 1] },
    }))
    return () => controls.stop()
  }, [controls, pathname, reducedMotion, tier])

  if (tier === 'low') return null
  return <motion.div
    aria-hidden="true"
    initial={{ scaleY: 0 }}
    animate={controls}
    className={`liquid-route-wipe fixed inset-0 z-[10000] pointer-events-none ${tier === 'medium' ? 'route-wipe-medium' : ''}`}
    style={{ transformOrigin: 'top' }}
  />
}
