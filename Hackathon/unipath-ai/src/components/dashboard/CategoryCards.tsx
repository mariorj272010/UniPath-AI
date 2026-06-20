"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";
import { SectionHeading } from "./SectionHeading";

export function CategoryCards() {
  const { categories } = useAnalysis();
  return (
    <section>
      <SectionHeading
        kicker="Category breakdown"
        title="How each area scored"
        desc="Weighted by the rubric — academics count most, but every lens matters."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c, i) => {
          const TrendIcon =
            c.trend === "up" ? TrendingUp : c.trend === "down" ? TrendingDown : Minus;
          const trendTone =
            c.trend === "up"
              ? "text-emerald-600"
              : c.trend === "down"
                ? "text-amber-600"
                : "text-muted";
          return (
            <Reveal key={c.key} delay={i * 0.07}>
              <Card hover className="h-full p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted">{c.label}</p>
                    <p className="font-display text-3xl font-extrabold tracking-tight text-navy-900">
                      {c.score}
                      <span className="text-base font-semibold text-muted">/100</span>
                    </p>
                  </div>
                  <Badge variant="outline" size="sm" className={trendTone}>
                    <TrendIcon className="h-3 w-3" /> {c.delta}
                  </Badge>
                </div>
                <div className="mt-3">
                  <Progress value={c.score} tone={c.tone} delay={i * 0.07} />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-muted">{c.blurb}</p>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted/70">
                  Weight · {c.weight}%
                </p>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
