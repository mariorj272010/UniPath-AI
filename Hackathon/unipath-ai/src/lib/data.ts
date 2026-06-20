import type {
  ActionWeek,
  Career,
  CategoryScore,
  Major,
  University,
} from "./types";

export const OVERALL_SCORE = 87;

export const CATEGORIES: CategoryScore[] = [
  {
    key: "academics",
    label: "Academics",
    score: 91,
    weight: 40,
    trend: "up",
    delta: "+6",
    tone: "brand",
    blurb:
      "Strong GPA and a rigorous STEM course load. Your math and physics results stand out.",
  },
  {
    key: "leadership",
    label: "Leadership",
    score: 78,
    weight: 20,
    trend: "up",
    delta: "+11",
    tone: "brand",
    blurb:
      "Robotics captain shows initiative. Broaden impact beyond a single club to lift this further.",
  },
  {
    key: "extracurriculars",
    label: "Extracurriculars",
    score: 84,
    weight: 20,
    trend: "flat",
    delta: "0",
    tone: "emerald",
    blurb:
      "Consistent, multi-year commitment across robotics, volunteering, and competitive math.",
  },
  {
    key: "career-fit",
    label: "Career Fit",
    score: 88,
    weight: 20,
    trend: "up",
    delta: "+4",
    tone: "amber",
    blurb:
      "Your projects map cleanly onto computing and engineering pathways with real evidence.",
  },
];

export const STRENGTHS = [
  {
    title: "Top-decile STEM academics",
    detail:
      "3.9 GPA with AP Calculus BC, Physics C, and CS A. Consistent upward trend across three years.",
  },
  {
    title: "Demonstrated technical leadership",
    detail:
      "Captain of a 24-person robotics team that advanced to regional finals two years running.",
  },
  {
    title: "Real, shipped projects",
    detail:
      "Built and published two apps plus an ML science-fair project — concrete proof of initiative.",
  },
  {
    title: "Service with depth",
    detail:
      "120+ hours tutoring younger students in math — sustained commitment, not one-off events.",
  },
];

export const WEAKNESSES = [
  {
    title: "Standardized testing not yet evidenced",
    detail:
      "No SAT/ACT on file. A strong score would reinforce your academic narrative for reach schools.",
  },
  {
    title: "Leadership concentrated in one area",
    detail:
      "Impact is mostly within robotics. A cross-disciplinary role would broaden your profile.",
  },
  {
    title: "Limited formal writing samples",
    detail:
      "Few humanities artifacts. Essay polish will matter for holistic admissions reviews.",
  },
];

export const MAJORS: Major[] = [
  {
    name: "Computer Science",
    match: 95,
    why: "Your shipped apps, CS coursework, and ML project are direct, verifiable evidence of fit and follow-through.",
    subjects: ["Algorithms", "Data Structures", "Machine Learning", "Systems"],
    opportunities: [
      "Software Engineer",
      "ML Engineer",
      "Research",
      "Startup Founder",
    ],
  },
  {
    name: "Computer Engineering",
    match: 89,
    why: "Robotics leadership bridges hardware and software — a natural match for an integrated systems major.",
    subjects: ["Digital Logic", "Embedded Systems", "Signals", "Architecture"],
    opportunities: ["Hardware Engineer", "Robotics", "IoT", "Firmware"],
  },
  {
    name: "Applied Mathematics",
    match: 82,
    why: "Competitive-math results and quantitative strengths support a flexible, theory-forward path.",
    subjects: ["Linear Algebra", "Probability", "Optimization", "Modeling"],
    opportunities: ["Data Scientist", "Quant Analyst", "Actuary", "Research"],
  },
];

