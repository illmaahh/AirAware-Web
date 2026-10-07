"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Points, PointMaterial, Stars, TorusKnot } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Core({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.elapsedTime * 0.18;
    ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.25) * 0.1;
  });

  return (
    <Float speed={1.25} rotationIntensity={0.35} floatIntensity={0.7}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.45, 5]} />
        <meshStandardMaterial
          color={intensity > 1.5 ? "#f6a83b" : "#61d98b"}
          emissive={intensity > 1.5 ? "#6b2f14" : "#0e5f38"}
          emissiveIntensity={0.75}
          roughness={0.2}
          metalness={0.55}
        />
      </mesh>
      <mesh scale={1.08}>
        <icosahedronGeometry args={[1.45, 3]} />
        <meshBasicMaterial color="#c7ffe0" wireframe transparent opacity={0.18} />
      </mesh>
    </Float>
  );
}

function Rings() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.z = clock.elapsedTime * 0.08;
    group.current.rotation.y = clock.elapsedTime * 0.045;
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI / 2.1, 0.15, 0]}>
        <torusGeometry args={[2.0, 0.018, 16, 180]} />
        <meshBasicMaterial color="#6be29c" transparent opacity={0.52} />
      </mesh>
      <mesh rotation={[1.2, 0.15, 0.8]}>
        <torusGeometry args={[2.35, 0.012, 16, 180]} />
        <meshBasicMaterial color="#7eb8ff" transparent opacity={0.35} />
      </mesh>
      <mesh rotation={[0.35, 1.15, 0]}>
        <torusGeometry args={[1.75, 0.009, 16, 180]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.22} />
      </mesh>
    </group>
  );
}

function ParticleField() {
  const positions = useMemo(() => {
    const arr = new Float32Array(900);
    for (let i = 0; i < arr.length; i++) {
      arr[i] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#9df1c3" size={0.035} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

export default function AtmosphereScene({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="sceneShell" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6.6], fov: 42 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <pointLight position={[3, 3, 4]} intensity={14} color="#a8ffd0" />
        <pointLight position={[-3, -2, 2]} intensity={9} color="#7aa8ff" />
        <Stars radius={30} depth={18} count={1200} factor={1.8} saturation={0} fade speed={0.35} />
        <ParticleField />
        <Core intensity={intensity} />
        <Rings />
        <TorusKnot args={[0.72, 0.16, 96, 16]} position={[2.35, 1.5, -1.3]} rotation={[0.7, 0.1, 0.2]}>
          <meshStandardMaterial color="#173b2b" metalness={0.7} roughness={0.24} emissive="#0c2519" emissiveIntensity={0.45} />
        </TorusKnot>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.35} />
      </Canvas>
    </div>
  );
}
