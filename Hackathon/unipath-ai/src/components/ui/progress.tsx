"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "brand" | "emerald" | "amber" | "navy";

const tones: Record<Tone, string> = {
  brand: "from-brand-500 to-violet-500",
  emerald: "from-emerald-500 to-emerald-400",
  amber: "from-amber-500 to-amber-400",
  navy: "from-navy-700 to-navy-600",
};

/** Animated horizontal progress / score bar. */
export function Progress({
  value,
  tone = "brand",
  className,
  trackClassName,
  delay = 0,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  trackClassName?: string;
  delay?: number;
}) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2.5 w-full overflow-hidden rounded-full bg-navy-900/8",
        trackClassName
      )}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${pct}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
        className={cn("h-full rounded-full bg-gradient-to-r", tones[tone], className)}
      />
    </div>
  );
}
