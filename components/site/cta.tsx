"use client";

import { GlowButton } from "./glow-button";
import { Reveal } from "./reveal";

export function CallToAction() {
  return (
    <section
      id="access"
      className="relative mx-auto max-w-5xl px-5 py-[16vh] text-center sm:px-8"
      style={{ zIndex: "var(--z-content)" }}
    >
      {/* Glowing portal */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div
          className="anim-float h-[34vw] w-[34vw] max-h-[420px] max-w-[420px] rounded-full blur-[10px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.86 0.13 80 / 0.5), oklch(0.62 0.13 56 / 0.18) 45%, transparent 70%)",
          }}
        />
      </div>

      <Reveal>
        <span className="hud-label mb-7 inline-block">[ Boarding now ]</span>
        <h2 className="display-lg mx-auto max-w-[15ch] text-balance text-ink">
          Step into the field of light
        </h2>
        <p className="mx-auto mt-6 max-w-[46ch] text-lg text-ink-soft">
          Access opens in waves. Claim your place in the first cohort and we&apos;ll render
          your world the day you arrive.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <GlowButton href="#" className="px-9 py-4 text-base">
            Request access
            <span aria-hidden className="text-base leading-none">→</span>
          </GlowButton>
          <GlowButton href="#engine" variant="ghost" className="px-9 py-4 text-base">
            Talk to the team
          </GlowButton>
        </div>

        <p className="hud-label mt-8">No card · invite-gated · 2,400 already in orbit</p>
      </Reveal>
    </section>
  );
}
