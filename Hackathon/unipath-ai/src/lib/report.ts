import type { NormalizedAnalysis } from "./analysis";

/** Render a normalized analysis as a downloadable Markdown report (matches the
 *  Streamlit app's report structure). */
export function toMarkdown(a: NormalizedAnalysis): string {
  const lines: string[] = [];
  const push = (s = "") => lines.push(s);

  push("# UniPath AI — Readiness Report");
  push();
  push("## Overall Readiness Score");
  push();
  push(`Score: ${a.overallScore}/100`);
  push();
  if (a.summary) {
    push(a.summary);
    push();
  }

  push("## Category Scores");
  push();
  a.categories.forEach((c) =>
    push(`- ${c.label} (${c.weight}%): ${c.score}/100 — ${c.blurb}`)
  );
  push();

  push("## Strengths");
  push();
  a.strengths.forEach((s) => push(`- **${s.title}** — ${s.detail}`));
  push();

  push("## Weaknesses");
  push();
  a.weaknesses.forEach((w) => push(`- **${w.title}** — ${w.detail}`));
  push();

  push("## Recommended Majors");
  push();
  a.majors.forEach((m) => {
    push(`### ${m.name} (${m.match}% match)`);
    push(m.why);
    if (m.subjects.length) push(`Key subjects: ${m.subjects.join(", ")}`);
    if (m.opportunities.length) push(`Opportunities: ${m.opportunities.join(", ")}`);
    push();
  });

  push("## Career Paths to Consider");
  push();
  a.careers.forEach((c) => {
    push(`### ${c.title}`);
    push(`What it is: ${c.description}`);
    push(`Salary range: $${c.salaryLow}k–$${c.salaryHigh}k`);
    if (c.pros.length) push(`Pros: ${c.pros.join("; ")}`);
    if (c.cons.length) push(`Cons / tradeoffs: ${c.cons.join("; ")}`);
    if (c.outlook) push(`Outlook: ${c.outlook}`);
    push();
  });

  push("## Target Universities");
  push();
  (["Reach", "Match", "Safety"] as const).forEach((tier) => {
    const group = a.universities.filter((u) => u.tier === tier);
    if (!group.length) return;
    push(`**${tier}**`);
    group.forEach((u) =>
      push(
        `- ${u.name}${u.location ? ` (${u.location})` : ""} — ${u.match}% match · ${u.readiness} · ${u.difficulty} difficulty. ${u.suggestion}`
      )
    );
    push();
  });

  if (a.improvementAreas.length) {
    push("## Top Improvement Areas");
    push();
    a.improvementAreas.forEach((t, i) => push(`${i + 1}. ${t}`));
    push();
  }

  push("## Personalized 30-Day Action Plan");
  push();
  a.actionPlan.forEach((w) => {
    push(`**Week ${w.week} — ${w.theme}** (${w.focus})`);
    w.tasks.forEach((t) => push(`- ${t}`));
    push();
  });

  push("## Confidence Level");
  push();
  push(a.confidence);
  if (a.confidenceReason) {
    push();
    push(`Reason: ${a.confidenceReason}`);
  }
  push();

  push("## Sources & Limitations");
  push();
  push(`- ${a.sources}`);
  push("- Verify all university requirements with official sources.");
  push();

  push("## Disclaimer");
  push();
  push(a.disclaimer);

  return lines.join("\n");
}
