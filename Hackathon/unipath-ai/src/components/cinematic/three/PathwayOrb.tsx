"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

/** The central glowing Pathway Orb. Reacts to hover (scale + energy). */
export function PathwayOrb() {
  const mesh = useRef<THREE.Mesh>(null);
  const halo = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (mesh.current) {
      const target = hovered ? 1.12 : 1;
      const s = THREE.MathUtils.lerp(mesh.current.scale.x, target, 0.08);
      mesh.current.scale.setScalar(s);
      mesh.current.rotation.y += delta * 0.18;
    }
    if (halo.current) {
      const t = hovered ? 1.32 : 1.22;
      const s = THREE.MathUtils.lerp(halo.current.scale.x, t, 0.08);
      halo.current.scale.setScalar(s);
    }
  });

  return (
    <Float speed={1.4} rotationIntensity={0.35} floatIntensity={0.7}>
      {/* outer halo for glow even before bloom */}
      <mesh ref={halo}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* the orb */}
      <mesh
        ref={mesh}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <icosahedronGeometry args={[1.4, 12]} />
        <MeshDistortMaterial
          color="#6366f1"
          emissive="#4f46e5"
          emissiveIntensity={hovered ? 1.5 : 0.9}
          roughness={0.18}
          metalness={0.65}
          distort={hovered ? 0.45 : 0.32}
          speed={hovered ? 2.6 : 1.6}
        />
      </mesh>

      {/* bright inner core */}
      <mesh scale={0.55}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#c7d2fe" toneMapped={false} />
      </mesh>
    </Float>
  );
}
