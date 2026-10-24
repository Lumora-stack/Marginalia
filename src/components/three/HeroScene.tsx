import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import {
  Bloom,
  ChromaticAberration,
  DepthOfField,
  EffectComposer,
  GodRays,
  Noise,
  Vignette,
} from '@react-three/postprocessing'
import {
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  MathUtils,
  Color,
  Vector2,
  type Group,
  type Mesh,
  type Points as ThreePoints,
} from 'three'
import { qualityAtLeast, type QualityTier } from '../../lib/quality-types'
import { useThemeColors } from '../../lib/useThemeColors'

const PARTICLE_VERTEX = `
  attribute vec3 aFrame;
  attribute vec3 aBrush;
  attribute vec3 aWord;
  attribute float aSeed;
  uniform float uTime;
  uniform float uMorph;
  uniform vec2 uPointer;
  uniform float uPointSize;
  uniform vec3 uParticleColor;
  varying float vGlow;

  void main() {
    vec3 p = position;
    if (uMorph < 1.0) p = mix(position, aFrame, smoothstep(0.0, 1.0, uMorph));
    else if (uMorph < 2.0) p = mix(aFrame, aBrush, smoothstep(1.0, 2.0, uMorph));
    else p = mix(aBrush, aWord, smoothstep(2.0, 3.0, uMorph));

    float orbit = uTime * (0.12 + aSeed * 0.1);
    float c = cos(orbit);
    float s = sin(orbit);
    p.xy = mat2(c, -s, s, c) * p.xy;

    vec2 delta = p.xy - uPointer;
    float radius = length(delta);
    float influence = exp(-radius * 0.72);
    float swirl = influence * (0.18 + 0.08 * sin(uTime * 2.0 + aSeed * 16.0));
    p.xy += normalize(delta + vec2(0.0001)) * influence * 0.42;
    p.xy += vec2(-delta.y, delta.x) * swirl;
    p.z += sin(uTime * 0.8 + aSeed * 24.0) * 0.1 + influence * 0.2;

    vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = uPointSize * (0.72 + aSeed * 1.25) * (8.0 / -viewPosition.z);
    gl_PointSize = clamp(gl_PointSize, 1.0, 2.5);
    vGlow = 0.38 + 0.62 * influence + 0.2 * sin(uTime * 1.8 + aSeed * 30.0);
  }
`

const PARTICLE_FRAGMENT = `
  varying float vGlow;
  void main() {
    vec2 point = gl_PointCoord - 0.5;
    float radius = length(point);
    float core = 1.0 - smoothstep(0.035, 0.5, radius);
    float halo = exp(-radius * 12.0) * 0.35;
    float alpha = (core + halo) * vGlow * 0.24;
    vec3 gold = mix(uParticleColor * 0.55, uParticleColor, clamp(vGlow, 0.0, 1.0));
    gl_FragColor = vec4(gold, alpha);
  }
`

function seeded(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453123
  return value - Math.floor(value)
}

function textPoints(count: number): Float32Array {
  const result = new Float32Array(count * 3)
  if (typeof document === 'undefined') return result
  const canvas = document.createElement('canvas')
  canvas.width = 900
  canvas.height = 240
  const context = canvas.getContext('2d')
  if (!context) return result
  context.fillStyle = '#fff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = '700 148px "Playfair Display", Georgia, serif'
  context.fillText('ARTVILLE', 450, 120)
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels: [number, number][] = []
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] > 100) pixels.push([x, y])
    }
  }
  for (let i = 0; i < count; i++) {
    const pixel = pixels[Math.floor(seeded(i + 451) * pixels.length)] ?? [450, 120]
    result[i * 3] = (pixel[0] - 450) / 120
    result[i * 3 + 1] = (120 - pixel[1]) / 120
    result[i * 3 + 2] = (seeded(i + 791) - 0.5) * 0.18
  }
  return result
}

