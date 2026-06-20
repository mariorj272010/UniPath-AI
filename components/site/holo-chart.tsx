"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, TrendingUp, Cpu } from "lucide-react";
import { Reveal } from "./reveal";

const SERIES = [12, 26, 18, 34, 28, 46, 38, 58, 50, 72, 64, 88];
const W = 640;
const H = 280;

function buildPath(values: number[], close: boolean) {
  const max = Math.max(...values);
  const stepX = W / (values.length - 1);
  const pts = values.map((v, i) => [i * stepX, H - (v / max) * (H - 30) - 12]);
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x, y] = pts[i];
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    d += ` C ${cx} ${py} ${cx} ${y} ${x} ${y}`;
  }
  if (close) d += ` L ${W} ${H} L 0 ${H} Z`;
  return d;
}

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, target, duration]);
  return val;
}

export function HoloChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const throughput = useCountUp(99.4, live);
  const models = useCountUp(214, live);
  const accuracy = useCountUp(99.98, live);

  return (
    <section
      id="telemetry"
      className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8"
      style={{ zIndex: "var(--z-content)" }}
    >
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div>
            <span className="hud-label mb-5 block">[ 04 — Telemetry ]</span>
            <h2 className="display-lg max-w-[12ch] text-ink">
              Watch it
              <br />
              <span className="text-ember">think in real time</span>
            </h2>
            <p className="mt-6 max-w-md text-ink-soft">
              Every reading below is rendered the moment it happens. No dashboards to
              refresh — the surface simply keeps breathing.
            </p>

            <dl className="mt-10 grid grid-cols-3 gap-4">
              <Stat icon={<Activity className="h-4 w-4" />} value={`${throughput.toFixed(1)}%`} label="throughput" />
              <Stat icon={<Cpu className="h-4 w-4" />} value={Math.round(models).toString()} label="live models" />
              <Stat icon={<TrendingUp className="h-4 w-4" />} value={`${accuracy.toFixed(2)}%`} label="accuracy" />
            </dl>
          </div>
        </Reveal>

        <Reveal y={40} delay={0.1}>
          <div
            ref={ref}
            className="glass glass-edge relative overflow-hidden rounded-3xl p-5 sm:p-7"
            style={{ perspective: "1400px" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <span className="hud-label">signal / time</span>
              <span className="flex items-center gap-2 font-mono text-xs text-ink-soft">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
                streaming
              </span>
            </div>

            <div className="[transform:rotateX(12deg)_rotateZ(-1deg)] [transform-style:preserve-3d]">
              <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible" role="img" aria-label="Live signal throughput rising over time">
                <defs>
                  <linearGradient id="holoFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.125 72)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="oklch(0.82 0.125 72)" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="holoStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.83 0.07 214)" />
                    <stop offset="100%" stopColor="oklch(0.88 0.13 80)" />
                  </linearGradient>
                </defs>

                {/* grid */}
                {[0, 1, 2, 3, 4].map((i) => (
                  <line
                    key={i}
                    x1="0"
                    x2={W}
                    y1={(H / 4) * i}
                    y2={(H / 4) * i}
                    stroke="oklch(0.97 0.01 80 / 0.08)"
                    strokeWidth="1"
                  />
                ))}

                <path d={buildPath(SERIES, true)} fill="url(#holoFill)" className="holo-fill" />
                <path
                  d={buildPath(SERIES, false)}
                  fill="none"
                  stroke="url(#holoStroke)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="holo-line"
                  style={{ filter: "drop-shadow(0 0 8px oklch(0.86 0.13 80 / 0.6))" }}
                />
              </svg>
            </div>

            {/* moving scan line */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-7 left-0 w-px bg-gradient-to-b from-transparent via-halo to-transparent opacity-70"
              style={{ animation: "sheen 4.5s linear infinite", filter: "blur(0.5px)" }}
            />
          </div>
        </Reveal>
      </div>

      <style>{`
        .holo-line {
          stroke-dasharray: 1400;
          stroke-dashoffset: ${live ? 0 : 1400};
          transition: stroke-dashoffset 1.8s var(--ease-out-expo);
        }
        .holo-fill {
          opacity: ${live ? 1 : 0};
          transition: opacity 1.4s var(--ease-out-expo) 0.5s;
        }
        @media (prefers-reduced-motion: reduce) {
          .holo-line { stroke-dashoffset: 0; transition: none; }
          .holo-fill { opacity: 1; transition: none; }
        }
      `}</style>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <span className="mb-3 flex h-7 w-7 items-center justify-center rounded-md bg-ember/10 text-ember">
        {icon}
      </span>
      <dd className="font-mono text-lg font-semibold tracking-tight text-ink">{value}</dd>
      <dt className="hud-label !tracking-[0.16em]">{label}</dt>
    </div>
  );
}