export const CAREERS: Career[] = [
  {
    title: "Software Engineer",
    description:
      "Design, build, and ship software products. Strong match for your demonstrated project work.",
    salaryLow: 75,
    salaryHigh: 180,
    salaryMax: 250,
    growth: 92,
    outlook: "Much faster than average — sustained, broad demand across industries.",
    pros: ["High demand & mobility", "Remote-friendly", "Clear growth ladder"],
    cons: ["Continuous learning required", "Can involve on-call rotations"],
  },
  {
    title: "Machine Learning Engineer",
    description:
      "Build models and the systems around them. Your ML science-fair project is a credible on-ramp.",
    salaryLow: 95,
    salaryHigh: 210,
    salaryMax: 250,
    growth: 96,
    outlook: "Among the fastest-growing technical roles this decade.",
    pros: ["Cutting-edge work", "High compensation", "Research-to-product range"],
    cons: ["Steeper math bar", "Tooling changes quickly"],
  },
  {
    title: "Robotics Engineer",
    description:
      "Combine mechanical, electrical, and software systems — a direct extension of your robotics leadership.",
    salaryLow: 80,
    salaryHigh: 160,
    salaryMax: 250,
    growth: 84,
    outlook: "Growing steadily as automation expands across sectors.",
    pros: ["Hands-on & tangible", "Interdisciplinary", "Hardware + software"],
    cons: ["Often location-bound", "Longer build/test cycles"],
  },
];

// Tiers follow the score thresholds: 0-59 Reach · 60-79 Match · 80-100 Safety.
export const UNIVERSITIES: University[] = [
  {
    name: "Massachusetts Institute of Technology (MIT)",
    location: "Cambridge, USA",
    tier: "Reach",
    match: 57,
    difficulty: "Very High",
    readiness: "Long shot",
    suggestion:
      "Add a strong SAT/ACT and a standout regional/national award to be competitive.",
  },
  {
    name: "Stanford University",
    location: "Stanford, USA",
    tier: "Reach",
    match: 53,
    difficulty: "Very High",
    readiness: "Long shot",
    suggestion: "A nationally recognized project or research output would move the needle.",
  },
  {
    name: "Carnegie Mellon University",
    location: "Pittsburgh, USA",
    tier: "Match",
    match: 72,
    difficulty: "Very High",
    readiness: "Reachable with work",
    suggestion: "Lead a project with measurable external impact to strengthen your case.",
  },
  {
    name: "University of Waterloo",
    location: "Waterloo, Canada",
    tier: "Match",
    match: 76,
    difficulty: "High",
    readiness: "Reachable with work",
    suggestion: "Emphasize math-contest results and target the co-op program in your essays.",
  },
  {
    name: "University of Toronto",
    location: "Toronto, Canada",
    tier: "Safety",
    match: 84,
    difficulty: "High",
    readiness: "Realistic now",
    suggestion: "Polish essays that connect robotics leadership to your CS goals.",
  },
  {
    name: "Purdue University",
    location: "West Lafayette, USA",
    tier: "Safety",
    match: 88,
    difficulty: "Moderate",
    readiness: "Realistic now",
    suggestion: "You present well here — apply early action to maximize your odds.",
  },
  {
    name: "Arizona State University",
    location: "Tempe, USA",
    tier: "Safety",
    match: 95,
    difficulty: "Accessible",
    readiness: "Realistic now",
    suggestion: "Strong scholarship candidate — highlight robotics for merit aid.",
  },
];

export const ACTION_PLAN: ActionWeek[] = [
  {
    week: 1,
    theme: "Lock the foundations",
    focus: "Testing & timeline",
    reward: "🎯 Planner badge",
    tasks: [
      "Register for the next SAT/ACT date",
      "Build a master deadline tracker for all target schools",
      "Take one timed diagnostic and record a baseline",
    ],
  },
  {
    week: 2,
    theme: "Sharpen the narrative",
    focus: "Story & essays",
    reward: "✍️ Storyteller badge",
    tasks: [
      "Draft your personal-statement spine (robotics → CS)",
      "Collect two recommender candidates and ask",
      "Outline one supplemental essay per reach school",
    ],
  },
  {
    week: 3,
    theme: "Broaden your impact",
    focus: "Leadership & projects",
    reward: "🚀 Builder badge",
    tasks: [
      "Ship a public update for one of your apps",
      "Mentor a junior teammate and document the impact",
      "Submit one project to a competition or showcase",
    ],
  },
  {
    week: 4,
    theme: "Polish & apply",
    focus: "Review & submit",
    reward: "🏆 Finisher badge",
    tasks: [
      "Finalize the activities list with quantified results",
      "Run essays through two rounds of feedback",
      "Submit early-action / early-decision applications",
    ],
  },
];

export const ANALYSIS_STEPS = [
  "Reading your profile & documents…",
  "Analyzing academic readiness…",
  "Evaluating leadership experience…",
  "Scoring extracurricular depth…",
  "Matching majors to your evidence…",
  "Comparing university fit…",
  "Drafting your 30-day action plan…",
] as const;
