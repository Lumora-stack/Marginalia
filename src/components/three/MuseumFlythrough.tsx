import { useEffect, useMemo, useRef, useState } from 'react'
import type { MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, MeshReflectorMaterial } from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CatmullRomCurve3, Color, Float32BufferAttribute, BufferGeometry, Vector3 } from 'three'
import type { Group } from 'three'
import { getMockArtworks } from '../../lib/mock-artworks'
import { isMockGalleryEnabled, isSupabaseConfigured, supabase, type Artwork } from '../../lib/supabase'
import { CATEGORIES } from '../../lib/categories'
import { qualityAtLeast, type QualityTier } from '../../lib/quality-types'
import { useCanvasActivity } from '../motion/useCanvasActivity'
import { useThemeColors } from '../../lib/useThemeColors'

const fallbackFrames = CATEGORIES.slice(0, 6).map((category, index) => ({
  id: `cover-${category.id}`,
  title: category.label,
  thumbnail_url: category.img,
  image_url: category.img,
  section: category.id,
  display_order: index,
  created_at: new Date(0).toISOString(),
  user_id: '',
}))

function Dust() {
  const geometry = useMemo(() => {
    const positions = new Float32Array(900 * 3)
    for (let i = 0; i < 900; i++) {
      const sample = (seed: number) => {
        const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453
        return value - Math.floor(value)
      }
      positions[i * 3] = (sample(i + 1) - 0.5) * 9
      positions[i * 3 + 1] = (sample(i + 2) - 0.5) * 6
      positions[i * 3 + 2] = -sample(i + 3) * 32
    }
    const points = new BufferGeometry()
    points.setAttribute('position', new Float32BufferAttribute(positions, 3))
    return points
  }, [])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#f6d77c" size={0.025} transparent opacity={0.62} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function ArtworkFrame({ artwork, index, quality, colors }: {
  artwork: Artwork
  index: number
  quality: QualityTier
  colors: ReturnType<typeof useThemeColors>
}) {
  const side = index % 2 === 0 ? -1 : 1
  const row = Math.floor(index / 2)
  const position: [number, number, number] = [side * 4.15, row % 2 === 0 ? 0.15 : 0.65, -4 - row * 5.2]
  const frameRef = useRef<Group>(null)
  useFrame(({ camera }, delta) => {
    if (!frameRef.current) return
    const distance = Math.abs(camera.position.z - position[2])
    const targetTilt = Math.max(0, 1 - distance / 8) * -side * 0.28
    frameRef.current.rotation.y += (targetTilt - frameRef.current.rotation.y) * Math.min(1, delta * 2)
  })

  return (
    <group ref={frameRef} position={position}>
      <mesh>
        <boxGeometry args={[2.2, 1.72, 0.16]} />
        <meshStandardMaterial color={colors.accent} metalness={0.72} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0, 0.09]}>
        <planeGeometry args={[1.98, 1.48]} />
        <meshBasicMaterial color={colors.background} />
      </mesh>
      <Html transform position={[0, 0, 0.105]} distanceFactor={7.2} occlude>
        <div
          className="pointer-events-none w-[220px] border-[6px] p-1 shadow-[0_15px_50px_rgba(0,0,0,.45)]"
          style={{
            borderColor: colors.accent,
            backgroundColor: colors.isDark ? '#171511' : '#eee8da',
          }}
        >
          <img
            src={artwork.thumbnail_url || artwork.image_url}
            alt=""
            width={artwork.width ?? 440}
            height={artwork.height ?? 320}
            className="h-[142px] w-full object-cover"
            loading="lazy"
          />
          <p
            className="truncate px-2 pt-2 text-center font-serif text-sm"
            style={{ color: colors.isDark ? '#f3e6bc' : '#252218' }}
          >
            {artwork.title}
          </p>
        </div>
      </Html>
      <pointLight position={[0, 1.25, 1.5]} intensity={quality === 'ultra' ? 18 : 11} distance={5.5} color={colors.keyLight} />
    </group>
  )
}

