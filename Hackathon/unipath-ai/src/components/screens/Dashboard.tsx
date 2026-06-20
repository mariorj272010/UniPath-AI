"use client";

import { useEffect, useState } from "react";
import {
  Download,
  RotateCcw,
  LayoutDashboard,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building2,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { Atmosphere } from "@/components/site/atmosphere";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReadinessHero } from "@/components/dashboard/ReadinessHero";
import { CategoryCards } from "@/components/dashboard/CategoryCards";
import { StrengthsWeaknesses } from "@/components/dashboard/StrengthsWeaknesses";
import { RecommendedMajors } from "@/components/dashboard/RecommendedMajors";
import { CareerExplorer } from "@/components/dashboard/CareerExplorer";
import { UniversityMatch } from "@/components/dashboard/UniversityMatch";
import { ActionPlan } from "@/components/dashboard/ActionPlan";
import { useAnalysis } from "@/components/AnalysisProvider";
import { toMarkdown } from "@/lib/report";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "strengths", label: "Strengths", icon: Sparkles },
  { id: "majors", label: "Majors", icon: GraduationCap },
  { id: "careers", label: "Careers", icon: Briefcase },
  { id: "universities", label: "Universities", icon: Building2 },
  { id: "plan", label: "Action Plan", icon: CalendarCheck },
];

export function Dashboard({ onRestart }: { onRestart: () => void }) {
  const [active, setActive] = useState("overview");
  const analysis = useAnalysis();

  const handleExport = () => {
    const blob = new Blob([toMarkdown(analysis)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "unipath_report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const sections = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const go = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="grain relative min-h-[100dvh] pb-20">
      <Atmosphere />

      {/* top bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-[oklch(0.11_0.01_60/0.7)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="block h-3.5 w-3.5 rounded-[3px] bg-ember shadow-[0_0_14px_2px_oklch(0.82_0.125_72/0.7)]" />
            <span className="font-display text-base font-extrabold tracking-tight text-ink">
              UniPath <span className="text-gradient">AI</span>
            </span>
            <Badge variant="emerald" size="sm" className="ml-1 hidden sm:inline-flex">
              <ShieldCheck className="h-3 w-3" /> Private
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="ghost" size="sm" onClick={onRestart}>
              <RotateCcw className="h-4 w-4" /> Start over
            </Button>
          </div>
        </div>

        <nav className="mx-auto max-w-6xl overflow-x-auto px-5 pb-2.5 sm:px-8">
          <div className="flex gap-1.5">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-all",
                  active === n.id
                    ? "bg-ember text-void-deep"
                    : "text-ink-faint hover:bg-[oklch(0.97_0.01_80/0.06)] hover:text-ink"
                )}
              >
                <n.icon className="h-4 w-4" /> {n.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl space-y-20 px-5 py-12 sm:px-8">
        <div id="overview" className="scroll-mt-32 space-y-8">
          <ReadinessHero />
          <CategoryCards />
        </div>
        <div id="strengths" className="scroll-mt-32">
          <StrengthsWeaknesses />
        </div>
        <div id="majors" className="scroll-mt-32">
          <RecommendedMajors />
        </div>
        <div id="careers" className="scroll-mt-32">
          <CareerExplorer />
        </div>
        <div id="universities" className="scroll-mt-32">
          <UniversityMatch />
        </div>
        <div id="plan" className="scroll-mt-32">
          <ActionPlan />
        </div>

        <footer className="glass rounded-3xl p-6 text-center text-xs text-ink-faint">
          This is a readiness estimate, not an admission prediction. University requirements
          change — always verify with official sources. Analyzed locally; nothing was uploaded.
        </footer>
      </main>
    </div>
  );
}
