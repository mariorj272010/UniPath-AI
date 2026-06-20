"use client";

import { CheckCircle2, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";
import { SectionHeading } from "./SectionHeading";

export function StrengthsWeaknesses() {
  const { strengths: STRENGTHS, weaknesses: WEAKNESSES } = useAnalysis();
  return (
    <section>
      <SectionHeading
        kicker="Honest assessment"
        title="Strengths & opportunities"
        desc="What's working in your favor, and where focused effort pays off most."
      />
      <div className="grid gap-5 lg:grid-cols-2">
        {/* strengths */}
        <Reveal>
          <div className="rounded-3xl border border-[oklch(0.82_0.1_168/0.25)] bg-[oklch(0.82_0.1_168/0.06)] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-verdant text-void-deep">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">
                Strengths
              </h3>
            </div>
            <div className="space-y-3">
              {STRENGTHS.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.06}>
                  <Card className="border-[oklch(0.82_0.1_168/0.12)] bg-[oklch(0.97_0.01_80/0.03)] p-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900">
                          {s.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {s.detail}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>

        {/* weaknesses */}
        <Reveal delay={0.08}>
          <div className="rounded-3xl border border-[oklch(0.8_0.15_58/0.25)] bg-[oklch(0.8_0.15_58/0.06)] p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500 text-void-deep">
                <Lightbulb className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">
                Opportunities to grow
              </h3>
            </div>
            <div className="space-y-3">
              {WEAKNESSES.map((w, i) => (
                <Reveal key={w.title} delay={i * 0.06}>
                  <Card className="border-[oklch(0.8_0.15_58/0.12)] bg-[oklch(0.97_0.01_80/0.03)] p-4">
                    <div className="flex gap-3">
                      <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-navy-900">
                          {w.title}
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted">
                          {w.detail}
                        </p>
                      </div>
                    </div>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
