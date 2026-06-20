"use client";

import { CheckCircle2, Circle, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";
import { SectionHeading } from "./SectionHeading";

export function ActionPlan() {
  const { actionPlan: ACTION_PLAN, overallScore } = useAnalysis();
  return (
    <section>
      <SectionHeading
        kicker="30-day action plan"
        title="Your improvement roadmap"
        desc="Four focused weeks. Complete each to unlock a badge and lift your readiness."
      />
      <div className="relative">
        {/* timeline rail */}
        <div className="absolute bottom-4 left-[27px] top-4 hidden w-0.5 bg-gradient-to-b from-brand-500 via-violet-500 to-emerald-500 sm:block" />
        <div className="space-y-5">
          {ACTION_PLAN.map((w, i) => (
            <Reveal key={w.week} delay={i * 0.08}>
              <div className="relative sm:pl-16">
                <span className="absolute left-0 top-5 hidden h-14 w-14 flex-col place-items-center justify-center rounded-2xl bg-ember text-void-deep shadow-[var(--shadow-glow)] sm:flex">
                  <span className="text-[9px] font-medium uppercase tracking-wide opacity-80">
                    Week
                  </span>
                  <span className="font-display text-xl font-extrabold leading-none">
                    {w.week}
                  </span>
                </span>
                <Card hover className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                        {w.focus}
                      </p>
                      <h3 className="font-display text-lg font-semibold text-navy-900">
                        {w.theme}
                      </h3>
                    </div>
                    <Badge variant="emerald" size="md">
                      {w.reward}
                    </Badge>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {w.tasks.map((t, ti) => (
                      <li key={t} className="flex items-start gap-3">
                        {ti === 0 ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                        ) : (
                          <Circle className="mt-0.5 h-5 w-5 shrink-0 text-navy-900/20" />
                        )}
                        <span className="text-sm text-navy-700">{t}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </Reveal>
          ))}

          {/* finish line */}
          <Reveal delay={0.1}>
            <div className="relative sm:pl-16">
              <span className="absolute left-0 top-4 hidden h-14 w-14 place-items-center rounded-2xl bg-verdant text-void-deep shadow-[var(--shadow-glow)] sm:grid">
                <Flag className="h-6 w-6" />
              </span>
              <Card className="border-[oklch(0.82_0.1_168/0.25)] bg-[oklch(0.82_0.1_168/0.06)] p-5 text-center sm:p-6">
                <p className="font-display text-lg font-bold text-navy-900">
                  🎉 Projected readiness: {overallScore} →{" "}
                  {Math.min(99, overallScore + 6)}
                </p>
                <p className="mt-1 text-sm text-muted">
                  Complete all four weeks to move two reach schools into match range.
                </p>
              </Card>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
