"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "./reveal";

export function Showcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const skyY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const sunScale = useTransform(scrollYProgress, [0, 1], [0.85, 1.25]);
  const farY = useTransform(scrollYProgress, [0, 1], ["18%", "-12%"]);
  const midY = useTransform(scrollYProgress, [0, 1], ["40%", "-22%"]);
  const nearY = useTransform(scrollYProgress, [0, 1], ["70%", "-40%"]);
  const wordX = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <section
      id="explore"
      ref={ref}
      className="relative flex min-h-[110svh] items-center overflow-hidden"
      style={{ zIndex: "var(--z-content)" }}
    >
      {/* Sky gradient + atmospheric depth */}
      <motion.div
        style={{ y: skyY }}
        className="absolute inset-x-0 -top-[10%] h-[120%]"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, oklch(0.11 0.012 60) 0%, oklch(0.16 0.03 52) 52%, oklch(0.22 0.05 48) 72%, oklch(0.13 0.02 58) 100%)",
          }}
        />
      </motion.div>

      {/* Horizon sun */}
      <motion.div
        style={{ scale: sunScale }}
        className="anim-float absolute left-1/2 top-[58%] h-[42vw] w-[42vw] max-h-[520px] max-w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[6px]"
      >
        <div
          className="h-full w-full rounded-full"
          style={{
            background:
              "radial-gradient(circle, oklch(0.92 0.11 78 / 0.95) 0%, oklch(0.78 0.14 56 / 0.5) 38%, transparent 68%)",
          }}
        />
      </motion.div>

      {/* Far monoliths */}
      <motion.div style={{ y: farY }} className="absolute inset-x-0 bottom-[34%] flex items-end justify-center gap-6 opacity-40 blur-[2px]">
        {[120, 200, 90, 160, 110].map((h, i) => (
          <span
            key={i}
            className="block w-10 rounded-t-md sm:w-16"
            style={{
              height: h,
              background:
                "linear-gradient(to top, oklch(0.1 0.01 58), oklch(0.2 0.03 52))",
            }}
          />
        ))}
      </motion.div>

      {/* The monumental word, woven between layers */}
      <motion.span
        aria-hidden
        style={{ x: wordX }}
        className="pointer-events-none absolute inset-x-0 top-[30%] z-[1] select-none text-center font-display text-[20vw] font-extrabold leading-none tracking-[-0.05em] text-ink/[0.92] [text-shadow:0_10px_60px_oklch(0.09_0.01_58/0.6)]"
      >
        EXPLORE
      </motion.span>

      {/* Mid floating islands */}
      <motion.div style={{ y: midY }} className="absolute inset-x-0 bottom-[20%] z-[2]">
        <div className="relative mx-auto h-40 max-w-5xl">
          <FloatingIsland className="left-[8%] top-4 w-40" delay="-1s" />
          <FloatingIsland className="right-[10%] top-16 w-28" delay="-5s" tint="halo" />
          <FloatingIsland className="left-1/2 top-0 w-20 -translate-x-1/2" delay="-3s" />
        </div>
      </motion.div>

      {/* Ground glow */}
      <div
        className="absolute inset-x-0 bottom-0 z-[3] h-[36%]"
        style={{
          background:
            "linear-gradient(to top, oklch(0.1 0.012 58) 18%, oklch(0.78 0.12 60 / 0.12) 55%, transparent)",
        }}
      />

      {/* Near foreground ridge */}
      <motion.div
        style={{ y: nearY }}
        className="absolute inset-x-0 bottom-[-2%] z-[4] h-40 blur-[3px]"
      >
        <div
          className="h-full w-full"
          style={{
            background: "oklch(0.08 0.01 58)",
            clipPath:
              "polygon(0 100%, 0 60%, 12% 48%, 28% 66%, 44% 40%, 60% 62%, 78% 44%, 92% 66%, 100% 52%, 100% 100%)",
          }}
        />
      </motion.div>

      {/* Caption */}
      <div className="absolute inset-x-0 bottom-[8%] z-[5] mx-auto w-full max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="glass glass-edge max-w-md rounded-2xl p-6">
            <span className="hud-label mb-3 block">[ 03 — The world ]</span>
            <p className="text-pretty text-ink">
              Scroll deeper and the data resolves into terrain — peaks of momentum,
              valleys of risk, a horizon you can walk toward.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FloatingIsland({
  className,
  delay,
  tint = "ember",
}: {
  className?: string;
  delay?: string;
  tint?: "ember" | "halo";
}) {
  const color =
    tint === "ember" ? "oklch(0.82 0.125 72 / 0.8)" : "oklch(0.83 0.07 214 / 0.8)";
  return (
    <div className={`anim-float absolute ${className ?? ""}`} style={{ animationDelay: delay }}>
      <div
        className="h-10 rounded-[50%] blur-[1px]"
        style={{
          background: "linear-gradient(to bottom, oklch(0.28 0.04 56), oklch(0.12 0.02 58))",
          boxShadow: `0 14px 40px -10px ${color}`,
        }}
      />
      <div
        className="mx-auto h-8 w-1/2 -translate-y-1"
        style={{
          background: "linear-gradient(to bottom, oklch(0.16 0.02 58), transparent)",
          clipPath: "polygon(20% 0, 80% 0, 60% 100%, 40% 100%)",
        }}
      />
      <span
        className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px 2px ${color}` }}
      />
    </div>
  );
}
