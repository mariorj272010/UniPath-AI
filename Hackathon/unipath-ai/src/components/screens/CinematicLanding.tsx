"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { ArrowRight, Compass, Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

// WebGL scene is client-only — never server-render it
const LandingScene = dynamic(
  () => import("@/components/cinematic/LandingScene").then((m) => m.LandingScene),
  {
    ssr: false,
    loading: () => <SceneFallback />,
  }
);

function SceneFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#05060f]">
      <div className="relative h-28 w-28">
        <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/30" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-brand-500 to-violet-500 blur-md" />
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-brand-400 to-violet-400" />
      </div>
      <p className="absolute bottom-24 text-sm tracking-[0.2em] text-slate-400">
        ENTERING THE UNIVERSE…
      </p>
    </div>
  );
}

const fade = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function CinematicLanding({ onStart }: { onStart: () => void }) {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#05060f] text-white">
      {/* 3D universe */}
      <div className="absolute inset-0">
        <LandingScene />
      </div>

      {/* nebula + readability gradients */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-brand-500/20 blur-[140px]" />
        <div className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-violet-500/20 blur-[140px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#05060f] via-[#05060f]/40 to-transparent" />
      </div>

      {/* overlay UI — pass clicks through to the canvas except on controls */}
      <div className="pointer-events-none relative z-10 flex h-full flex-col">
        {/* nav */}
        <motion.header
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between px-6 py-6 sm:px-10"
        >
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-[0_0_24px_rgba(99,102,241,0.6)]">
              <Compass className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">
              UniPath <span className="text-gradient">AI</span>
            </span>
          </div>
          <span className="pointer-events-auto hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 backdrop-blur sm:inline-flex">
            <Lock className="h-3.5 w-3.5 text-emerald-400" /> 100% Private · Runs Locally
          </span>
        </motion.header>

        {/* hero */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <motion.span
            custom={0}
            variants={fade}
            initial="hidden"
            animate="show"
            className="pointer-events-auto mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium tracking-wide text-slate-200 backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-300" /> AI-powered university &amp; career guidance
          </motion.span>

          <motion.h1
            custom={1}
            variants={fade}
            initial="hidden"
            animate="show"
            className="max-w-4xl font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-tight sm:text-6xl md:text-7xl"
          >
            Discover The Future
            <br />
            You&apos;re <span className="text-gradient">Built For</span>.
          </motion.h1>

          <motion.p
            custom={2}
            variants={fade}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            AI-powered guidance that transforms your achievements into a
            personalized university and career roadmap.
          </motion.p>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="show"
            className="pointer-events-auto mt-9"
          >
            <Button
              size="lg"
              onClick={onStart}
              className="shadow-[0_0_40px_rgba(99,102,241,0.55)]"
            >
              Begin Your Journey <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>

        {/* hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="pb-8 text-center text-xs tracking-[0.18em] text-slate-500"
        >
          MOVE YOUR CURSOR · HOVER THE ORB
        </motion.p>
      </div>
    </div>
  );
}
