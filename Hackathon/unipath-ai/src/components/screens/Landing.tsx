"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Gauge,
  GraduationCap,
  Compass,
  Building2,
  ShieldCheck,
  Lock,
  Cpu,
} from "lucide-react";
import { Atmosphere } from "@/components/site/atmosphere";
import { Magnetic } from "@/components/site/magnetic";
import { TiltPanel } from "@/components/site/tilt-panel";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { CircularProgress } from "@/components/ui/circular-progress";

const FEATURES = [
  {
    icon: Gauge,
    title: "Readiness, scored",
    desc: "A weighted 0–100 reading across academics, leadership, activities, and fit.",
    tint: "ember" as const,
  },
  {
    icon: GraduationCap,
    title: "Majors that fit",
    desc: "Fields surfaced from your evidence — with the reasoning made explicit.",
    tint: "halo" as const,
  },
  {
    icon: Compass,
    title: "Honest careers",
    desc: "Real pros, cons, salary ranges, and growth outlook. No sugar-coating.",
    tint: "verdant" as const,
  },
  {
    icon: Building2,
    title: "Reach · Match · Safety",
    desc: "Universities sorted into realistic tiers with a verdict you can act on.",
    tint: "ember" as const,
  },
];

const tintHex = {
  ember: "oklch(0.82 0.125 72)",
  halo: "oklch(0.83 0.07 214)",
  verdant: "oklch(0.82 0.1 168)",
};

export function Landing({ onStart }: { onStart: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="grain relative overflow-hidden">
      <Atmosphere />

      {/* nav */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <span className="anim-float relative block h-3.5 w-3.5 rounded-[3px] bg-ember shadow-[0_0_14px_2px_oklch(0.82_0.125_72/0.7)]" />
          <span className="font-display text-base font-extrabold tracking-tight text-ink">
            UniPath <span className="text-gradient">AI</span>
          </span>
        </div>
        <Magnetic strength={12} className="inline-block">
          <button
            onClick={onStart}
            className="glass glass-edge rounded-full px-5 py-2.5 text-sm font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start your analysis
          </button>
        </Magnetic>
      </header>

      {/* hero */}
      <section
        ref={ref}
        className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 md:grid-cols-[1.05fr_0.95fr] md:pt-16"
      >
        <motion.div style={{ y: heroY, opacity: heroFade }}>
          <Reveal>
            <span className="hud-label mb-6 inline-flex items-center gap-2 rounded-full border border-line-hi px-4 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
              On-device admissions advisor
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="display-xl text-ink">
              Your future,
              <br />
              <span className="text-ember">mapped in light</span>
            </h1>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-soft">
              UniPath AI reads your grades, achievements, and goals, then resolves the
              majors, careers, and universities that actually fit you — analyzed privately
              on your own machine.
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Magnetic strength={14} className="inline-block">
                <button
                  onClick={onStart}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-ember px-7 py-3.5 text-sm font-medium text-void-deep ember-glow transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Start your analysis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Magnetic>
              <Badge variant="emerald" size="md">
                <Lock className="h-3.5 w-3.5" /> 100% private · runs locally
              </Badge>
            </div>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-10 flex items-center gap-7">
              {[
                ["40·20·20·20", "Weighted rubric"],
                ["7 stages", "Profile → plan"],
                ["0 uploads", "Nothing leaves you"],
              ].map(([v, k], i) => (
                <div key={k} className="flex items-center gap-7">
                  {i > 0 && <span className="h-9 w-px bg-line-hi" />}
                  <div>
                    <div className="font-display text-xl font-bold text-ink">{v}</div>
                    <div className="mt-0.5 text-xs text-ink-faint">{k}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </motion.div>

        {/* hero readiness card */}
        <Reveal delay={0.15}>
          <div className="anim-float">
            <TiltPanel className="mx-auto max-w-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="hud-label mb-1">Overall readiness</p>
                  <p className="text-sm font-semibold text-ink-soft">Sample profile</p>
                </div>
                <Badge variant="emerald" size="sm">
                  <ShieldCheck className="h-3 w-3" /> verified
                </Badge>
              </div>
              <div className="mt-2 grid place-items-center">
                <CircularProgress value={87} size={188} label="Strong fit" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                {[
                  ["Academics", 91, "ember"],
                  ["Leadership", 78, "ember"],
                  ["Activities", 84, "verdant"],
                  ["Career fit", 88, "halo"],
                ].map(([label, score, tint]) => (
                  <div key={label as string} className="rounded-2xl border border-line bg-[oklch(0.97_0.01_80/0.03)] p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-faint">{label}</span>
                      <span className="font-display text-sm font-bold text-ink">{score}</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[oklch(0.97_0.01_80/0.08)]">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${score}%`, background: tintHex[tint as keyof typeof tintHex] }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </TiltPanel>
          </div>
        </Reveal>
      </section>

      {/* features */}
      <section className="relative z-10 mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <Reveal>
          <span className="hud-label mb-4 block">[ Four lenses, one field ]</span>
          <h2 className="display-lg max-w-3xl text-ink">
            Everything you need to apply with conviction
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <TiltPanel className="h-full" max={8}>
                <span
                  className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-line-hi"
                  style={{ background: `${tintHex[f.tint]}1f`, color: tintHex[f.tint] }}
                >
                  <f.icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.desc}</p>
              </TiltPanel>
            </Reveal>
          ))}
        </div>
      </section>

      {/* trust */}
      <section className="relative z-10 mx-auto max-w-5xl px-5 py-16 sm:px-8">
        <Reveal>
          <div className="glass glass-edge relative overflow-hidden rounded-[2rem] p-8 text-center sm:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-[90px]"
              style={{ background: "oklch(0.82 0.1 168 / 0.3)" }}
            />
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.82_0.1_168/0.14)] text-verdant ring-1 ring-line-hi">
              <ShieldCheck className="h-7 w-7" strokeWidth={1.6} />
            </span>
            <h2 className="display-lg mx-auto mt-6 max-w-[16ch] text-ink">
              Private by design. Runs on your machine.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-ink-soft">
              Your transcript, resume, and answers are read by a model on your own device.
              Nothing is uploaded to a server, cached, or shared. Ever.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Badge variant="navy" size="md"><Lock className="h-3.5 w-3.5" /> No cloud uploads</Badge>
              <Badge variant="navy" size="md"><Cpu className="h-3.5 w-3.5" /> On-device model</Badge>
              <Badge variant="navy" size="md"><ShieldCheck className="h-3.5 w-3.5" /> No account needed</Badge>
            </div>
            <div className="mt-9">
              <Magnetic strength={14} className="inline-block">
                <button
                  onClick={onStart}
                  className="group inline-flex items-center gap-2.5 rounded-full bg-ember px-8 py-4 text-base font-medium text-void-deep ember-glow transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Start your analysis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 mx-auto max-w-6xl px-5 pb-12 text-center text-xs text-ink-faint sm:px-8">
        UniPath AI · A readiness estimate, not an admission prediction. Always verify
        requirements with official sources.
      </footer>
    </div>
  );
}
