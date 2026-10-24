import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useReducedMotion } from 'framer-motion'
import { useQuality } from '../../lib/quality-context'
import { qualityAtLeast } from '../../lib/quality-types'
import type { Artwork } from '../../lib/supabase'
import { useCanvasActivity } from '../motion/useCanvasActivity'

type WalkState = {
  keys: Set<string>
  yaw: number
  pitch: number
  pendingIndex: number | null
}

type WalkInput =
  | { type: 'key'; key: string; pressed: boolean }
  | { type: 'clear' }
  | { type: 'look'; dx: number; dy: number }
  | { type: 'focus'; index: number }

function WalkController({
  events,
  onSelect,
  corridorLength,
}: {
  events: EventTarget
  onSelect: (index: number) => void
  corridorLength: number
}) {
  const state = useRef<WalkState>({ keys: new Set(), yaw: 0, pitch: 0, pendingIndex: null })
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])
  useEffect(() => {
    const onInput = (event: Event) => {
      const input = (event as CustomEvent<WalkInput>).detail
      if (input.type === 'key') {
        if (input.pressed) state.current.keys.add(input.key)
        else state.current.keys.delete(input.key)
      } else if (input.type === 'clear') {
        state.current.keys.clear()
      } else if (input.type === 'look') {
        state.current.yaw -= input.dx * 0.004
        state.current.pitch = Math.max(-0.55, Math.min(0.55, state.current.pitch - input.dy * 0.003))
      } else {
        state.current.pendingIndex = input.index
      }
    }
    events.addEventListener('walk-input', onInput)
    return () => events.removeEventListener('walk-input', onInput)
  }, [events])

  useFrame(({ camera }, delta) => {
    const walk = state.current
    if (walk.pendingIndex !== null) {
      const index = walk.pendingIndex
      const side = index % 2 === 0 ? -1 : 1
      const targetZ = -Math.floor(index / 2) * 4 - 1
      const targetX = side * 2.35
      const targetYaw = side * Math.PI / 2
      camera.position.x += (targetX - camera.position.x) * (1 - Math.exp(-delta * 3.5))
      camera.position.y += (1.65 - camera.position.y) * (1 - Math.exp(-delta * 3.5))
      camera.position.z += (targetZ - camera.position.z) * (1 - Math.exp(-delta * 3.5))
      walk.yaw += (targetYaw - walk.yaw) * (1 - Math.exp(-delta * 3.5))
      walk.pitch *= Math.exp(-delta * 3.5)
      if (Math.abs(camera.position.x - targetX) < 0.08 && Math.abs(camera.position.z - targetZ) < 0.08) {
        walk.pendingIndex = null
        onSelectRef.current(index)
      }
    } else {
      const keys = walk.keys
      const forward = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
      const strafe = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
      const distance = delta * 3.6
      camera.position.x += (Math.sin(walk.yaw) * forward + Math.cos(walk.yaw) * strafe) * distance
      camera.position.z += (-Math.cos(walk.yaw) * forward + Math.sin(walk.yaw) * strafe) * distance
      camera.position.x = Math.max(-2.55, Math.min(2.55, camera.position.x))
      camera.position.z = Math.max(-corridorLength + 5, Math.min(7, camera.position.z))
    }
    camera.position.y = 1.65
    camera.rotation.order = 'YXZ'
    camera.rotation.set(walk.pitch, walk.yaw, 0, 'YXZ')
  })
  return null
}

