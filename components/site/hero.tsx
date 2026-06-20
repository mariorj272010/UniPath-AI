"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplineScene } from "@/components/ui/splite";
import { GlowButton } from "./glow-button";

const SCENE = "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  // Scroll parallax: the whole scene sinks + fades as you leave the fold.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);

  // Pointer parallax driven through CSS custom props on the scene shell.
  const onPointer = (e: React.PointerEvent) => {
    const el = sceneRef.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    el.style.setProperty("--shell-x", x.toFixed(3));
    el.style.setProperty("--shell-y", y.toFixed(3));
  };

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onPointer}
      className="relative flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-8"
      style={{ zIndex: "var(--z-content)" }}
    >
      <div ref={sceneRef} className="relative mx-auto w-full max-w-6xl">
        {/* Ghost word, behind the object */}
        <motion.span
          aria-hidden
          style={{ scale: ghostScale, opacity: fade, zIndex: "var(--z-base)" }}
          className="pointer-events-none absolute inset-x-0 top-[34%] -translate-y-1/2 select-none text-center font-display text-[24vw] font-extrabold leading-none tracking-[-0.06em] text-transparent sm:top-[38%]"
        >
          <span
            style={{
              WebkitTextStroke: "1.5px oklch(0.97 0.01 80 / 0.07)",
              transform:
                "translate3d(calc(var(--shell-x) * -34px), calc(var(--shell-y) * -22px), 0)",
              display: "inline-block",
            }}
          >
            LIMITLESS
          </span>
        </motion.span>

        {/* The floating 3D centerpiece */}
        <motion.div
          style={{ y: sceneY, opacity: fade, zIndex: "var(--z-scene)" }}
          className="relative mx-auto h-[46svh] min-h-[320px] w-full sm:h-[58svh]"
        >
          <div
            className="anim-float h-full w-full"
            style={{
              transform:
                "translate3d(calc(var(--shell-x) * 26px), calc(var(--shell-y) * 18px), 0)",
              transition: "transform 0.5s var(--ease-out-expo)",
            }}
          >
            <SplineScene scene={SCENE} className="h-full w-full" />
          </div>

          {/* Floating foreground motes for depth */}
          <div
            aria-hidden
            className="anim-float absolute left-[8%] top-[20%] h-2.5 w-2.5 rounded-full bg-ember shadow-[0_0_20px_4px_oklch(0.82_0.125_72/0.8)]"
            style={{ animationDelay: "-2s" }}
          />
          <div
            aria-hidden
            className="anim-float absolute right-[12%] top-[62%] h-1.5 w-1.5 rounded-full bg-halo shadow-[0_0_16px_3px_oklch(0.83_0.07_214/0.7)]"
            style={{ animationDelay: "-4.5s" }}
          />
        </motion.div>

        {/* Headline + copy, in front of the object */}
        <motion.div
          style={{ y: textY, opacity: fade, zIndex: "var(--z-content)" }}
          className="pointer-events-none relative -mt-[14svh] flex flex-col items-center text-center sm:-mt-[18svh]"
        >
          <span className="hud-label pointer-events-auto mb-6 inline-flex items-center gap-2 rounded-full border border-line-hi px-4 py-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
            Real-time intelligence engine
          </span>

          <h1 className="display-xl max-w-[14ch] text-ink [text-shadow:0_2px_40px_oklch(0.09_0.01_58/0.8)]">
            Your future,
            <br />
            <span className="text-ember">rendered live</span>
          </h1>

          <p className="pointer-events-auto mt-7 max-w-[46ch] text-pretty text-base text-ink-soft sm:text-lg">
            MICRORITM suspends your entire data universe in a single field of light —
            sensed, reasoned, and rendered the instant it changes.
          </p>

          <div className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-4">
            <GlowButton href="#access">
              Enter the engine
              <span aria-hidden className="text-base leading-none">→</span>
            </GlowButton>
            <GlowButton href="#engine" variant="ghost">
              Watch the launch
            </GlowButton>
          </div>
        </motion.div>
      </div>

      {/* Bottom-rail HUD telemetry (the wireframe's corner badges) */}
      <div className="pointer-events-none mx-auto mt-12 flex w-full max-w-6xl items-end justify-between">
        <div className="glass glass-edge pointer-events-auto hidden max-w-xs rounded-xl px-4 py-3 sm:block">
          <p className="hud-label mb-1">Live throughput</p>
          <p className="font-mono text-sm text-ink">
            1.42M <span className="text-ink-faint">signals / sec</span>
          </p>
        </div>
        <a
          href="#engine"
          className="pointer-events-auto mx-auto flex flex-col items-center gap-2 text-ink-faint transition-colors hover:text-ink sm:mx-0"
        >
          <span className="hud-label">Scroll</span>
          <span className="relative h-9 w-5 rounded-full border border-line-hi">
            <span
              className="absolute left-1/2 top-1.5 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ember"
              style={{ animation: "scan 1.8s var(--ease-out-quint) infinite" }}
            />
          </span>
        </a>
        <div className="glass glass-edge pointer-events-auto hidden rounded-xl px-4 py-3 text-right sm:block">
          <p className="hud-label mb-1">Latency</p>
          <p className="font-mono text-sm text-ink">
            <span className="text-halo">04</span> ms
          </p>
        </div>
      </div>
    </section>
  );
}
