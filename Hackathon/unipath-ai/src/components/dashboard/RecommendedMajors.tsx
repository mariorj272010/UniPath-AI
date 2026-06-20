"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, Rocket, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Reveal } from "@/components/ui/reveal";
import { useAnalysis } from "@/components/AnalysisProvider";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";

export function RecommendedMajors() {
  const { majors: MAJORS } = useAnalysis();
  const [open, setOpen] = useState<string | null>(MAJORS[0]?.name ?? null);

  return (
    <section>
      <SectionHeading
        kicker="Recommended majors"
        title="Fields that fit your evidence"
        desc="Match scores come from your demonstrated work — tap a card for the full rationale."
      />
      <div className="grid gap-4">
        {MAJORS.map((m, i) => {
          const expanded = open === m.name;
          return (
            <Reveal key={m.name} delay={i * 0.06}>
              <Card hover className="overflow-hidden">
                <button
                  onClick={() => setOpen(expanded ? null : m.name)}
                  className="flex w-full items-center gap-4 p-5 text-left"
                  aria-expanded={expanded}
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ember font-display text-base font-bold text-void-deep">
                    {m.match}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-semibold text-navy-900">
                        {m.name}
                      </h3>
                      <Badge variant="brand" size="sm">
                        <Sparkles className="h-3 w-3" /> {m.match}% match
                      </Badge>
                    </div>
                    <div className="mt-2 max-w-md">
                      <Progress value={m.match} tone="brand" delay={i * 0.06} />
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-muted transition-transform duration-300",
                      expanded && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-line px-5 pb-5 pt-4">
                        <p className="text-sm leading-relaxed text-ink-soft">
                          {m.why}
                        </p>
                        <div className="mt-4 grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                              <BookOpen className="h-3.5 w-3.5" /> Key subjects
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {m.subjects.map((s) => (
                                <Badge key={s} variant="navy" size="sm">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                              <Rocket className="h-3.5 w-3.5" /> Future opportunities
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {m.opportunities.map((o) => (
                                <Badge key={o} variant="emerald" size="sm">
                                  {o}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
