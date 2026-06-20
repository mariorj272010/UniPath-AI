"use client";

import { Radar, Waves, Orbit, ShieldCheck } from "lucide-react";
import { TiltPanel } from "./tilt-panel";
import { Reveal } from "./reveal";

export function Capabilities() {
  return (
    <section
      id="signals"
      className="relative mx-auto max-w-6xl px-5 py-24 sm:px-8"
      style={{ zIndex: "var(--z-content)" }}
    >
      <Reveal>
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="hud-label mb-5 block">[ 02 — Capabilities ]</span>
            <h2 className="display-lg max-w-[16ch] text-ink">
              Four instruments,
              <br />
              one field of light
            </h2>
          </div>
          <p className="max-w-sm text-ink-soft">
            Each subsystem renders a different layer of your reality, then fuses them into
            a single living scene you can reach into.
          </p>
        </div>
      </Reveal>

      <div className="grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-5 md:grid-cols-12">
        {/* Hero panel — wide, with a live orbit visual */}
        <Reveal className="md:col-span-7" y={36}>
          <TiltPanel className="h-full min-h-[340px]">
            <div className="flex h-full flex-col justify-between gap-8">
              <div className="flex items-start justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember ring-1 ring-line-hi">
                  <Orbit className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <span className="hud-label">core</span>
              </div>
              <OrbitVisual />
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
                  Continuous reasoning core
                </h3>
                <p className="mt-2 max-w-md text-sm text-ink-soft">
                  A perpetual model loop holds your entire context in motion, re-deriving
                  conclusions the instant any input shifts.
                </p>
              </div>
            </div>
          </TiltPanel>
        </Reveal>

        {/* Tall panel */}
        <Reveal className="md:col-span-5" y={36} delay={0.08}>
          <TiltPanel className="h-full min-h-[340px]">
            <div className="flex h-full flex-col justify-between gap-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-halo/12 text-halo ring-1 ring-line-hi">
                <Radar className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <RadarVisual />
              <div>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
                  Omnidirectional sensing
                </h3>
                <p className="mt-2 text-sm text-ink-soft">
                  Sweeps thousands of streams at once, surfacing the faint signal beneath
                  the noise floor.
                </p>
              </div>
            </div>
          </TiltPanel>
        </Reveal>

        {/* Two medium panels */}
        <Reveal className="md:col-span-5" y={36} delay={0.04}>
          <TiltPanel className="h-full min-h-[220px]">
            <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-ember/12 text-ember ring-1 ring-line-hi">
              <Waves className="h-5 w-5" strokeWidth={1.6} />
            </span>
            <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
              Fluid synthesis
            </h3>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              Disparate sources melt into one coherent picture, rendered as a surface you
              can read at a glance.
            </p>
          </TiltPanel>
        </Reveal>

        <Reveal className="md:col-span-7" y={36} delay={0.1}>
          <TiltPanel className="h-full min-h-[220px]">
            <div className="flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <span className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-halo/12 text-halo ring-1 ring-line-hi">
                  <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="font-display text-2xl font-bold tracking-tight text-ink">
                  Sealed by design
                </h3>
                <p className="mt-2 max-w-md text-sm text-ink-soft">
                  Every inference runs inside an encrypted enclave. Your light never leaves
                  your orbit.
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-3 gap-2 text-center sm:grid-cols-1">
                {[
                  ["99.99%", "uptime"],
                  ["E2E", "encrypted"],
                  ["SOC 2", "type II"],
                ].map(([v, k]) => (
                  <div key={k} className="rounded-lg border border-line px-3 py-2">
                    <div className="font-mono text-sm text-ink">{v}</div>
                    <div className="hud-label !tracking-[0.18em]">{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </TiltPanel>
        </Reveal>
      </div>
    </section>
  );
}

function OrbitVisual() {
  return (
    <div aria-hidden className="relative mx-auto h-28 w-full max-w-[280px]">
      {[44, 70, 96].map((size, i) => (
        <span
          key={size}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-line-hi"
          style={{
            width: `${size}%`,
            height: `${size}%`,
            animation: `drift ${10 + i * 4}s linear infinite alternate`,
          }}
        >
          <span
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{
              top: "-3px",
              left: `${30 + i * 18}%`,
              background: i === 1 ? "var(--color-halo)" : "var(--color-ember)",
              boxShadow: "0 0 12px 2px oklch(0.82 0.125 72 / 0.7)",
            }}
          />
        </span>
      ))}
      <span className="anim-float absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember shadow-[0_0_24px_6px_oklch(0.82_0.125_72/0.7)]" />
    </div>
  );
}

function RadarVisual() {
  return (
    <div aria-hidden className="relative mx-auto aspect-square w-full max-w-[180px]">
      <div className="absolute inset-0 rounded-full border border-line-hi" />
      <div className="absolute inset-[18%] rounded-full border border-line" />
      <div className="absolute inset-[40%] rounded-full border border-line" />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, oklch(0.83 0.07 214 / 0.35), transparent 28%)",
          animation: "loader-rotation 4s linear infinite",
          maskImage: "radial-gradient(circle, #000 65%, transparent 66%)",
          WebkitMaskImage: "radial-gradient(circle, #000 65%, transparent 66%)",
        }}
      />
      <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-halo shadow-[0_0_12px_3px_oklch(0.83_0.07_214/0.8)]" />
      <span className="absolute left-[68%] top-[34%] h-1 w-1 rounded-full bg-ember" />
      <span className="absolute left-[30%] top-[62%] h-1 w-1 rounded-full bg-ember" />
    </div>
  );
}
