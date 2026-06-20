"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

const STATEMENT =
  "We built a world where every signal becomes light. Watch your data think, breathe, and move — long before the future arrives.";

const EMBER_WORDS = new Set(["light.", "think,", "future"]);

function Word({
  word,
  range,
  progress,
  ember,
}: {
  word: string;
  range: [number, number];
  progress: MotionValue<number>;
  ember: boolean;
}) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const color = useTransform(
    progress,
    range,
    ember
      ? ["oklch(0.62 0.13 56)", "oklch(0.86 0.13 80)"]
      : ["oklch(0.78 0.012 76 / 0.25)", "oklch(0.965 0.006 80)"],
  );
  return (
    <span className="mr-[0.28em] inline-block">
      <motion.span style={{ opacity, color }}>{word}</motion.span>
    </span>
  );
}

export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.4"],
  });

  const words = STATEMENT.split(" ");

  return (
    <section
      id="engine"
      ref={ref}
      className="relative mx-auto max-w-5xl px-5 py-[18vh] sm:px-8"
      style={{ zIndex: "var(--z-content)" }}
    >
      <span className="hud-label mb-10 block">[ 01 — Thesis ]</span>
      <p className="font-display text-[clamp(1.9rem,5.2vw,4.2rem)] font-semibold leading-[1.08] tracking-[-0.03em]">
        {words.map((word, i) => {
          const start = i / words.length;
          const end = (i + 1) / words.length;
          return (
            <Word
              key={i}
              word={word}
              range={[start, end]}
              progress={scrollYProgress}
              ember={EMBER_WORDS.has(word)}
            />
          );
        })}
      </p>
    </section>
  );
}
