"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Holographic glass panel that tilts toward the pointer and floats a light
 * gloss across its surface. Tilt is suppressed on touch / reduced motion.
 */
export function TiltPanel({
  children,
  className,
  max = 6,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    el.style.setProperty("--rx", `${(0.5 - py) * max}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * max}deg`);
    el.style.setProperty("--gx", `${px * 100}%`);
    el.style.setProperty("--gy", `${py * 100}%`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <div style={{ perspective: "1200px" }} className={className}>
      <div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        className={cn(
          "glass glass-edge group relative h-full overflow-hidden rounded-3xl p-7 transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)]",
          "[transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))] [transform-style:preserve-3d] hover:shadow-[0_40px_120px_-50px_oklch(0.05_0.01_60)]",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--gx,50%) var(--gy,50%), oklch(0.97 0.05 78 / 0.12), transparent 60%)",
          }}
        />
        <div className="relative [transform:translateZ(40px)]">{children}</div>
      </div>
    </div>
  );
}
