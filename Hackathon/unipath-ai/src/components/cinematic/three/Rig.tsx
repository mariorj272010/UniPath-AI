"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Subtle mouse-driven camera parallax. */
export function Rig() {
  useFrame((state) => {
    const px = state.pointer.x;
    const py = state.pointer.y;
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, px * 0.9, 0.04);
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      py * 0.5 + 0.3,
      0.04
    );
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}
