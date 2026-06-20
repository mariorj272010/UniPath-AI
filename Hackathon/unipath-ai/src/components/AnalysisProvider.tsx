"use client";

import { createContext, useContext } from "react";
import { FALLBACK_ANALYSIS, type NormalizedAnalysis } from "@/lib/analysis";

const AnalysisContext = createContext<NormalizedAnalysis>(FALLBACK_ANALYSIS);

/** Provides the active analysis (real or demo fallback) to the dashboard tree. */
export function AnalysisProvider({
  value,
  children,
}: {
  value: NormalizedAnalysis | null;
  children: React.ReactNode;
}) {
  return (
    <AnalysisContext.Provider value={value ?? FALLBACK_ANALYSIS}>
      {children}
    </AnalysisContext.Provider>
  );
}

export const useAnalysis = () => useContext(AnalysisContext);