function particleGeometry(count: number): BufferGeometry {
  const geometry = new BufferGeometry()
  const sphere = new Float32Array(count * 3)
  const frame = new Float32Array(count * 3)
  const brush = new Float32Array(count * 3)
  const word = textPoints(count)
  const seed = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const arm = i % 5
    const angle = seeded(i * 7 + 1) * Math.PI * 2 + arm * Math.PI * 0.4
    const radius = 0.22 + seeded(i * 7 + 2) * 3.4
    const twist = angle + radius * 0.72
    const z = (seeded(i * 7 + 3) - 0.5) * (0.35 + radius * 0.12)
    sphere.set([Math.cos(twist) * radius, Math.sin(twist) * radius * 0.72, z], i * 3)

    const edge = Math.floor(seeded(i * 5 + 4) * 4)
    const edgeT = seeded(i * 5 + 5) * 2 - 1
    const edgeOffset = (seeded(i * 11 + 6) - 0.5) * 0.12
    const framePoint: [number, number] = edge === 0 ? [-3.1 + edgeOffset, edgeT * 1.72]
      : edge === 1 ? [3.1 + edgeOffset, edgeT * 1.72]
        : [edgeT * 3.1, (edge === 2 ? 1.72 : -1.72) + edgeOffset]
    frame.set([framePoint[0], framePoint[1], (seeded(i * 13 + 7) - 0.5) * 0.18], i * 3)

    const t = seeded(i * 17 + 8)
    const bristle = seeded(i * 17 + 9)
    const brushX = t < 0.72 ? -2.4 + t * 3.8 : 0.45 + bristle * 1.2
    const brushY = t < 0.72 ? -1.5 + t * 2.9 : 1.2 - bristle * 2.25
    brush.set([brushX, brushY, (seeded(i * 23 + 10) - 0.5) * 0.28], i * 3)
    seed[i] = seeded(i * 31 + 11)
  }

  geometry.setAttribute('position', new Float32BufferAttribute(sphere, 3))
  geometry.setAttribute('aFrame', new Float32BufferAttribute(frame, 3))
  geometry.setAttribute('aBrush', new Float32BufferAttribute(brush, 3))
  geometry.setAttribute('aWord', new Float32BufferAttribute(word, 3))
  geometry.setAttribute('aSeed', new Float32BufferAttribute(seed, 1))
  return geometry
}

function AdaptiveDpr({
  quality,
  onDecline,
  onIncline,
}: {
  quality: QualityTier
  onDecline: () => void
  onIncline: () => void
}) {
  const setDpr = useThree(state => state.setDpr)
  const desired = quality === 'ultra' ? 2 : quality === 'high' ? 1.5 : 1.25
  const sample = useRef({ elapsed: 0, frames: 0, reduced: false })

  useEffect(() => {
    sample.current = { elapsed: 0, frames: 0, reduced: false }
    setDpr(desired)
    onIncline()
  }, [desired, onIncline, quality, setDpr])

  useFrame((_, delta) => {
    if (quality === 'ultra') return
    sample.current.elapsed += delta
    sample.current.frames += 1
    if (sample.current.elapsed < 0.5) return

    const reduced = sample.current.frames / sample.current.elapsed < 50
    if (reduced !== sample.current.reduced) {
      sample.current.reduced = reduced
      setDpr(reduced ? 1 : desired)
      if (reduced) onDecline()
      else onIncline()
    }
    sample.current.elapsed = 0
    sample.current.frames = 0
  })

  return null
}

function WireShape({
  position,
  rotSpeed,
  color,
  scale = 1,
}: {
  position: [number, number, number]
  rotSpeed: number
  color: string
  scale?: number
}) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * rotSpeed
    ref.current.rotation.y += delta * rotSpeed * 0.75
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial color={color} wireframe transparent opacity={0.65} />
    </mesh>
  )
}

function RingShape({ position, rotSpeed, color, scale = 1 }: { position: [number, number, number]; rotSpeed: number; color: string; scale?: number }) {
  const ref = useRef<Mesh>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.x += delta * rotSpeed
    ref.current.rotation.z += delta * rotSpeed * 0.6
  })
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.48, 0.018, 8, 72]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  )
}

