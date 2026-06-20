"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, Cpu, Lock } from "lucide-react";
import { ANALYSIS_STEPS } from "@/lib/data";
import { Atmosphere } from "@/components/site/atmosphere";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const STEP_MS = 1100;

export function Analysis({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const [current, setCurrent] = useState(0);
  const last = ANALYSIS_STEPS.length - 1;

  useEffect(() => {
    if (current < last) {
      const t = setTimeout(() => setCurrent((c) => c + 1), STEP_MS);
      return () => clearTimeout(t);
    }
    if (ready) {
      const t = setTimeout(onDone, 700);
      return () => clearTimeout(t);
    }
  }, [current, last, ready, onDone]);

  const waiting = current >= last && !ready;
  const progress = ready
    ? 100
    : Math.min(92, ((current + (waiting ? 0.5 : 0)) / ANALYSIS_STEPS.length) * 100);

  return (
    <div className="grain relative grid min-h-[100dvh] place-items-center overflow-hidden px-5 py-10">
      <Atmosphere />

      <div className="relative z-10 w-full max-w-xl">
        {/* thinking core */}
        <div className="mb-8 grid place-items-center">
          <div className="relative grid h-36 w-36 place-items-center">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full blur-2xl"
              style={{ background: "radial-gradient(circle, oklch(0.82 0.125 72 / 0.45), transparent 70%)" }}
            />
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute rounded-full border border-line-hi"
                style={{ width: 84 + i * 24, height: 84 + i * 24 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 7 + i * 3, repeat: Infinity, ease: "linear" }}
              >
                <span
                  className="absolute h-1.5 w-1.5 rounded-full"
                  style={{
                    top: -3,
                    left: `${30 + i * 16}%`,
                    background: i === 1 ? "oklch(0.83 0.07 214)" : "oklch(0.82 0.125 72)",
                    boxShadow: "0 0 12px 2px oklch(0.82 0.125 72 / 0.7)",
                  }}
                />
              </motion.span>
            ))}
            <motion.div
              className="grid h-20 w-20 place-items-center rounded-full bg-ember text-void-deep ember-glow"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cpu className="h-9 w-9" strokeWidth={1.6} />
            </motion.div>
          </div>
        </div>

        <div className="text-center">
          <Badge variant="brand" className="mb-4">
            <Lock className="h-3.5 w-3.5" /> Analyzing privately on your device
          </Badge>
          <h2 className="display-lg text-ink">Mapping your path</h2>
          <p className="mt-3 text-sm text-ink-soft">
            Scoring on a weighted 40 / 20 / 20 / 20 rubric — no made-up statistics.
          </p>
        </div>

        {/* progress */}
        <div className="mx-auto mt-7 max-w-md">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[oklch(0.97_0.01_80/0.08)]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, oklch(0.83 0.07 214), oklch(0.86 0.13 80))" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <p className="mt-2 text-center font-mono text-xs tabular-nums text-ink-faint">
            {Math.round(progress)}%
          </p>
          {waiting && (
            <p className="mt-1 text-center text-xs text-ink-faint/80">
              Running the local model on CPU — this can take several minutes. Keep this tab open.
            </p>
          )}
        </div>

        {/* checklist */}
        <div className="glass glass-edge mt-6 rounded-2xl p-5">
          <ul className="space-y-1">
            {ANALYSIS_STEPS.map((label, i) => {
              const done = i < current;
              const active = i === current;
              const pending = i > current;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors",
                    active && "bg-[oklch(0.82_0.125_72/0.08)]"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full",
                      done && "bg-[oklch(0.82_0.1_168/0.9)] text-void-deep",
                      active && "bg-ember text-void-deep",
                      pending && "bg-[oklch(0.97_0.01_80/0.06)] text-ink-faint"
                    )}
                  >
                    {done ? <Check className="h-3.5 w-3.5" /> : active ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
                  </span>
                  <span
                    className={cn(
                      "text-sm transition-colors",
                      done && "text-ink-faint line-through decoration-[oklch(0.82_0.1_168/0.4)]",
                      active && "font-medium text-ink",
                      pending && "text-ink-faint/70"
                    )}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* skeleton preview */}
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="glass space-y-2 rounded-2xl p-4">
                <Skeleton className="h-8 w-8 rounded-xl" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
