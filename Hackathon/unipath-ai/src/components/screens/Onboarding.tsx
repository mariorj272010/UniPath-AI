"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Sparkles,
  Trophy,
  UploadCloud,
  ClipboardList,
  FileText,
  FileBadge,
  Briefcase,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Atmosphere } from "@/components/site/atmosphere";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/analysis";

type Method = "cv" | "form";

const FORM_STEPS = [
  { label: "Basics", icon: GraduationCap },
  { label: "Interests", icon: Sparkles },
  { label: "Activities", icon: Trophy },
];

const MAJOR_OPTIONS = [
  "Computer Science", "Data Science", "Engineering", "Mathematics", "Business",
  "Biology", "Economics", "Psychology", "Design", "Physics",
];
const STRENGTH_OPTIONS = [
  "Math", "Physics", "Chemistry", "Writing", "Coding", "Public Speaking", "Art", "Languages",
];
const CAREER_OPTIONS = [
  "Software Engineer", "Data Scientist", "Doctor", "Entrepreneur", "Researcher",
  "Designer", "Financial Analyst", "Product Manager",
];

type DocState = {
  name: string;
  status: "reading" | "done" | "error";
  text?: string;
  error?: string;
};

function Field({
  label, placeholder, value, onChange, required, optional,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  required?: boolean; optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
        {optional && <span className="ml-1 text-ink-faint">(optional)</span>}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-line-hi bg-[oklch(0.97_0.01_80/0.03)] px-4 text-ink outline-none transition-all placeholder:text-ink-faint/70 focus:border-[oklch(0.82_0.125_72/0.5)] focus:ring-4 focus:ring-[oklch(0.82_0.125_72/0.12)]"
      />
    </label>
  );
}

function ChipGroup({
  options, selected, onToggle,
}: { options: string[]; selected: string[]; onToggle: (v: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  // Anything selected that isn't a predefined option is a user-typed value.
  const custom = selected.filter((s) => !options.includes(s));

  const chipBase =
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all active:scale-95";
  const activeChip = "border-transparent bg-ember text-void-deep ember-glow";
  const idleChip =
    "border-line-hi bg-[oklch(0.97_0.01_80/0.03)] text-ink-soft hover:border-[oklch(0.82_0.125_72/0.5)] hover:text-ink";

  const commit = () => {
    const v = draft.trim();
    if (v && !selected.includes(v)) onToggle(v);
    setDraft("");
    setAdding(false);
  };
  const cancel = () => {
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onToggle(opt)}
            className={cn(chipBase, active ? activeChip : idleChip)}
          >
            {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            {opt}
          </button>
        );
      })}

      {/* user-added values — always selected; click to remove */}
      {custom.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onToggle(opt)}
          title="Remove"
          className={cn(chipBase, activeChip)}
        >
          {opt}
          <X className="h-3.5 w-3.5 opacity-80" />
        </button>
      ))}

      {/* "Other" → reveals an inline text box */}
      {adding ? (
        <span
          className={cn(
            chipBase,
            "border-[oklch(0.82_0.125_72/0.5)] bg-[oklch(0.97_0.01_80/0.03)] pr-1.5"
          )}
        >
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); commit(); }
              if (e.key === "Escape") { e.preventDefault(); cancel(); }
            }}
            placeholder="Type your own…"
            className="w-32 bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint/70"
          />
          <button
            type="button"
            onClick={commit}
            disabled={!draft.trim()}
            title="Add"
            className="grid h-6 w-6 place-items-center rounded-full bg-ember text-void-deep transition-opacity disabled:opacity-40"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={cancel}
            title="Cancel"
            className="grid h-6 w-6 place-items-center rounded-full text-ink-faint hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={cn(chipBase, idleChip)}
        >
          <Plus className="h-3.5 w-3.5" /> Other
        </button>
      )}
    </div>
  );
}

