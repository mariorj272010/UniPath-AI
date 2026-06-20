"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Orbiter = {
  radius: number;
  size: number;
  speed: number;
  offset: number;
  tilt: [number, number, number];
  color: string;
};

// universities orbit as larger planets; careers as smaller glints
const ORBITERS: Orbiter[] = [
  { radius: 2.6, size: 0.24, speed: 0.34, offset: 0.0, tilt: [0.35, 0, 0.12], color: "#818cf8" },
  { radius: 3.3, size: 0.18, speed: -0.26, offset: 1.7, tilt: [-0.28, 0, 0.22], color: "#a78bfa" },
  { radius: 3.9, size: 0.28, speed: 0.2, offset: 3.1, tilt: [0.18, 0, -0.3], color: "#22d3ee" },
  { radius: 4.6, size: 0.14, speed: -0.16, offset: 4.4, tilt: [0.42, 0, 0.05], color: "#34d399" },
  { radius: 5.2, size: 0.2, speed: 0.13, offset: 5.6, tilt: [-0.2, 0, 0.34], color: "#c4b5fd" },
];

/** Planets/careers orbiting the orb, each tethered by a glowing pathway. */
export function OrbitSystem() {
  const refs = useRef<(THREE.Group | null)[]>([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    ORBITERS.forEach((o, i) => {
      const g = refs.current[i];
      if (g) g.rotation.y = o.offset + t * o.speed;
    });
  });

  return (
    <>
      {ORBITERS.map((o, i) => (
        <group key={i} rotation={o.tilt}>
          {/* orbital pathway ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[o.radius, 0.005, 8, 140]} />
            <meshBasicMaterial
              color={o.color}
              transparent
              opacity={0.14}
              depthWrite={false}
            />
          </mesh>

          {/* spinning carrier */}
          <group
            ref={(el) => {
              refs.current[i] = el;
            }}
          >
            {/* glowing connection from orb -> planet */}
            <mesh position={[o.radius / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, o.radius, 8]} />
              <meshBasicMaterial
                color={o.color}
                transparent
                opacity={0.3}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* planet halo */}
            <mesh position={[o.radius, 0, 0]} scale={1.9}>
              <sphereGeometry args={[o.size, 16, 16]} />
              <meshBasicMaterial
                color={o.color}
                transparent
                opacity={0.18}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            {/* planet */}
            <mesh position={[o.radius, 0, 0]}>
              <sphereGeometry args={[o.size, 28, 28]} />
              <meshStandardMaterial
                color={o.color}
                emissive={o.color}
                emissiveIntensity={1.3}
                roughness={0.35}
                metalness={0.3}
                toneMapped={false}
              />
            </mesh>
          </group>
        </group>
      ))}
    </>
  );
}
