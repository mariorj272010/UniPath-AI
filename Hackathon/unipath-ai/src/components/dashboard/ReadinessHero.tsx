"use client";

import { Award, ShieldCheck, Sparkles } from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";

export function ReadinessHero() {
  const { overallScore, summary, confidence, improvementAreas } = useAnalysis();

  return (
    <Reveal>
      <div className="glass glass-edge relative overflow-hidden rounded-[2rem] p-7 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full blur-[90px]"
          style={{ background: "oklch(0.82 0.125 72 / 0.28)" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-10 h-60 w-60 rounded-full blur-[90px]"
          style={{ background: "oklch(0.5 0.08 220 / 0.28)" }}
        />

        <div className="relative grid items-center gap-9 sm:grid-cols-[auto_1fr]">
          <div className="anim-float grid place-items-center rounded-3xl border border-line bg-[oklch(0.97_0.01_80/0.03)] p-4">
            <CircularProgress
              value={overallScore}
              size={200}
              label={overallScore >= 85 ? "Strong fit" : overallScore >= 70 ? "Solid fit" : "Emerging"}
            />
          </div>

          <div>
            <Badge variant="brand" size="md" className="mb-4">
              <Award className="h-3.5 w-3.5" /> AI readiness estimate
            </Badge>
            <h1 className="display-lg text-ink">Your overall readiness</h1>
            <p className="mt-3 max-w-md text-ink-soft">{summary}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Badge variant="emerald" size="md">
                <Sparkles className="h-3.5 w-3.5" /> {confidence} confidence
              </Badge>
              <Badge variant="navy" size="md">
                <ShieldCheck className="h-3.5 w-3.5 text-verdant" /> Grounded in vetted data
              </Badge>
              <Badge variant="navy" size="md">40 / 20 / 20 / 20 rubric</Badge>
            </div>
            {improvementAreas.length > 0 && (
              <div className="mt-6">
                <p className="hud-label mb-2.5">Biggest levers</p>
                <div className="flex flex-wrap gap-2">
                  {improvementAreas.slice(0, 3).map((a) => (
                    <span
                      key={a}
                      className="rounded-full border border-line-hi bg-[oklch(0.97_0.01_80/0.04)] px-3 py-1.5 text-xs text-ink-soft"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
