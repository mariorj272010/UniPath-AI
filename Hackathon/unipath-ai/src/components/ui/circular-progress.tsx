"use client";

import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Holographic readiness gauge with an animated count-up number. */
export function CircularProgress({
  value,
  size = 200,
  stroke = 14,
  label,
  suffix = "/100",
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, pct, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, pct]);

  return (
    <div
      ref={ref}
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
    >
      {/* ambient bloom behind the ring */}
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.125 72 / 0.35), transparent 70%)" }}
      />
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.83 0.07 214)" />
            <stop offset="55%" stopColor="oklch(0.86 0.13 78)" />
            <stop offset="100%" stopColor="oklch(0.88 0.13 82)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="oklch(0.97 0.01 80 / 0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: circumference * (1 - pct / 100) } : {}}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: "drop-shadow(0 0 6px oklch(0.86 0.13 80 / 0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-5xl font-extrabold tracking-tight text-ink tabular-nums">
            {display}
            <span className="text-xl font-semibold text-ink-faint">{suffix}</span>
          </div>
          {label && <div className="hud-label mt-1">{label}</div>}
        </div>
      </div>
    </div>
  );
}