function DropZone({
  label, icon: Icon, doc, onFile, onClear,
}: {
  label: string; icon: typeof FileText; doc: DocState | null;
  onFile: (file: File) => void; onClear: () => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile(f);
      }}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition-all",
        over
          ? "border-[oklch(0.82_0.125_72/0.6)] bg-[oklch(0.82_0.125_72/0.08)]"
          : doc?.status === "done"
            ? "border-[oklch(0.82_0.1_168/0.5)] bg-[oklch(0.82_0.1_168/0.06)]"
            : doc?.status === "error"
              ? "border-[oklch(0.8_0.15_58/0.5)] bg-[oklch(0.8_0.15_58/0.06)]"
              : "border-line-hi bg-[oklch(0.97_0.01_80/0.02)] hover:border-[oklch(0.82_0.125_72/0.5)]"
      )}
    >
      <label className="absolute inset-0 cursor-pointer">
        <input
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFile(f);
          }}
        />
      </label>

      {doc?.status === "reading" && (
        <>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[oklch(0.82_0.125_72/0.12)] text-ember">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
          <p className="hud-label !tracking-[0.18em]">Reading PDF…</p>
        </>
      )}
      {doc?.status === "done" && (
        <>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[oklch(0.82_0.1_168/0.15)] text-verdant">
            <Check className="h-5 w-5" />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
          <p className="max-w-[12rem] truncate text-xs text-ink-faint">{doc.name}</p>
          <button
            type="button"
            onClick={onClear}
            className="relative z-10 mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-ink"
          >
            <X className="h-3 w-3" /> Remove
          </button>
        </>
      )}
      {doc?.status === "error" && (
        <>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[oklch(0.8_0.15_58/0.15)] text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
          <p className="max-w-[13rem] text-xs text-amber-500">{doc.error}</p>
          <button
            type="button"
            onClick={onClear}
            className="relative z-10 mt-2 inline-flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-ink"
          >
            <X className="h-3 w-3" /> Try another
          </button>
        </>
      )}
      {!doc && (
        <>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[oklch(0.82_0.125_72/0.12)] text-ember">
            <Icon className="h-5 w-5" />
          </div>
          <p className="mt-2 text-sm font-semibold text-ink">{label}</p>
          <p className="text-xs text-ink-faint">Drag &amp; drop a PDF or click</p>
        </>
      )}
    </div>
  );
}

