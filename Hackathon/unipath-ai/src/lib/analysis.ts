import type {
  ActionWeek,
  Career,
  CategoryScore,
  Major,
  Trend,
  University,
  UniTier,
} from "./types";
import {
  ACTION_PLAN,
  CAREERS,
  CATEGORIES,
  MAJORS,
  OVERALL_SCORE,
  STRENGTHS,
  UNIVERSITIES,
  WEAKNESSES,
} from "./data";

/** The profile collected from the onboarding wizard. */
export interface Profile {
  grade?: string;
  gpa?: string;
  tests?: string;
  country?: string;
  targets?: string;
  majors?: string[];
  strengths?: string[];
  careers?: string[];
  leadership?: string;
  activities?: string;
  awards?: string;
  documentText?: string;
}

/** Fully normalized result the dashboard renders. */
export interface NormalizedAnalysis {
  overallScore: number;
  summary: string;
  confidence: "Low" | "Medium" | "High";
  confidenceReason: string;
  categories: CategoryScore[];
  strengths: { title: string; detail: string }[];
  weaknesses: { title: string; detail: string }[];
  improvementAreas: string[];
  majors: Major[];
  careers: Career[];
  universities: University[];
  actionPlan: ActionWeek[];
  sources: string;
  disclaimer: string;
}

/* --------------------------------------------------------------- coercion */
const num = (v: unknown, fallback = 0) => {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));
/** Convert :shortcode: emoji (which local models love to emit) into real Unicode. */
const EMOJI: Record<string, string> = {
  sparkles: "✨", pencil: "✏️", pencil2: "✏️", memo: "📝", writing_hand: "✍️",
  trophy: "🏆", medal: "🏅", medal_sports: "🏅", first_place_medal: "🥇",
  "1st_place_medal": "🥇", dart: "🎯", target: "🎯", rocket: "🚀", books: "📚",
  book: "📖", mortar_board: "🎓", graduation_cap: "🎓", briefcase: "💼", bulb: "💡",
  fire: "🔥", star: "⭐", star2: "🌟", muscle: "💪", chart_with_upwards_trend: "📈",
  handshake: "🤝", clipboard: "📋", calendar: "📅", spiral_calendar: "🗓️", brain: "🧠",
  gem: "💎", crown: "👑", tada: "🎉", checkered_flag: "🏁", flag: "🚩",
  triangular_flag_on_post: "🚩", clap: "👏", compass: "🧭", world_map: "🗺️", key: "🔑",
};
const emojify = (s: string) =>
  s.replace(/:([a-z0-9_+-]+):/gi, (m, name: string) => EMOJI[name.toLowerCase()] ?? m);

const str = (v: unknown, fallback = "") =>
  emojify(typeof v === "string" && v.trim() ? v.trim() : fallback);
const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
const strArr = (v: unknown): string[] =>
  arr<unknown>(v).map((x) => emojify(String(x))).filter(Boolean);

const CATEGORY_META: Record<string, { weight: number; tone: CategoryScore["tone"] }> = {
  academics: { weight: 40, tone: "brand" },
  leadership: { weight: 20, tone: "brand" },
  extracurriculars: { weight: 20, tone: "emerald" },
  "career fit": { weight: 20, tone: "amber" },
};

function metaFor(label: string) {
  const key = label.toLowerCase();
  for (const k of Object.keys(CATEGORY_META)) {
    if (key.includes(k.split(" ")[0])) return CATEGORY_META[k];
  }
  return { weight: 20, tone: "navy" as const };
}

function trendFromScore(score: number): { trend: Trend; delta: string } {
  if (score >= 80) return { trend: "up", delta: "Strong" };
  if (score < 65) return { trend: "down", delta: "Focus" };
  return { trend: "flat", delta: "Steady" };
}

/**
 * Tier is DERIVED from the match score, not from the school's prestige.
 * Thresholds (per product spec): 0–59 Reach · 60–79 Match · 80–100 Safety.
 * This means an exceptional applicant can legitimately have a highly selective
 * school land in Match/Safety — the score, not the brand name, decides.
 */
function tierFromMatch(match: number): UniTier {
  if (match >= 80) return "Safety";
  if (match >= 60) return "Match";
  return "Reach";
}
/** Readiness label derived from the assigned tier. */
function readinessForTier(tier: UniTier, strong: boolean): University["readiness"] {
  if (tier === "Safety") return "Realistic now";
  if (tier === "Match") return strong ? "Realistic now" : "Reachable with work";
  return strong ? "Reachable with work" : "Long shot";
}
const DIFFICULTY_RANK: Record<University["difficulty"], number> = {
  "Very High": 4,
  High: 3,
  Moderate: 2,
  Accessible: 1,
};
function coerceDifficulty(v: unknown): University["difficulty"] {
  const s = String(v).toLowerCase();
  if (s.includes("very") || s.includes("most")) return "Very High";
  if (s.includes("access") || s.includes("low") || s.includes("safe")) return "Accessible";
  if (s.includes("mod")) return "Moderate";
  return "High";
}
function coerceConfidence(v: unknown): NormalizedAnalysis["confidence"] {
  const s = String(v).toLowerCase();
  if (s.includes("high")) return "High";
  if (s.includes("low")) return "Low";
  return "Medium";
}