function WallArtwork({
  artwork,
  index,
  onFocus,
}: {
  artwork: Artwork
  index: number
  onFocus: () => void
}) {
  const side = index % 2 === 0 ? -1 : 1
  const x = side * 4.05
  const y = 1.75
  const z = -Math.floor(index / 2) * 4 - 1
  const rotation = [0, -side * Math.PI / 4, 0] as [number, number, number]

  return (
    <group position={[x, y, z]}>
      <pointLight position={[-side * 0.35, 0.35, 0.7]} color="#f5d779" intensity={4.2} distance={5} />
      <Html transform distanceFactor={7} rotation={rotation}>
        <button
          type="button"
          onClick={onFocus}
          aria-label={`Focus on ${artwork.title}`}
          className="group block w-[170px] overflow-hidden border-[8px] border-[#b8943b] bg-[#171613] p-2 text-left shadow-[0_16px_44px_rgba(0,0,0,.45)] transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <img
            src={artwork.thumbnail_url || artwork.image_url}
            alt={artwork.title}
            width={artwork.width ?? 800}
            height={artwork.height ?? 600}
            loading="lazy"
            className="h-[132px] w-full object-cover"
          />
          <span className="block truncate px-1 pt-2 font-serif text-sm text-[#f0ede6]">
            {artwork.title}
          </span>
        </button>
      </Html>
    </group>
  )
}

