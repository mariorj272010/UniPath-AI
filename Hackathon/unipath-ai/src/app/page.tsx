"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Landing } from "@/components/screens/Landing";
import { Onboarding } from "@/components/screens/Onboarding";
import { Analysis } from "@/components/screens/Analysis";
import { AnalysisError } from "@/components/screens/AnalysisError";
import { Dashboard } from "@/components/screens/Dashboard";
import { AnalysisProvider } from "@/components/AnalysisProvider";
import { fireConfetti } from "@/lib/confetti";
import {
  FALLBACK_ANALYSIS,
  type NormalizedAnalysis,
  type Profile,
} from "@/lib/analysis";

type Stage = "landing" | "onboarding" | "analysis" | "results" | "error";

export default function Home() {
  const [stage, setStage] = useState<Stage>("landing");
  const [result, setResult] = useState<NormalizedAnalysis | null>(null);
  const [error, setError] = useState<string>("");
  const profileRef = useRef<Profile | null>(null);
  const runId = useRef(0);

  const runAnalysis = useCallback(async (profile: Profile) => {
    profileRef.current = profile;
    const id = ++runId.current;
    setResult(null);
    setError("");
    setStage("analysis");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (runId.current !== id) return; // a newer run superseded this one
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong while analyzing your profile.");
        setStage("error");
        return;
      }
      setResult(data.analysis as NormalizedAnalysis);
    } catch {
      if (runId.current !== id) return;
      setError(
        "Couldn't reach the analysis service. Make sure the local AI engine (Ollama) is running, then try again."
      );
      setStage("error");
    }
  }, []);

  // Preload the local model the moment the app opens, so the slow one-time
  // cold-load overlaps with the user reading the landing page / filling the
  // form instead of stalling their first analysis.
  useEffect(() => {
    fetch("/api/analyze", { method: "GET" }).catch(() => {});
  }, []);

  // celebrate on results; jump to top on every stage change
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (stage === "results") {
      const t = setTimeout(fireConfetti, 350);
      return () => clearTimeout(t);
    }
  }, [stage]);

  const useDemo = () => {
    setResult(FALLBACK_ANALYSIS);
    setStage("results");
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {stage === "landing" && <Landing onStart={() => setStage("onboarding")} />}

        {stage === "onboarding" && (
          <Onboarding onComplete={runAnalysis} onBack={() => setStage("landing")} />
        )}

        {stage === "analysis" && (
          <Analysis ready={!!result} onDone={() => setStage("results")} />
        )}

        {stage === "error" && (
          <AnalysisError
            message={error}
            onRetry={() => profileRef.current && runAnalysis(profileRef.current)}
            onUseDemo={useDemo}
            onBack={() => setStage("onboarding")}
          />
        )}

        {stage === "results" && (
          <AnalysisProvider value={result}>
            <Dashboard onRestart={() => setStage("landing")} />
          </AnalysisProvider>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