/**
 * Build a set of canonical keys for a university name so the same school is
 * recognized across naming variants — e.g. "Massachusetts Institute of
 * Technology (MIT)" and "MIT" both yield the key "mit".
 */
function uniKeys(name: string): Set<string> {
  const lower = name.toLowerCase();
  const keys = new Set<string>();

  // 1) parenthetical abbreviations, e.g. "(MIT)" -> "mit"
  for (const p of lower.match(/\(([^)]+)\)/g) ?? []) {
    const k = p.replace(/[^a-z0-9]/g, "");
    if (k.length >= 2) keys.add(k);
  }

  // 2) normalized full name (strip parens, punctuation, generic connectors)
  const generic = new Set(["the", "of", "at", "and", "in", "for"]);
  const words = lower
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !generic.has(w));
  if (words.length) keys.add(words.join(" "));

  // 3) acronym from distinctive words (drop ubiquitous school suffixes so
  //    "X University" pairs don't collide); only when it yields >=2 letters
  const common = new Set(["university", "college", "school", "institution"]);
  const distinctive = words.filter((w) => !common.has(w));
  if (distinctive.length >= 2) {
    const acr = distinctive.map((w) => w[0]).join("");
    if (acr.length >= 2) keys.add(acr);
  }

  return keys;
}

/** True when two key-sets share any key (i.e. the same university). */
function sameUni(a: Set<string>, b: Set<string>): boolean {
  for (const k of a) if (b.has(k)) return true;
  return false;
}

/* --------------------------------------------------------------- normalize */
type Raw = Record<string, unknown>;