function Corridor({ artworks, quality, progress, colors }: {
  artworks: Artwork[]
  quality: QualityTier
  progress: MutableRefObject<number>
  colors: ReturnType<typeof useThemeColors>
}) {
  const cameraCurve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, 0.15, 5.5),
    new Vector3(0, 0.1, 0),
    new Vector3(0.4, 0.05, -8),
    new Vector3(-0.35, 0, -16),
    new Vector3(0, 0, -27),
  ]), [])
  const color = useMemo(() => new Color(), [])
  const background = useMemo(() => new Color(colors.background), [colors.background])
  const destination = useMemo(
    () => new Color(colors.isDark ? '#211b0f' : '#e9e1ce'),
    [colors.isDark],
  )

  useFrame(({ camera, scene }, delta) => {
    const value = Math.min(1, Math.max(0, progress.current))
    const point = cameraCurve.getPointAt(value)
    const lookPoint = cameraCurve.getPointAt(Math.min(1, value + 0.035))
    camera.position.lerp(point, Math.min(1, delta * 5))
    camera.lookAt(lookPoint)
    color.copy(background).lerp(destination, value * 0.45)
    // Scroll-linked light/fog changes run directly on the Three scene, not through React state.
    // oxlint-disable-next-line react/immutability
    scene.background = color
    if (scene.fog) {
      // oxlint-disable-next-line react/immutability
      scene.fog.color.copy(color)
      if ('far' in scene.fog) {
        // oxlint-disable-next-line react/immutability
        scene.fog.far = 34 - value * 10
      }
    }
  })

  const frameLimit = quality === 'ultra' ? 12 : quality === 'high' ? 10 : 6
  return (
    <>
      <color attach="background" args={[colors.background]} />
      <fog attach="fog" args={[colors.background, 9, 34]} />
      <ambientLight intensity={colors.isDark ? 0.48 : 0.85} color={colors.ambientLight} />
      <pointLight position={[0, 0, 1]} intensity={32} distance={14} color={colors.keyLight} />
      <pointLight position={[0, 2, -15]} intensity={22} distance={18} color={colors.accent} />

      <group position={[0, 0, -2]}>
        <mesh position={[-4.8, 0, -13]}>
          <boxGeometry args={[0.18, 7, 29]} />
          <meshStandardMaterial color={colors.isDark ? '#211c13' : '#e6dfcf'} metalness={0.45} roughness={0.38} />
        </mesh>
        <mesh position={[4.8, 0, -13]}>
          <boxGeometry args={[0.18, 7, 29]} />
          <meshStandardMaterial color={colors.isDark ? '#211c13' : '#e6dfcf'} metalness={0.45} roughness={0.38} />
        </mesh>
        <mesh position={[0, 3.5, -13]}>
          <boxGeometry args={[9.6, 0.18, 29]} />
          <meshStandardMaterial color={colors.isDark ? '#171511' : '#eee9de'} metalness={0.35} roughness={0.42} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.48, -13]}>
          <planeGeometry args={[9.6, 30]} />
          {qualityAtLeast(quality, 'high')
            ? <MeshReflectorMaterial blur={[240, 80]} resolution={quality === 'ultra' ? 512 : 256} mixBlur={1} mixStrength={0.45} roughness={0.36} metalness={0.62} color={colors.isDark ? '#403720' : '#d9d0bb'} mirror={0.48} />
            : <meshStandardMaterial color={colors.isDark ? '#282216' : '#e3dccb'} metalness={0.62} roughness={0.32} />}
        </mesh>
        <group position={[0, 0, 1]}>
          <mesh>
            <boxGeometry args={[3.1, 4.4, 0.18]} />
            <meshStandardMaterial color={colors.accent} wireframe metalness={0.8} />
          </mesh>
          <mesh position={[0, 0, -0.12]}>
            <planeGeometry args={[2.8, 4.1]} />
            <meshBasicMaterial color={colors.accent} transparent opacity={0.12} />
          </mesh>
          <pointLight position={[0, 0, 1]} color={colors.keyLight} intensity={36} distance={10} />
        </group>
      </group>

      {artworks.slice(0, frameLimit).map((artwork, index) => (
        <ArtworkFrame key={`${artwork.id}-${index}`} artwork={artwork} index={index} quality={quality} colors={colors} />
      ))}
      <Dust />
    </>
  )
}

export default function MuseumFlythrough({ quality }: { quality: QualityTier }) {
  const rootRef = useRef<HTMLElement>(null)
  const canvasActive = useCanvasActivity(rootRef)
  const colors = useThemeColors()
  const progress = useRef(0)
  const [artworks, setArtworks] = useState<Artwork[]>(() =>
    isMockGalleryEnabled
      ? [...getMockArtworks('pencil-arts'), ...getMockArtworks('pixel-arts')]
      : fallbackFrames,
  )
  const progressBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isSupabaseConfigured && !isMockGalleryEnabled) {
      let active = true
      void (async () => {
        try {
          const { data, error } = await supabase.from('artworks')
            .select('id, section, title, image_url, thumbnail_url, width, height, display_order, created_at, user_id')
            .order('created_at', { ascending: false })
            .limit(12)
          if (error) throw error
          if (active && data?.length) {
            setArtworks(data as Artwork[])
            window.dispatchEvent(new Event('artville:layoutchange'))
          }
        } catch (error) {
          console.error('Could not load flythrough artwork thumbnails:', error)
        }
      })()
      return () => { active = false }
    }
  }, [])

  useEffect(() => {
    const element = rootRef.current
    if (!element) return
    gsap.registerPlugin(ScrollTrigger)
    const context = gsap.context(() => {
      gsap.to(progress, {
        current: 1,
        ease: 'none',
        onUpdate: () => {
          if (progressBarRef.current) {
            gsap.set(progressBarRef.current, { scaleX: progress.current })
          }
        },
        scrollTrigger: {
          trigger: element,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.1,
        },
      })
    }, element)
    ScrollTrigger.refresh()
    return () => context.revert()
  }, [])

  return (
    <section ref={rootRef} className="museum-scroll-distance relative -mx-6 my-14 h-[180vh] overflow-clip" aria-label="Walk through the permanent collection">
      <div className="sticky top-0 viewport-screen h-screen min-h-[560px] overflow-hidden" style={{ backgroundColor: colors.background }}>
        <Canvas
          frameloop={canvasActive ? 'always' : 'never'}
          dpr={[1, quality === 'ultra' ? 1.6 : quality === 'high' ? 1.35 : 1.1]}
          camera={{ position: [0, 0, 5.5], fov: 68, near: 0.1, far: 50 }}
          gl={{ powerPreference: 'high-performance', antialias: false }}
        >
          <Corridor artworks={artworks} quality={quality} progress={progress} colors={colors} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0d0d0f]/25 via-transparent to-[#0d0d0f]/70" />
        <div className="pointer-events-none absolute bottom-10 left-8 right-8 flex items-end justify-between">
          <div className="text-white">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-accent">A passage through the archive</p>
            <p className="font-serif text-3xl sm:text-5xl">Walk the collection</p>
          </div>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 sm:block">Scroll to move through the gallery</p>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-8 h-[2px] w-24 -translate-x-1/2 bg-white/10">
          <div ref={progressBarRef} className="h-full origin-left scale-x-0 bg-accent" />
        </div>
      </div>
    </section>
  )
}