export function Onboarding({
  onComplete,
  onBack,
}: {
  onComplete: (profile: Profile) => void;
  onBack: () => void;
}) {
  const [method, setMethod] = useState<Method | null>(null);
  const [step, setStep] = useState(0);

  const [grade, setGrade] = useState("");
  const [gpa, setGpa] = useState("");
  const [tests, setTests] = useState("");
  const [country, setCountry] = useState("");
  const [targets, setTargets] = useState("");
  const [majors, setMajors] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [careers, setCareers] = useState<string[]>([]);
  const [leadership, setLeadership] = useState("");
  const [activities, setActivities] = useState("");
  const [awards, setAwards] = useState("");
  const [docs, setDocs] = useState<Record<string, DocState | null>>({
    resume: null,
    transcript: null,
    portfolio: null,
  });

  const toggle = (list: string[], setList: (v: string[]) => void, val: string) =>
    setList(list.includes(val) ? list.filter((x) => x !== val) : [...list, val]);

  async function handleFile(slot: string, file: File) {
    setDocs((d) => ({ ...d, [slot]: { name: file.name, status: "reading" } }));
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setDocs((d) => ({
          ...d,
          [slot]: { name: file.name, status: "error", error: data.error ?? "Couldn't read file." },
        }));
        return;
      }
      setDocs((d) => ({ ...d, [slot]: { name: file.name, status: "done", text: data.text } }));
    } catch {
      setDocs((d) => ({
        ...d,
        [slot]: { name: file.name, status: "error", error: "Upload failed. Try again." },
      }));
    }
  }

  /** Questionnaire-only profile (no documents). */
  function buildFormProfile(): Profile {
    return {
      grade, gpa, tests, country, targets,
      majors, strengths, careers,
      leadership, activities, awards,
    };
  }

  /** CV-only profile (documents, no questionnaire answers). */
  function buildCvProfile(): Profile {
    const documentText = (["resume", "transcript", "portfolio"] as const)
      .map((slot) => {
        const d = docs[slot];
        return d?.status === "done" && d.text ? `[${slot}]\n${d.text}` : null;
      })
      .filter(Boolean)
      .join("\n\n");
    return { documentText: documentText || undefined };
  }

  const extracting = Object.values(docs).some((d) => d?.status === "reading");
  const anyDocDone = Object.values(docs).some((d) => d?.status === "done");

  // Required-field validation per questionnaire step (tests + awards are optional).
  const formStepValid = (s: number) => {
    if (s === 0) return !!(grade.trim() && gpa.trim() && country.trim() && targets.trim());
    if (s === 1) return majors.length > 0 && strengths.length > 0 && careers.length > 0;
    if (s === 2) return !!(leadership.trim() && activities.trim());
    return true;
  };

  const lastFormStep = FORM_STEPS.length - 1;

  const canAdvance =
    method === "cv" ? anyDocDone && !extracting : formStepValid(step);

  const next = () => {
    if (!canAdvance) return;
    if (method === "cv") {
      onComplete(buildCvProfile());
      return;
    }
    if (step < lastFormStep) setStep(step + 1);
    else onComplete(buildFormProfile());
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else if (method) { setMethod(null); setStep(0); } // back to method choice
    else onBack();
  };

  const progress = method === "form" ? ((step + 1) / FORM_STEPS.length) * 100 : 100;

  return (
    <div className="grain relative min-h-[100dvh] overflow-hidden">
      <Atmosphere />
      <div className="relative z-10 mx-auto max-w-2xl px-5 py-10 sm:py-14">
        {/* ---------------- method choice ---------------- */}
        {method === null ? (
          <div>
            <div className="mb-8 text-center">
              <span className="hud-label">Choose one path</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
                How should we read your profile?
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
                Pick the way that fits you — upload a document <em>or</em> answer a few
                questions. You only need one.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MethodCard
                icon={UploadCloud}
                title="Upload your CV"
                desc="Drop a resume or transcript PDF. We read it on your device and analyze from there."
                onClick={() => { setMethod("cv"); setStep(0); }}
              />
              <MethodCard
                icon={ClipboardList}
                title="Answer a questionnaire"
                desc="No document handy? Answer a short, guided set of questions instead."
                onClick={() => { setMethod("form"); setStep(0); }}
              />
            </div>

            <div className="mt-8 flex justify-start">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* progress (questionnaire only) */}
            {method === "form" && (
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  {FORM_STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <div key={s.label} className="flex flex-1 flex-col items-center gap-2">
                        <div
                          className={cn(
                            "grid h-11 w-11 place-items-center rounded-2xl border transition-all duration-300",
                            done && "border-transparent bg-[oklch(0.82_0.1_168/0.9)] text-void-deep",
                            active && "border-transparent bg-ember text-void-deep ember-glow",
                            !done && !active && "border-line-hi bg-[oklch(0.97_0.01_80/0.03)] text-ink-faint"
                          )}
                        >
                          {done ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                        </div>
                        <span className={cn("text-[11px] font-medium", active ? "text-ink" : "text-ink-faint")}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-[oklch(0.97_0.01_80/0.08)]">
                  <motion.div
                    className="h-full rounded-full bg-ember"
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="hud-label mt-2 text-right">Step {step + 1} of {FORM_STEPS.length}</p>
              </div>
            )}

            <div className="glass glass-edge rounded-3xl p-6 sm:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${method}-${step}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* ---------------- CV path ---------------- */}
                  {method === "cv" && (
                    <div className="space-y-5">
                      <Header
                        kicker="Upload · CV"
                        title="Add your CV or transcript"
                        desc="Upload at least one PDF — resume, transcript, or portfolio. Text is extracted locally; files never leave your device."
                      />
                      <div className="grid gap-4 sm:grid-cols-3">
                        <DropZone label="Resume" icon={FileText} doc={docs.resume} onFile={(f) => handleFile("resume", f)} onClear={() => setDocs((d) => ({ ...d, resume: null }))} />
                        <DropZone label="Transcript" icon={FileBadge} doc={docs.transcript} onFile={(f) => handleFile("transcript", f)} onClear={() => setDocs((d) => ({ ...d, transcript: null }))} />
                        <DropZone label="Portfolio" icon={Briefcase} doc={docs.portfolio} onFile={(f) => handleFile("portfolio", f)} onClear={() => setDocs((d) => ({ ...d, portfolio: null }))} />
                      </div>
                      <Badge variant={anyDocDone ? "emerald" : "navy"} className="mt-1">
                        <Check className="h-3.5 w-3.5" />
                        {anyDocDone ? "Ready — text extracted locally" : "Upload at least one document to continue"}
                      </Badge>
                    </div>
                  )}

                  {/* ---------------- Questionnaire path ---------------- */}
                  {method === "form" && step === 0 && (
                    <div className="space-y-5">
                      <Header kicker="01 · Basics" title="Tell us the essentials" desc="A few facts so every recommendation is grounded in your reality." />
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field required label="Current grade / year" placeholder="e.g. Grade 11" value={grade} onChange={setGrade} />
                        <Field required label="GPA / average" placeholder="e.g. 3.9 / 4.0" value={gpa} onChange={setGpa} />
                        <Field optional label="Test scores" placeholder="e.g. SAT 1450" value={tests} onChange={setTests} />
                        <Field required label="Intended country of study" placeholder="e.g. United States, Canada, UK" value={country} onChange={setCountry} />
                      </div>
                      <Field required label="Target universities" placeholder="e.g. MIT, University of Toronto, ASU" value={targets} onChange={setTargets} />
                    </div>
                  )}

                  {method === "form" && step === 1 && (
                    <div className="space-y-6">
                      <Header kicker="02 · Interests" title="What are you drawn to?" desc="Tap everything that resonates — pick at least one in each group." />
                      <Section label="Intended majors" required>
                        <ChipGroup options={MAJOR_OPTIONS} selected={majors} onToggle={(v) => toggle(majors, setMajors, v)} />
                      </Section>
                      <Section label="Academic strengths" required>
                        <ChipGroup options={STRENGTH_OPTIONS} selected={strengths} onToggle={(v) => toggle(strengths, setStrengths, v)} />
                      </Section>
                      <Section label="Career interests" required>
                        <ChipGroup options={CAREER_OPTIONS} selected={careers} onToggle={(v) => toggle(careers, setCareers, v)} />
                      </Section>
                    </div>
                  )}

                  {method === "form" && step === 2 && (
                    <div className="space-y-5">
                      <Header kicker="03 · Activities" title="Show your impact" desc="Leadership, involvement, and recognition — quantify it where you can." />
                      <TextArea required label="Leadership roles" placeholder="Robotics captain, student council, team lead…" value={leadership} onChange={setLeadership} />
                      <TextArea required label="Extracurriculars & projects" placeholder="Clubs, sports, volunteering, side projects…" value={activities} onChange={setActivities} />
                      <TextArea optional label="Awards & honors" placeholder="Competitions, scholarships, recognitions…" value={awards} onChange={setAwards} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {method === "form" && !canAdvance && (
                <p className="mt-4 text-xs text-ink-faint">
                  Complete the required fields <span className="text-ember">*</span> to continue.
                </p>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={back}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button
                  onClick={next}
                  disabled={!canAdvance}
                  className="group inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-medium text-void-deep ember-glow transition-transform duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-40"
                >
                  {extracting
                    ? "Reading documents…"
                    : method === "cv" || step === lastFormStep
                      ? "Analyze my profile"
                      : "Continue"}
                  {!extracting && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MethodCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof UploadCloud;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="glass glass-edge group relative overflow-hidden rounded-3xl p-6 text-left transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1"
    >
      <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[oklch(0.82_0.125_72/0.12)] text-ember ring-1 ring-line-hi">
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </span>
      <h3 className="font-display text-lg font-bold tracking-tight text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{desc}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-ember">
        Choose
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function Header({ kicker, title, desc }: { kicker: string; title: string; desc: string }) {
  return (
    <div>
      <p className="hud-label">{kicker}</p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-soft">{desc}</p>
    </div>
  );
}

function Section({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2.5 text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
      </p>
      {children}
    </div>
  );
}

function TextArea({
  label, placeholder, value, onChange, required, optional,
}: {
  label: string; placeholder: string; value: string; onChange: (v: string) => void;
  required?: boolean; optional?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-soft">
        {label}
        {required && <span className="ml-1 text-ember">*</span>}
        {optional && <span className="ml-1 text-ink-faint">(optional)</span>}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full resize-none rounded-2xl border border-line-hi bg-[oklch(0.97_0.01_80/0.03)] p-4 text-ink outline-none transition-all placeholder:text-ink-faint/70 focus:border-[oklch(0.82_0.125_72/0.5)] focus:ring-4 focus:ring-[oklch(0.82_0.125_72/0.12)]"
      />
    </label>
  );
}