function FloatingPortal({ position, rotSpeed, color }: { position: [number, number, number]; rotSpeed: number; color: string }) {
  const ref = useRef<Group>(null)
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * rotSpeed
    ref.current.rotation.z += delta * (rotSpeed * 0.5)
  })
  return (
    <group ref={ref} position={position}>
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.02]} />
        <meshStandardMaterial color={color} wireframe transparent opacity={0.4} />
      </mesh>
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[0.82, 1.12]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} side={DoubleSide} />
      </mesh>
    </group>
  )
}

function MuseumDoorway({ color }: { color: string }) {
  const ref = useRef<Group>(null)
  useFrame((state, delta) => {
    if (!ref.current) return
    ref.current.rotation.y = MathUtils.lerp(ref.current.rotation.y, state.pointer.x * 0.06, 0.05)
    ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.45) * 0.06
    ref.current.rotation.z += delta * 0.008
  })
  return (
    <group ref={ref} position={[0, 0, -4.2]}>
      <mesh>
        <boxGeometry args={[2.55, 3.35, 0.11]} />
        <meshStandardMaterial color={color} wireframe transparent opacity={0.62} />
      </mesh>
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2.35, 3.15]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} side={DoubleSide} />
      </mesh>
      <mesh position={[0, -0.08, 0.08]}>
        <torusGeometry args={[0.42, 0.018, 8, 64]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function GalaxyParticles({
  quality,
  groupRef,
  colors,
}: {
  quality: QualityTier
  groupRef: RefObject<Group | null>
  colors: ReturnType<typeof useThemeColors>
}) {
  const pointsRef = useRef<ThreePoints>(null)
  const count = quality === 'ultra' ? 80000 : quality === 'high' ? 50000 : 24000
  const geometry = useMemo(() => particleGeometry(count), [count])
  const particleColor = useMemo(() => new Color(colors.particle), [colors.particle])
  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMorph: { value: 0 },
    uPointer: { value: new Vector2() },
    uPointSize: { value: quality === 'ultra' ? 0.65 : 0.55 },
    uParticleColor: { value: particleColor },
  }), [particleColor, quality])

  useFrame(({ pointer, clock }, delta) => {
    // Three.js uniforms are deliberately updated in place outside React rendering.
    // oxlint-disable-next-line react/immutability
    uniforms.uTime.value = clock.elapsedTime
    // oxlint-disable-next-line react/immutability
    uniforms.uPointer.value.set(pointer.x * 4.1, pointer.y * 2.65)
    // oxlint-disable-next-line react/immutability
    uniforms.uMorph.value = (clock.elapsedTime / 5.2) % 4
    if (pointsRef.current) {
      pointsRef.current.rotation.y = MathUtils.damp(pointsRef.current.rotation.y, pointer.x * 0.07, 1.4, delta)
      pointsRef.current.rotation.x = MathUtils.damp(pointsRef.current.rotation.x, -pointer.y * 0.05, 1.4, delta)
    }
    if (groupRef.current) {
      groupRef.current.rotation.y = MathUtils.damp(groupRef.current.rotation.y, pointer.x * 0.055, 1.2, delta)
      groupRef.current.rotation.x = MathUtils.damp(groupRef.current.rotation.x, -pointer.y * 0.035, 1.2, delta)
    }
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        vertexShader={PARTICLE_VERTEX}
        fragmentShader={PARTICLE_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={colors.particleBlending}
      />
    </points>
  )
}

export default function HeroScene({ quality = 'high' }: { quality?: QualityTier }) {
  const sculptureRef = useRef<Group>(null)
  const camera = useThree(state => state.camera)
  const raySource = useRef<Mesh>(null!)
  const colors = useThemeColors()
  const [reduceEffects, setReduceEffects] = useState(false)
  const reduceForPerformance = useCallback(() => setReduceEffects(true), [])
  const restoreEffects = useCallback(() => setReduceEffects(false), [])
  const usePremiumEffects = quality === 'ultra' || quality === 'high'

  useFrame((state, delta) => {
    const elapsed = state.clock.elapsedTime
    const intro = MathUtils.smoothstep(elapsed, 0, 2.6)
    // oxlint-disable-next-line react/immutability
    camera.position.z = MathUtils.lerp(22, 5, intro)
    // oxlint-disable-next-line react/immutability
    camera.position.x = MathUtils.damp(camera.position.x, state.pointer.x * 0.18, 0.8, delta)
    // oxlint-disable-next-line react/immutability
    camera.position.y = MathUtils.damp(camera.position.y, state.pointer.y * 0.12, 0.8, delta)
    // oxlint-disable-next-line react/immutability
    camera.lookAt(0, 0, 0)
    if (sculptureRef.current) {
      sculptureRef.current.rotation.y += delta * 0.025
      sculptureRef.current.rotation.x = MathUtils.damp(sculptureRef.current.rotation.x, state.pointer.y * 0.045, 1.1, delta)
    }
  })

  return (
    <>
      <AdaptiveDpr
        quality={quality}
        onDecline={reduceForPerformance}
        onIncline={restoreEffects}
      />
      <color attach="background" args={[colors.background]} />
      <fog attach="fog" args={[colors.background, 8, 20]} />
      <ambientLight intensity={colors.ambientIntensity} color={colors.ambientLight} />
      <pointLight position={[0, 2.6, 2]} intensity={colors.isDark ? 16 : 5} distance={12} color={colors.keyLight} />
      <pointLight position={[-5, -3, -2]} intensity={colors.secondaryIntensity} color={colors.secondaryLight} />

      <group ref={sculptureRef}>
        <GalaxyParticles quality={quality} groupRef={sculptureRef} colors={colors} />
        <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.25}>
          <mesh position={[-2.85, 1.1, -1.8]} rotation={[0.4, 0.3, 0.15]}>
            <icosahedronGeometry args={[0.78, 1]} />
            <MeshTransmissionMaterial
              color={colors.accent}
              samples={quality === 'ultra' ? 8 : 4}
              resolution={quality === 'ultra' ? 512 : 256}
              thickness={0.65}
              roughness={0.16}
              chromaticAberration={0.045}
              anisotropy={0.12}
              distortion={0.12}
              distortionScale={0.35}
              temporalDistortion={0.12}
            />
          </mesh>
        </Float>
        <WireShape position={[-3.3, 1.75, -2.4]} rotSpeed={0.25} color={colors.accent} scale={1.1} />
        <WireShape position={[3.65, -1.35, -1.8]} rotSpeed={0.18} color={colors.accent} scale={0.85} />
        <WireShape position={[0.35, 2.8, -3.2]} rotSpeed={0.3} color={colors.accent} scale={0.75} />
        {qualityAtLeast(quality, 'high') && (
          <>
            <RingShape position={[2.6, 2, -2.6]} rotSpeed={0.35} color={colors.particle} scale={1.1} />
            <RingShape position={[-2.6, -1, -2.2]} rotSpeed={0.28} color={colors.particle} scale={0.9} />
            <FloatingPortal position={[-3.6, -0.6, -3]} rotSpeed={0.15} color={colors.accent} />
            <FloatingPortal position={[3.2, 1.2, -2.8]} rotSpeed={-0.12} color={colors.accent} />
          </>
        )}
        <MuseumDoorway color={colors.accent} />
      </group>

      {usePremiumEffects && (
        <mesh ref={raySource} position={[0, 0, -2]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={colors.particle} />
        </mesh>
      )}

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={!colors.isDark
            ? 0.16
            : reduceEffects && quality !== 'ultra'
              ? quality === 'high' ? 0.18 : 0.1
              : quality === 'ultra' ? 0.58 : quality === 'high' ? 0.4 : 0.22}
          luminanceThreshold={0.58}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
        {qualityAtLeast(quality, 'high') && !reduceEffects && <Noise opacity={0.024} />}
        {quality === 'ultra' && colors.isDark && (
          <>
            <GodRays sun={raySource} samples={48} density={0.92} decay={0.94} weight={0.42} exposure={0.28} blur />
            <DepthOfField focusDistance={0.02} focalLength={0.025} bokehScale={2.2} height={480} />
            <ChromaticAberration offset={new Vector2(0.00045, 0.00045)} />
          </>
        )}
        {colors.isDark && qualityAtLeast(quality, 'high') && !reduceEffects && <Vignette eskil={false} offset={0.18} darkness={0.55} />}
      </EffectComposer>
    </>
  )
}
