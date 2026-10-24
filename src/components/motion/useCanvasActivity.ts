import { useEffect, useRef, useState, type RefObject } from 'react'

export function useCanvasActivity(targetRef: RefObject<Element | null>) {
  const [active, setActive] = useState(false)
  const intersecting = useRef(false)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const updateActivity = () => setActive(intersecting.current && !document.hidden)
    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
          intersecting.current = entry.isIntersecting
          updateActivity()
        }, { rootMargin: '120px' })

    if (observer) {
      observer.observe(target)
    } else {
      intersecting.current = true
      updateActivity()
    }

    document.addEventListener('visibilitychange', updateActivity)
    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', updateActivity)
    }
  }, [targetRef])

  return active
}
