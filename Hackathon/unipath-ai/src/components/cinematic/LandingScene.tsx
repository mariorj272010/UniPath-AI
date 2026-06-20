"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Galaxy } from "./three/Galaxy";
import { PathwayOrb } from "./three/PathwayOrb";
import { OrbitSystem } from "./three/OrbitSystem";
import { Rig } from "./three/Rig";

/** Full-screen WebGL universe behind the landing overlay. Client-only. */
export function LandingScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.3, 6.5], fov: 50 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <color attach="background" args={["#05060f"]} />
      <fog attach="fog" args={["#05060f", 9, 24]} />

      <ambientLight intensity={0.45} />
      <pointLight position={[5, 5, 5]} intensity={60} color="#8b5cf6" />
      <pointLight position={[-6, -3, 2]} intensity={30} color="#22d3ee" />

      <Suspense fallback={null}>
        <Galaxy />
        <PathwayOrb />
        <OrbitSystem />
      </Suspense>

      <Rig />

      <EffectComposer>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.7}
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
