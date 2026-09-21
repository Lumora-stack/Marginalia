import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Dense star field
const particleCount = 2800;
const positions = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos((Math.random() * 2) - 1);
  const r = 2.5 + Math.random() * 4.5;
  positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
  positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
  positions[i * 3 + 2] = r * Math.cos(phi);
}

// Floating wireframe icosahedron
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
      ref.current.rotation.y += delta * rotSpeed * 0.7;
    }
  });
  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[0.28, 0]} />
      <meshStandardMaterial
        color="#D4AF37"
        wireframe
        transparent
        opacity={0.45}
      />
    </mesh>
  );
}

// Floating ring
function RingShape({ position, rotSpeed }: { position: [number, number, number]; rotSpeed: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * rotSpeed;
      ref.current.rotation.z += delta * rotSpeed * 0.5;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <torusGeometry args={[0.3, 0.04, 8, 24]} />
      <meshStandardMaterial color="#D4AF37" transparent opacity={0.35} />
    </mesh>
  );
}

export default function HeroScene() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.035;
      pointsRef.current.rotation.x += delta * 0.012;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 5, 4]} intensity={1.2} color="#D4AF37" />
      <pointLight position={[-4, -3, -4]} intensity={0.6} color="#ffffff" />

      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Points
          ref={pointsRef}
          positions={positions}
          stride={3}
          frustumCulled={false}
        >
          <PointMaterial
            transparent
            color="#D4AF37"
            size={0.022}
            sizeAttenuation
            depthWrite={false}
            opacity={0.75}
          />
        </Points>
      </Float>

      <WireShape position={[-3.2, 1.8, -2.5]} rotSpeed={0.28} />
      <WireShape position={[3.8, -1.2, -1.5]} rotSpeed={0.18} scale={0.8} />
      <WireShape position={[0.5, 3, -3.5]} rotSpeed={0.35} scale={0.7} />
      <WireShape position={[-1.5, -2.5, -2]} rotSpeed={0.22} scale={1.1} />

      <RingShape position={[2.8, 2.2, -3]} rotSpeed={0.4} />
      <RingShape position={[-2.5, -1, -2]} rotSpeed={0.3} />
    </>
  );
}