export default function GalleryWall({
  artworks,
  onSelect,
}: {
  artworks: Artwork[]
  onSelect: (index: number) => void
}) {
  const shouldReduceMotion = useReducedMotion()
  const { tier } = useQuality()
  const wrapper = useRef<HTMLDivElement>(null)
  const canvasActive = useCanvasActivity(wrapper)
  const dragging = useRef<{ pointerId: number; x: number; y: number } | null>(null)
  const deviceMemory = typeof navigator !== 'undefined'
    ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory
    : undefined
  const lowMemory = deviceMemory !== undefined && deviceMemory <= 2
  const lowEffects = !qualityAtLeast(tier, 'medium')
  const reducedOrConstrained = shouldReduceMotion || lowMemory || lowEffects
  const smallScreen = typeof window !== 'undefined' && window.matchMedia('(max-width: 640px)').matches
  const corridorLength = Math.max(16, Math.ceil(artworks.length / 2) * 4 + 8)
  const [walkEvents] = useState(() => new EventTarget())
  const sendWalkInput = useCallback((input: WalkInput) => {
    walkEvents.dispatchEvent(new CustomEvent<WalkInput>('walk-input', { detail: input }))
  }, [walkEvents])

  useEffect(() => {
    const target = wrapper.current
    if (!target || reducedOrConstrained) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (!target.contains(event.target as Node)) return
      const key = event.key.toLowerCase()
      if (!['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) return
      event.preventDefault()
      sendWalkInput({ type: 'key', key, pressed: true })
    }
    const onKeyUp = (event: KeyboardEvent) => sendWalkInput({ type: 'key', key: event.key.toLowerCase(), pressed: false })
    const clearKeys = () => sendWalkInput({ type: 'clear' })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearKeys)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearKeys)
    }
  }, [reducedOrConstrained, sendWalkInput])

  const startLook = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedOrConstrained || (event.target as HTMLElement).closest('button')) return
    dragging.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveLook = (event: PointerEvent<HTMLDivElement>) => {
    const active = dragging.current
    if (!active || active.pointerId !== event.pointerId) return
    const dx = event.clientX - active.x
    const dy = event.clientY - active.y
    active.x = event.clientX
    active.y = event.clientY
    sendWalkInput({ type: 'look', dx, dy })
  }

  const stopLook = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging.current?.pointerId === event.pointerId) dragging.current = null
  }

  const setWalkKey = (key: string, pressed: boolean) => {
    sendWalkInput({ type: 'key', key, pressed })
  }

  if (reducedOrConstrained) {
    return (
      <div className="grid grid-cols-2 gap-3 rounded-3xl border border-ink/10 bg-[#11100e] p-4 sm:grid-cols-3 md:grid-cols-4">
        {artworks.slice(0, 20).map((artwork, index) => (
          <button
            key={artwork.id}
            type="button"
            onClick={() => onSelect(index)}
            className="overflow-hidden border-[6px] border-[#b8943b] bg-[#171613] p-1 text-left text-[#f0ede6] shadow-lg"
          >
            <img src={artwork.thumbnail_url || artwork.image_url} alt={artwork.title} width={artwork.width ?? 800} height={artwork.height ?? 600} loading="lazy" className="aspect-square w-full object-cover" />
            <span className="block truncate px-1 py-2 font-serif text-xs">{artwork.title}</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={wrapper}
      tabIndex={0}
      onPointerDown={startLook}
      onPointerMove={moveLook}
      onPointerUp={stopLook}
      onPointerCancel={stopLook}
      className="relative h-[32rem] overflow-hidden rounded-3xl border border-ink/10 bg-[#11100e] shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-accent sm:h-[40rem]"
      aria-label="Walkable gallery. Use WASD or arrow keys to move and drag to look around."
    >
      <Canvas
        frameloop={canvasActive ? 'always' : 'never'}
        dpr={smallScreen ? 1 : [1, 1.5]}
        camera={{ position: [0, 1.65, 7], fov: 64 }}
        gl={{ powerPreference: 'low-power', antialias: !smallScreen }}
        onCreated={({ gl }) => { gl.domElement.style.pointerEvents = 'none' }}
      >
        <color attach="background" args={['#11100e']} />
        <fog attach="fog" args={['#11100e', 12, corridorLength + 3]} />
        <ambientLight intensity={0.6} />
        <WalkController events={walkEvents} onSelect={onSelect} corridorLength={corridorLength} />
        <mesh position={[0, -0.15, -corridorLength / 2]}>
          <boxGeometry args={[8, 0.3, corridorLength]} />
          <meshStandardMaterial color="#33302a" metalness={0.72} roughness={0.24} />
        </mesh>
        {[-4.2, 4.2].map(x => (
          <mesh key={x} position={[x, 1.7, -corridorLength / 2]}>
            <boxGeometry args={[0.22, 4, corridorLength]} />
            <meshStandardMaterial color="#211f1b" metalness={0.22} roughness={0.68} />
          </mesh>
        ))}
        {artworks.slice(0, 20).map((artwork, index) => (
          <WallArtwork
            key={artwork.id}
            artwork={artwork}
            index={index}
            onFocus={() => sendWalkInput({ type: 'focus', index })}
          />
        ))}
      </Canvas>
      <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-2 text-[10px] font-mono uppercase tracking-widest text-white/70 backdrop-blur">
        {smallScreen ? 'Drag to look · Move to walk' : 'WASD / arrows to walk · Drag to look'}
      </div>
      {smallScreen && (
        <div className="pointer-events-none absolute bottom-4 left-4 grid grid-cols-3 gap-1">
          <span />
          <button
            type="button"
            aria-label="Move forward"
            onPointerDown={event => { event.preventDefault(); setWalkKey('arrowup', true) }}
            onPointerUp={() => setWalkKey('arrowup', false)}
            onPointerLeave={() => setWalkKey('arrowup', false)}
            onPointerCancel={() => setWalkKey('arrowup', false)}
            className="pointer-events-auto h-10 w-10 rounded-lg border border-white/20 bg-black/55 text-white backdrop-blur"
          >↑</button>
          <span />
          {[
            ['arrowleft', '←', 'Move left'],
            ['arrowdown', '↓', 'Move backward'],
            ['arrowright', '→', 'Move right'],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              type="button"
              aria-label={label}
              onPointerDown={event => { event.preventDefault(); setWalkKey(key, true) }}
              onPointerUp={() => setWalkKey(key, false)}
              onPointerLeave={() => setWalkKey(key, false)}
              onPointerCancel={() => setWalkKey(key, false)}
              className="pointer-events-auto h-10 w-10 rounded-lg border border-white/20 bg-black/55 text-white backdrop-blur"
            >{icon}</button>
          ))}
        </div>
      )}
      {artworks.length > 20 && (
        <p className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 text-center text-[10px] font-mono text-white/50">
          Showing 20 framed works · use Masonry to browse the complete collection
        </p>
      )}
    </div>
  )
}
