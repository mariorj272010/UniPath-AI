export type Trend = "up" | "down" | "flat";

export interface CategoryScore {
  key: string;
  label: string;
  score: number;
  weight: number;
  trend: Trend;
  delta: string;
  blurb: string;
  tone: "brand" | "emerald" | "amber" | "navy";
}

export interface Major {
  name: string;
  match: number;
  why: string;
  subjects: string[];
  opportunities: string[];
}

export interface Career {
  title: string;
  description: string;
  salaryLow: number;
  salaryHigh: number;
  salaryMax: number;
  pros: string[];
  cons: string[];
  outlook: string;
  growth: number;
}

export type UniTier = "Reach" | "Match" | "Safety";

export interface University {
  name: string;
  location: string;
  tier: UniTier;
  match: number;
  difficulty: "Very High" | "High" | "Moderate" | "Accessible";
  readiness: "Long shot" | "Reachable with work" | "Realistic now";
  suggestion: string;
}

export interface ActionWeek {
  week: number;
  theme: string;
  focus: string;
  tasks: string[];
  reward: string;
}
