import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Floating Wireframe Polyhedron
function WireShape({
  position,
  rotSpeed,
  scale = 1,
}: {
  position: [number, number, number];
  rotSpeed: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * rotSpeed;
      ref.current.rotation.y += delta * rotSpeed * 0.75;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial
        color="#D4AF37"
        wireframe
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}

// Floating Golden Ring
function RingShape({ position, rotSpeed, scale = 1 }: { position: [number, number, number]; rotSpeed: number; scale?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * rotSpeed;
      ref.current.rotation.z += delta * rotSpeed * 0.6;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[0.32, 0.03, 8, 28]} />
      <meshStandardMaterial color="#D4AF37" transparent opacity={0.35} />
    </mesh>
  );
}

// Floating Abstract Framed Artwork Portal
function FloatingPortal({ position, rotSpeed }: { position: [number, number, number]; rotSpeed: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * rotSpeed;
      ref.current.rotation.z += delta * (rotSpeed * 0.5);
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Frame Border */}
      <mesh>
        <boxGeometry args={[0.9, 1.2, 0.02]} />
        <meshStandardMaterial color="#D4AF37" wireframe transparent opacity={0.3} />
      </mesh>
      {/* Semi-transparent Canvas Inside */}
      <mesh position={[0, 0, -0.005]}>
        <planeGeometry args={[0.82, 1.12]} />
        <meshStandardMaterial color="#0c0c0e" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Generate spherical golden particles
  const { positions } = useMemo(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 1200 : 2400;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2.2 + Math.random() * 4.8;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return { positions: pos };
  }, []);

  // Smooth mouse-follow camera parallax and gentle rotation
  useFrame(({ pointer }, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.025;
      pointsRef.current.rotation.x += delta * 0.01;
    }
    if (groupRef.current) {
      // Smooth lerp based on cursor position
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.x * 0.18,
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.y * 0.12,
        0.05
      );
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 6, 4]} intensity={1.5} color="#D4AF37" />
      <pointLight position={[-5, -4, -3]} intensity={0.7} color="#f0ede6" />

      {/* Interactive mouse-reactive 3D sculpture group */}
      <group ref={groupRef}>
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
          <Points
            ref={pointsRef}
            positions={positions}
            stride={3}
            frustumCulled={false}
          >
            <PointMaterial
              transparent
              color="#D4AF37"
              size={0.02}
              sizeAttenuation
              depthWrite={false}
              opacity={0.7}
            />
          </Points>
        </Float>

        {/* Floating Sculptures */}
        <WireShape position={[-3.2, 1.6, -2.2]} rotSpeed={0.25} scale={1.1} />
        <WireShape position={[3.6, -1.4, -1.8]} rotSpeed={0.18} scale={0.85} />
        <WireShape position={[0.4, 2.8, -3.2]} rotSpeed={0.3} scale={0.75} />
        <WireShape position={[-1.8, -2.4, -2]} rotSpeed={0.22} scale={1} />

        {/* Floating Rings */}
        <RingShape position={[2.6, 2, -2.6]} rotSpeed={0.35} scale={1.1} />
        <RingShape position={[-2.6, -1, -2.2]} rotSpeed={0.28} scale={0.9} />

        {/* Floating Portals */}
        <FloatingPortal position={[-3.6, -0.6, -3]} rotSpeed={0.15} />
        <FloatingPortal position={[3.2, 1.2, -2.8]} rotSpeed={-0.12} />
      </group>
    </>
  );
}