export function normalizeAnalysis(raw: Raw): NormalizedAnalysis {
  const overallScore = clamp(num(raw.overallScore ?? raw.overall_score ?? raw.score, 0));
  // Very strong applicants (>85) get an honest-score, selectivity-based reach/match/safety
  // split so they always see a real spread instead of an all-safety list.
  const strongApplicant = overallScore > 85;

  const categories: CategoryScore[] = arr<Raw>(raw.categories).map((c) => {
    const label = str(c.label, "Category");
    const meta = metaFor(label);
    const score = clamp(num(c.score));
    const { trend, delta } = trendFromScore(score);
    return {
      key: label.toLowerCase().replace(/\s+/g, "-"),
      label,
      score,
      weight: meta.weight,
      tone: meta.tone,
      trend,
      delta,
      blurb: str(c.explanation ?? c.blurb, ""),
    };
  });

  const majors: Major[] = arr<Raw>(raw.majors).map((m) => ({
    name: str(m.name, "Major"),
    match: clamp(num(m.match, 70)),
    why: str(m.why ?? m.explanation, ""),
    subjects: strArr(m.subjects ?? m.key_subjects),
    opportunities: strArr(m.opportunities ?? m.future_opportunities ?? m.careers),
  }));

  const careers: Career[] = arr<Raw>(raw.careers).map((c) => {
    const low = num(c.salaryLow ?? c.salary_low, 60);
    const high = num(c.salaryHigh ?? c.salary_high, 140);
    return {
      title: str(c.title ?? c.name, "Career"),
      description: str(c.description ?? c.about, ""),
      salaryLow: low,
      salaryHigh: high,
      salaryMax: Math.max(250, Math.ceil(high / 50) * 50),
      growth: clamp(num(c.growth, 80)),
      outlook: str(c.outlook, ""),
      pros: strArr(c.pros),
      cons: strArr(c.cons),
    };
  });

  const baseUnis = arr<Raw>(raw.universities).map((u) => {
    const match = clamp(num(u.match, 70));
    return {
      name: str(u.name, "University"),
      location: str(u.location ?? u.country, ""),
      match,
      difficulty: coerceDifficulty(u.difficulty ?? u.selectivity),
      suggestion: str(u.suggestion ?? u.gap ?? u.improvement, ""),
    };
  });

  // ----- University tiering with a GUARANTEED 2 / 2 / 2 spread -----
  // The list must ALWAYS show at least 2 Reach, 2 Match, and 2 Safety schools.
  // 1) If the model returned fewer than 6, pad from vetted reference data so a
  //    real spread is even possible.
  // 2) Rank by selectivity (hardest first) and split into thirds with a floor of
  //    2 per band. Honest match scores are preserved — only the buckets balance.
  const MIN_PER_TIER = 2;
  const NEEDED = MIN_PER_TIER * 3; // 6

  // De-duplicate the model's own list (across name variants), then pad from
  // reference data — skipping any school already present so the same university
  // never appears twice (e.g. "MIT" vs "Massachusetts Institute of Technology").
  const seen: Set<string>[] = [];
  const padded: typeof baseUnis = [];
  for (const u of baseUnis) {
    const ks = uniKeys(u.name);
    if (seen.some((s) => sameUni(s, ks))) continue;
    seen.push(ks);
    padded.push(u);
  }
  for (const u of UNIVERSITIES) {
    if (padded.length >= NEEDED) break;
    const ks = uniKeys(u.name);
    if (seen.some((s) => sameUni(s, ks))) continue;
    seen.push(ks);
    padded.push({
      name: u.name,
      location: u.location,
      match: u.match,
      difficulty: u.difficulty,
      suggestion: u.suggestion,
    });
  }

  // Rank most-selective first: hardest difficulty + lowest match = Reach.
  const ranked = padded
    .map((u, i) => ({ i, key: DIFFICULTY_RANK[u.difficulty] * 1000 - u.match }))
    .sort((a, b) => b.key - a.key)
    .map((x) => x.i);

  const n = ranked.length;
  const band = Math.max(MIN_PER_TIER, Math.floor(n / 3)); // ≥2 per band
  const reachCut = band; // first `band` ranks → Reach
  const safetyCut = n - band; // last `band` ranks → Safety
  const tierByIndex = new Map<number, UniTier>();
  ranked.forEach((origIdx, pos) => {
    const tier: UniTier =
      pos < reachCut ? "Reach" : pos >= safetyCut ? "Safety" : "Match";
    tierByIndex.set(origIdx, tier);
  });

  const universities: University[] = padded.map((u, i) => {
    const tier = tierByIndex.get(i) ?? tierFromMatch(u.match);
    return { ...u, tier, readiness: readinessForTier(tier, strongApplicant) };
  });

  const REWARDS = ["🎯", "✍️", "🚀", "🏆"];
  const actionPlan: ActionWeek[] = arr<Raw>(raw.actionPlan ?? raw.action_plan)
    .slice(0, 4)
    .map((w, i) => ({
      week: num(w.week, i + 1),
      theme: str(w.theme ?? w.title, `Week ${i + 1}`),
      focus: str(w.focus, "Focus"),
      tasks: strArr(w.tasks),
      reward: str(w.reward, `${REWARDS[i] ?? "⭐"} Week ${i + 1} badge`),
    }));

  const mapPair = (v: unknown) =>
    arr<Raw>(v).map((x) => ({
      title: str(x.title ?? x.heading, ""),
      detail: str(x.detail ?? x.description ?? x.text, ""),
    })).filter((x) => x.title || x.detail);

  return {
    overallScore,
    summary: str(raw.summary, ""),
    confidence: coerceConfidence(raw.confidence),
    confidenceReason: str(raw.confidenceReason ?? raw.confidence_reason, ""),
    categories: categories.length ? categories : FALLBACK_ANALYSIS.categories,
    strengths: mapPair(raw.strengths).length ? mapPair(raw.strengths) : [],
    weaknesses: mapPair(raw.weaknesses).length ? mapPair(raw.weaknesses) : [],
    improvementAreas: strArr(raw.improvementAreas ?? raw.improvement_areas),
    majors: majors.length ? majors : FALLBACK_ANALYSIS.majors,
    careers: careers.length ? careers : FALLBACK_ANALYSIS.careers,
    universities: universities.length ? universities : FALLBACK_ANALYSIS.universities,
    actionPlan: actionPlan.length ? actionPlan : FALLBACK_ANALYSIS.actionPlan,
    sources: str(raw.sources, "Recommendations grounded in UniPath's vetted reference data."),
    disclaimer: str(
      raw.disclaimer,
      "This is a readiness estimate, not an admission prediction. Verify all requirements with official sources."
    ),
  };
}

/* ----------------------------------------- demo fallback (no backend / errors) */
export const FALLBACK_ANALYSIS: NormalizedAnalysis = {
  overallScore: OVERALL_SCORE,
  summary:
    "A strong candidate for competitive computing programs. Academics are the anchor; broadening leadership is the biggest lever.",
  confidence: "Medium",
  confidenceReason:
    "Based on a representative sample profile — connect your local model for a fully personalized analysis.",
  categories: CATEGORIES,
  strengths: STRENGTHS,
  weaknesses: WEAKNESSES,
  improvementAreas: [
    "Add a standardized test score to reinforce academics",
    "Broaden leadership beyond a single club",
    "Strengthen written-communication artifacts",
  ],
  majors: MAJORS,
  careers: CAREERS,
  universities: UNIVERSITIES,
  actionPlan: ACTION_PLAN,
  sources: "Recommendations grounded in UniPath's vetted reference data (sample).",
  disclaimer:
    "This is a readiness estimate, not an admission prediction. Verify all requirements with official sources.",
};
