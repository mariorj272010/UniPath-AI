"use client";

import { AlertTriangle, RotateCcw, ArrowLeft, Sparkles } from "lucide-react";
import { Atmosphere } from "@/components/site/atmosphere";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AnalysisError({
  message,
  onRetry,
  onUseDemo,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onUseDemo: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grain relative grid min-h-[100dvh] place-items-center overflow-hidden px-5 py-10">
      <Atmosphere />
      <div className="glass glass-edge relative z-10 w-full max-w-md rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[oklch(0.8_0.15_58/0.15)] text-amber-500 ring-1 ring-line-hi">
          <AlertTriangle className="h-7 w-7" strokeWidth={1.6} />
        </div>
        <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
          Analysis couldn&apos;t complete
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{message}</p>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button onClick={onRetry}>
            <RotateCcw className="h-4 w-4" /> Try again
          </Button>
          <Button variant="secondary" onClick={onUseDemo}>
            <Sparkles className="h-4 w-4" /> Explore with sample data
          </Button>
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" /> Edit my profile
          </Button>
        </div>

        <Badge variant="navy" size="sm" className="mt-6">
          Tip: run <code className="mx-1 font-mono text-ember">ollama serve</code> &amp; check{" "}
          <code className="mx-1 font-mono text-ember">ollama list</code>
        </Badge>
      </div>
    </div>
  );
}
