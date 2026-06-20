"use client";

import { motion } from "framer-motion";
import { Check, Minus, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";
import { SectionHeading } from "./SectionHeading";

export function CareerExplorer() {
  const { careers: CAREERS } = useAnalysis();
  return (
    <section>
      <SectionHeading
        kicker="Career explorer"
        title="Paths worth considering"
        desc="Honest tradeoffs and salary ranges — explore before you commit."
      />
      <div className="relative">
        {/* timeline rail */}
        <div className="absolute bottom-2 left-[19px] top-2 hidden w-px bg-gradient-to-b from-brand-500 via-violet-500 to-emerald-500 sm:block" />
        <div className="space-y-5">
          {CAREERS.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08}>
              <div className="relative sm:pl-12">
                <span className="absolute left-0 top-6 hidden h-10 w-10 place-items-center rounded-full border-4 border-void bg-ember font-display text-sm font-bold text-void-deep sm:grid">
                  {i + 1}
                </span>
                <Card hover className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-navy-900">
                        {c.title}
                      </h3>
                      <p className="mt-1 max-w-lg text-sm leading-relaxed text-muted">
                        {c.description}
                      </p>
                    </div>
                    <Badge variant="emerald" size="md">
                      <TrendingUp className="h-3.5 w-3.5" /> {c.growth}% growth
                    </Badge>
                  </div>

                  {/* salary range bar */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-medium text-muted">
                      <span>Typical salary range (USD)</span>
                      <span className="font-display text-sm font-bold text-navy-900">
                        ${c.salaryLow}k – ${c.salaryHigh}k
                      </span>
                    </div>
                    <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-navy-900/8">
                      <motion.div
                        className="absolute inset-y-0 rounded-full bg-gradient-to-r from-brand-500 to-violet-500"
                        initial={{ width: 0, left: 0 }}
                        whileInView={{
                          left: `${(c.salaryLow / c.salaryMax) * 100}%`,
                          width: `${((c.salaryHigh - c.salaryLow) / c.salaryMax) * 100}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between text-[10px] text-muted/70">
                      <span>$0</span>
                      <span>${c.salaryMax}k+</span>
                    </div>
                  </div>

                  {/* pros / cons / outlook */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                        Pros
                      </p>
                      <ul className="space-y-1.5">
                        {c.pros.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-navy-700">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
                        Cons / tradeoffs
                      </p>
                      <ul className="space-y-1.5">
                        {c.cons.map((p) => (
                          <li key={p} className="flex items-start gap-2 text-sm text-navy-700">
                            <Minus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="mt-4 rounded-2xl bg-navy-900/[0.04] px-4 py-3 text-sm text-navy-700">
                    <span className="font-semibold">Outlook:</span> {c.outlook}
                  </p>
                </Card>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
