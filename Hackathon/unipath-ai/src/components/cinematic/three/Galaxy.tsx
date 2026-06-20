"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import type { Group } from "three";

/** Deep-space backdrop: drifting starfield + floating "achievement" sparkles. */
export function Galaxy() {
  const group = useRef<Group>(null);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.012;
  });

  return (
    <group ref={group}>
      <Stars radius={90} depth={60} count={4500} factor={4} saturation={0} fade speed={0.6} />
      {/* achievements drifting as stars of light */}
      <Sparkles
        count={90}
        scale={[26, 14, 18]}
        size={4}
        speed={0.25}
        opacity={0.7}
        color="#a5b4fc"
      />
      <Sparkles
        count={50}
        scale={[18, 10, 12]}
        size={6}
        speed={0.15}
        opacity={0.5}
        color="#8b5cf6"
      />
    </group>
  );
}
