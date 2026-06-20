"use client";

import { Building2, MapPin, Target, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";
import type { University, UniTier } from "@/lib/types";
import { SectionHeading } from "./SectionHeading";

const TIERS: {
  tier: UniTier;
  tone: "amber" | "brand" | "emerald";
  desc: string;
}[] = [
  { tier: "Reach", tone: "amber", desc: "Ambitious — possible with focused improvement." },
  { tier: "Match", tone: "brand", desc: "Well-aligned with your current profile." },
  { tier: "Safety", tone: "emerald", desc: "Highly likely — strong scholarship potential." },
];

const readinessTone: Record<University["readiness"], "amber" | "brand" | "emerald"> = {
  "Long shot": "amber",
  "Reachable with work": "brand",
  "Realistic now": "emerald",
};

function UniCard({ u, idx }: { u: University; idx: number }) {
  return (
    <Reveal delay={idx * 0.05}>
      <Card hover className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-900/[0.04] text-navy-700">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-display text-base font-semibold text-navy-900">
                {u.name}
              </h4>
              <p className="flex items-center gap-1 text-xs text-muted">
                <MapPin className="h-3 w-3" /> {u.location}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-display text-2xl font-extrabold text-navy-900">
              {u.match}
              <span className="text-sm font-semibold text-muted">%</span>
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted">match</p>
          </div>
        </div>

        <div className="mt-4">
          <Progress value={u.match} tone={readinessTone[u.readiness]} delay={idx * 0.05} />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="navy" size="sm">
            <Target className="h-3 w-3" /> {u.difficulty} difficulty
          </Badge>
          <Badge variant={readinessTone[u.readiness]} size="sm">
            {u.readiness}
          </Badge>
        </div>

        <p className="mt-3 flex items-start gap-2 rounded-2xl bg-navy-900/[0.04] px-3 py-2.5 text-xs leading-relaxed text-navy-700">
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
          {u.suggestion}
        </p>
      </Card>
    </Reveal>
  );
}

export function UniversityMatch() {
  const { universities: UNIVERSITIES } = useAnalysis();
  return (
    <section>
      <SectionHeading
        kicker="University match"
        title="Reach · Match · Safety"
        desc="Realistic verdicts based on your evidence — verify all requirements officially."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {TIERS.map((t) => {
          const unis = UNIVERSITIES.filter((u) => u.tier === t.tier);
          return (
            <div key={t.tier}>
              <Reveal>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          t.tone === "amber"
                            ? "oklch(0.82 0.125 72)"
                            : t.tone === "brand"
                              ? "oklch(0.83 0.07 214)"
                              : "oklch(0.82 0.1 168)",
                        boxShadow: "0 0 10px 1px currentColor",
                      }}
                    />
                    <h3 className="font-display text-lg font-bold text-navy-900">
                      {t.tier}
                    </h3>
                    <Badge variant={t.tone} size="sm">
                      {unis.length}
                    </Badge>
                  </div>
                </div>
                <p className="mb-3 text-xs text-muted">{t.desc}</p>
              </Reveal>
              <div className="space-y-4">
                {unis.map((u, i) => (
                  <UniCard key={u.name} u={u} idx={i} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
