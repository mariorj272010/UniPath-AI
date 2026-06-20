import io
import json
import math
import os
import re
import time
from pathlib import Path

import pdfplumber
import streamlit as st
import streamlit.components.v1 as components
from dotenv import load_dotenv
from openai import OpenAI

# fpdf2 is optional — the app must still run if it isn't installed yet
# (run.bat installs it from requirements.txt on the next launch).
try:
    from fpdf import FPDF
    from fpdf.enums import XPos, YPos

    HAVE_PDF = True
except Exception:
    HAVE_PDF = False

# override=True so this app's .env (local Ollama config) always wins over any
# leftover OPENAI_* environment variables already set on the machine.
load_dotenv(override=True)

st.set_page_config(page_title="UniPath AI", page_icon="🧭", layout="wide")

CUSTOM_CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Geist:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

:root{
  /* refined dark-navy identity — one cool-slate neutral family, brand red + teal preserved */
  --ink:#0a0c14; --ink2:#0c0f1a; --navy:#131a2b; --panel:#171d2d; --panel2:#1c2334;
  --border:#28314a; --border-soft:#202742;
  --red:#ea4862; --red2:#c43a52; --teal:#9fd8d6; --teal2:#2fa18f; --gold:#e6b84e; --amber:#e69a48;
  --text:#eaeef8; --text-dim:#c6cee2; --muted:#97a3c0; --faint:#5d6a8c;
  --font-body:'Geist','Inter',system-ui,-apple-system,sans-serif;
  --ease:cubic-bezier(.22,1,.36,1);
}

.stApp{
  background:
    radial-gradient(1200px 600px at 84% -14%, rgba(234,72,98,0.13), transparent 58%),
    radial-gradient(940px 560px at -6% 114%, rgba(159,216,214,0.07), transparent 56%),
    linear-gradient(180deg,#080a12 0%, var(--ink) 58%, #090b13 100%);
  color:var(--text);
  font-family:var(--font-body);
  font-feature-settings:"ss01","cv01","cv11";
  letter-spacing:-.006em;
}

/* strip Streamlit chrome for a deck feel */
#MainMenu, header[data-testid="stHeader"], footer{visibility:hidden; height:0;}

.block-container{
  position:relative; z-index:1;
  max-width:1060px;
  padding:2rem 3.2rem 2.8rem;
  margin:1.6rem auto 2.6rem;
  background:linear-gradient(180deg, rgba(23,29,45,0.74), rgba(12,16,26,0.66));
  border:1px solid var(--border);
  border-radius:22px;
  box-shadow:0 40px 90px -36px rgba(6,9,20,0.9), 0 1px 0 rgba(255,255,255,0.04) inset;
  animation:slidein .55s var(--ease) both;
}
@keyframes slidein{from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:none;}}
@media (prefers-reduced-motion:reduce){ .block-container{animation:none;} }

h1,h2,h3,h4{font-family:'Space Grotesk',sans-serif; letter-spacing:-.025em; color:var(--text); text-wrap:balance;}

/* ---------- waypoint rail (the signature element) ---------- */
.rail{display:flex; align-items:flex-start; margin:.1rem 0 1.8rem;}
.rail .node{display:flex; flex-direction:column; align-items:center; gap:.45rem; flex:0 0 auto; width:78px;}
.rail .dot{
  width:36px; height:36px; border-radius:50%; display:grid; place-items:center;
  font-family:'Space Mono',monospace; font-size:.82rem; font-weight:700;
  border:1.5px solid var(--border); background:var(--navy); color:var(--muted);
  transition:all .35s ease;
}
.rail .lbl{font-family:'Space Mono',monospace; font-size:.62rem; letter-spacing:.16em;
  text-transform:uppercase; color:var(--muted);}
.rail .seg{height:2px; flex:1 1 auto; background:var(--border); margin:18px .25rem 0; border-radius:2px;}
.rail .seg.fill{background:linear-gradient(90deg,var(--teal2),var(--teal));}
.rail .done .dot{border-color:var(--teal2); color:var(--teal); background:rgba(42,157,143,.16);}
.rail .done .lbl{color:var(--teal);}
.rail .active .dot{border-color:var(--red); color:#fff;
  background:linear-gradient(135deg,var(--red),#b5324a); box-shadow:0 0 0 5px rgba(233,69,96,.16);}
.rail .active .lbl{color:var(--text);}

/* ---------- hero ---------- */
.eyebrow{font-family:'Space Mono',monospace; font-size:.7rem; letter-spacing:.32em;
  text-transform:uppercase; color:var(--red); margin-bottom:.7rem;}
.hero-title{font-family:'Space Grotesk',sans-serif; font-weight:700;
  font-size:clamp(2.7rem,6vw,4.3rem); line-height:.96; letter-spacing:-.035em;
  margin:0 0 .85rem; color:var(--text); text-wrap:balance;}
.hero-title span{color:var(--red);}
.lede{font-size:1.16rem; line-height:1.6; color:var(--text-dim); max-width:46ch;
  margin:0 0 1.5rem; text-wrap:pretty;}
.slide-head{font-size:2rem; font-weight:700; letter-spacing:-.03em; margin:.2rem 0 .2rem;}
.slide-kicker{font-family:'Space Mono',monospace; font-size:.68rem; letter-spacing:.2em;
  text-transform:uppercase; color:var(--muted); margin-bottom:.15rem;}

.badge{display:inline-block; background:rgba(42,157,143,.12); border:1px solid var(--teal2);
  color:var(--teal); border-radius:999px; padding:.3rem .9rem; font-size:.8rem;
  font-family:'Space Mono',monospace; letter-spacing:.04em;}

.recap{background:rgba(13,15,31,.5); border:1px solid var(--border); border-radius:14px;
  padding:1rem 1.2rem; font-family:'Space Mono',monospace; font-size:.82rem; color:var(--muted);
  white-space:pre-wrap; max-height:230px; overflow:auto;}

/* ---------- widgets ---------- */
.stButton>button{
  font-family:'Space Grotesk',sans-serif; font-weight:600; font-size:.96rem; letter-spacing:-.01em;
  border-radius:13px; border:1px solid var(--border); background:var(--panel);
  color:var(--text); padding:.64rem 1.5rem;
  transition:transform .18s var(--ease), box-shadow .25s var(--ease), border-color .2s var(--ease), background .2s var(--ease);
}
.stButton>button:hover{transform:translateY(-2px); border-color:var(--teal2); background:var(--panel2);}
.stButton>button:active{transform:translateY(0) scale(.99);}
.stButton>button:focus-visible{outline:2px solid var(--teal); outline-offset:2px;}
.stButton>button[kind="primary"]{
  background:linear-gradient(135deg,var(--red),var(--red2)); border:none; color:#fff;
  box-shadow:0 16px 32px -12px rgba(234,72,98,.55);
}
.stButton>button[kind="primary"]:hover{box-shadow:0 22px 42px -12px rgba(234,72,98,.66);}
.stButton>button:disabled{opacity:.4; transform:none; box-shadow:none;}

.stTextInput input, .stTextArea textarea{
  background:var(--navy)!important; color:var(--text)!important; border:1px solid var(--border)!important;
  border-radius:12px!important; font-family:var(--font-body)!important;
}
.stTextInput input::placeholder, .stTextArea textarea::placeholder{color:#8995b5!important;}
.stTextInput input:focus, .stTextArea textarea:focus{border-color:var(--red)!important;
  box-shadow:0 0 0 3px rgba(234,72,98,.16)!important;}
.stTextInput label, .stTextArea label, .stRadio label, .stFileUploader label{color:var(--muted)!important; font-weight:500;}
[data-testid="stFileUploaderDropzone"]{
  background:var(--navy); border:1.5px dashed var(--border); border-radius:14px;
}
[data-testid="stForm"]{border:1px solid var(--border); border-radius:18px; background:rgba(13,15,31,.35);}

/* tabs */
.stTabs [data-baseweb="tab-list"]{gap:.4rem; border-bottom:1px solid var(--border);}
.stTabs [data-baseweb="tab"]{
  font-family:'Space Grotesk',sans-serif; font-weight:600; color:var(--muted);
  background:transparent; border-radius:10px 10px 0 0; padding:.5rem 1rem;
}
.stTabs [aria-selected="true"]{color:var(--text)!important; background:rgba(233,69,96,.10)!important;
  border-bottom:2px solid var(--red)!important;}

/* ---------- dashboard components ---------- */
.dash-hero{display:flex; gap:1.4rem; align-items:center; flex-wrap:wrap; justify-content:center;
  margin:.2rem 0 1.2rem;}

.ring{position:relative; border-radius:50%; display:grid; place-items:center;
  background:conic-gradient(var(--c) calc(var(--p)*1%), rgba(255,255,255,.06) 0);
  box-shadow:0 0 0 1px var(--border) inset; animation:pop .6s cubic-bezier(.2,.7,.2,1) both;}
@keyframes pop{from{opacity:0; transform:scale(.85);} to{opacity:1; transform:none;}}
.ring-hole{position:absolute; inset:12px; border-radius:50%; background:#141a29;
  display:flex; flex-direction:column; align-items:center; justify-content:center;}
.ring-num{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:2.7rem; line-height:1;}
.ring-sub{font-family:'Space Mono',monospace; font-size:.7rem; color:var(--muted); margin-top:.1rem;}
.ring-cap{font-family:'Space Mono',monospace; font-size:.55rem; letter-spacing:.22em; color:var(--muted);
  margin-top:.4rem; text-transform:uppercase;}

.hero-meta{display:flex; flex-direction:column; gap:.55rem; min-width:200px;}
.conf{font-family:'Space Mono',monospace; font-size:.72rem; letter-spacing:.08em; padding:.35rem .8rem;
  border-radius:999px; display:inline-block; width:max-content; border:1px solid var(--border);}
.conf.high{color:var(--teal2); border-color:var(--teal2); background:rgba(42,157,143,.12);}
.conf.medium{color:var(--gold); border-color:var(--gold); background:rgba(233,196,106,.10);}
.conf.low{color:var(--red); border-color:var(--red); background:rgba(233,69,96,.10);}
.conf-reason{font-size:.82rem; color:var(--muted); line-height:1.45; max-width:34ch;}

.radar{display:block;}
.radar-cap{text-align:center; font-family:'Space Mono',monospace; font-size:.58rem; letter-spacing:.2em;
  text-transform:uppercase; color:var(--muted); margin-top:-.4rem;}

.chiprow{display:grid; grid-template-columns:repeat(4,1fr); gap:.7rem; margin:.4rem 0 .2rem;}
.chip{background:rgba(13,15,31,.45); border:1px solid var(--border); border-radius:14px; padding:.8rem .9rem;}
.chip-top{display:flex; justify-content:space-between; align-items:baseline; margin-bottom:.5rem;}
.chip-name{font-family:'Space Mono',monospace; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase; color:var(--muted);}
.chip-val{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.3rem;}
.chip-note{font-size:.74rem; color:var(--muted); line-height:1.4; margin-top:.5rem;}

.bar{background:rgba(255,255,255,.07); border-radius:999px; height:8px; overflow:hidden;}
.bar-fill{height:100%; border-radius:999px; transition:width .9s cubic-bezier(.2,.7,.2,1);}

.fitcard{background:rgba(13,15,31,.45); border:1px solid var(--border); border-radius:16px;
  padding:1rem 1.2rem; margin-bottom:.9rem;}
.fitcard-top{display:flex; justify-content:space-between; align-items:baseline; gap:1rem; margin-bottom:.55rem;}
.fitcard-name{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.12rem;}
.fitcard-pct{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.25rem;}
.fitcard-why{font-size:.9rem; color:#cdd7ee; line-height:1.5; margin:.6rem 0 0;}
.fitcard-meta{font-family:'Space Mono',monospace; font-size:.66rem; letter-spacing:.1em;
  text-transform:uppercase; color:var(--muted);}

.pcrow{display:flex; gap:1.4rem; flex-wrap:wrap; margin:.4rem 0 .2rem;}
.pccol{flex:1 1 200px;}
.pchead{font-family:'Space Mono',monospace; font-size:.66rem; letter-spacing:.12em; text-transform:uppercase;
  margin-bottom:.4rem;}
.pchead.pro{color:var(--teal2);}
.pchead.con{color:var(--red);}
.pclist{margin:0; padding-left:1.1rem; font-size:.86rem; color:#cdd7ee; line-height:1.6;}

.metricrow{display:flex; gap:1.2rem; margin:.5rem 0; flex-wrap:wrap;}
.metric{flex:1 1 140px;}
.metric-lbl{font-family:'Space Mono',monospace; font-size:.62rem; letter-spacing:.1em; text-transform:uppercase;
  color:var(--muted); margin-bottom:.35rem; display:flex; justify-content:space-between;}

.tierhead{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1rem; margin:1rem 0 .5rem;
  display:flex; align-items:center; gap:.5rem;}
.tierdot{width:10px; height:10px; border-radius:50%; display:inline-block;}
.uni-verdict{font-family:'Space Mono',monospace; font-size:.7rem; letter-spacing:.06em; color:var(--muted);}
.uni-gap{font-size:.85rem; color:var(--text-dim); line-height:1.5; margin:.6rem 0 0;
  background:rgba(255,255,255,.03); border:1px solid var(--border-soft); border-radius:10px; padding:.55rem .8rem;}

.two-col{display:grid; grid-template-columns:1fr 1fr; gap:1.2rem;}
.panel{background:rgba(13,15,31,.45); border:1px solid var(--border); border-radius:16px; padding:1rem 1.2rem;}
.panel h4{margin:.1rem 0 .6rem; font-size:1rem;}
.panel.str h4{color:var(--teal2);}
.panel.weak h4{color:var(--red);}
.panel ul{margin:0; padding-left:1.1rem; line-height:1.6; color:#cdd7ee; font-size:.9rem;}
.panel.summary{margin-bottom:1.1rem;}
.panel.summary h4{color:var(--teal);}
.summary-text{margin:.2rem 0 0; font-size:.96rem; line-height:1.65; color:#dbe2f2;}

.week{background:rgba(13,15,31,.45); border:1px solid var(--border); border-radius:14px; padding:.9rem 1rem; height:100%;}
.week-tag{font-family:'Space Mono',monospace; font-size:.64rem; letter-spacing:.14em; text-transform:uppercase;
  color:var(--red); margin-bottom:.5rem;}
.week ul{margin:0; padding-left:1.05rem; font-size:.84rem; color:#cdd7ee; line-height:1.55;}

.imp{display:flex; gap:.8rem; align-items:flex-start; background:rgba(13,15,31,.45);
  border:1px solid var(--border); border-radius:14px; padding:.85rem 1rem; margin-bottom:.7rem;}
.imp-n{font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:1.3rem; color:var(--red); line-height:1;}
.imp-t{font-size:.92rem; color:#e7ecf6; line-height:1.5;}

.section-note{font-size:.78rem; color:var(--muted); font-style:italic; margin:.2rem 0 1rem;}

.report-wrap h2{border-bottom:1px solid var(--border); padding-bottom:.35rem; margin-top:1.6rem; color:var(--teal);}
.report-wrap h3{color:var(--red);}
.report-wrap strong{color:#fff;}

.foot{font-family:'Space Mono',monospace; font-size:.66rem; color:var(--faint); letter-spacing:.08em; margin-top:1.6rem;}
.disclaimer{background:rgba(234,72,98,.07); border:1px solid rgba(234,72,98,.26);
  padding:.9rem 1.1rem; border-radius:12px; font-size:.82rem; line-height:1.55; color:#c2cce0; margin-top:1.4rem;}

/* ---------- redesign polish: rendering, grain, numerals, motion, focus ---------- */
*{ -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
html{ scroll-behavior:smooth; }
/* subtle film grain on the ambient backdrop (sits behind the content card) */
.stApp::before{
  content:""; position:fixed; inset:0; z-index:0; pointer-events:none; opacity:.05;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
/* line up tabular data so digits don't jitter */
.ring-num,.ring-sub,.chip-val,.fitcard-pct,.imp-n,.metric-lbl span{ font-variant-numeric:tabular-nums; }
/* cards feel alive on hover */
.fitcard,.chip,.week,.imp,.panel{
  transition:transform .25s var(--ease), border-color .25s var(--ease), box-shadow .25s var(--ease);
}
.fitcard:hover,.chip:hover,.week:hover{ transform:translateY(-2px); border-color:#33405e; }
.stTabs [aria-selected="true"]{ background:rgba(234,72,98,.10)!important; border-bottom:2px solid var(--red)!important; }
[data-testid="stFileUploaderDropzone"]:hover{ border-color:var(--teal2); }
/* spacing rhythm — let the dashboard and wizard breathe */
.stTabs [data-baseweb="tab-panel"]{ padding-top:1.2rem; }
.dash-hero{ margin-bottom:1.5rem; }
.chiprow{ margin-top:.6rem; }
.section-note{ margin-bottom:1.1rem; }
.slide-head{ margin-bottom:1.1rem; }
@media (prefers-reduced-motion:reduce){
  *{ animation-duration:.001ms!important; transition-duration:.001ms!important; }
}
</style>
"""

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

SYSTEM_PROMPT = """You are UniPath AI, an expert, honest university admissions and \
career-readiness advisor for high school students.

You are given two things:
1. REFERENCE DATA: a vetted JSON knowledge base of majors, careers, universities,
   and the links between them.
2. STUDENT PROFILE: evidence about one student (from a resume/PDF or a questionnaire).

You apply this weighted readiness rubric:
- Academics = 40%
- Leadership = 20%
- Extracurricular Activities = 20%
- Career/Major Fit = 20%

================ REFERENCE DATA STRUCTURE (read carefully) ================
The knowledge base has these arrays. Use the EXACT field names below.

majors[]: id, name, aliases, keywords, embedding_text,
  difficulty, math_intensity, writing_intensity, lab_intensity (all 1-5),
  personality_fit (RIASEC tags: R=Realistic, I=Investigative, A=Artistic,
  S=Social, E=Enterprising, C=Conventional).

careers[]: id, name, aliases, keywords, embedding_text,
  salary_band (one of: lower_mid, mid, upper_mid, high, very_high),
  growth_outlook (one of: stable, growing, fast_growing),
  related_major_ids (majors that lead into this career).

universities[]: id, name, country_id, qs_rank, overall_score, aliases.
  NOTE: qs_rank may be a band like "451-500"; overall_score may be "-". These are
  the ONLY ranking facts you have. Do not infer subject-specific rank from them.

university_major_links[]: university_id, major_id, strength_score (0-1),
  confidence ("high" or "low").
  - confidence "high"  = the university's strength in this major is sourced from
    QS Subject Rankings. You may state this as a genuine subject strength.
  - confidence "low"   = this link is an INFERENCE from the university's type/name,
    NOT verified subject data. Treat it as "this major is plausibly offered here,"
    NOT as evidence the university is strong or ranked in it. Hedge accordingly.

major_career_links[]: major_id, career_id, strength (1-3),
  confidence ("high"=core pathway, "medium"=common, "low"=plausible/adjacent).

To connect a student to a university for a given major, look up the
university_major_links entry. Prefer "high"-confidence links when recommending a
university *for a specific major*. When you can only find a "low"-confidence link,
say the university offers the field but you cannot confirm it is a standout in it.

================ DERIVING THE 0-100 OUTPUT INDICATORS ================
Your output uses "pay_potential" and "demand" as RELATIVE 0-100 indicators. Do NOT
invent salary dollars or job counts. Derive them ONLY from the reference fields:

pay_potential (from career.salary_band):
  lower_mid -> 35 | mid -> 50 | upper_mid -> 65 | high -> 80 | very_high -> 95

demand (from career.growth_outlook):
  stable -> 45 | growing -> 70 | fast_growing -> 90

"outlook" for a career = a short phrase built from its growth_outlook and
embedding_text (e.g. "Fast-growing field; strong long-term demand"). Never add
real statistics.

STRICT RULES (follow all):
- Evaluate the student using ONLY evidence in the STUDENT PROFILE. If something is
  missing, write "Not provided"; never invent achievements, grades, or scores.
- For any factual claim about a MAJOR, CAREER, or UNIVERSITY, use the REFERENCE DATA.
  Pick majors, careers, and universities ONLY from the reference data, using their
  EXACT "name" values.
- NEVER fabricate GPA cutoffs, acceptance rates, deadlines, subject rankings, or
  dollar salaries. pay_potential and demand are derived ONLY via the tables above.
- Respect the confidence tags. Do not present a "low"-confidence university-major
  link as a proven subject strength.
- Avoid bias: judge only demonstrated evidence, never name/gender/ethnicity/background.
- Be realistic and kind. Be especially honest about university chances, and base
  reach/match/safety on the university's overall qs_rank/overall_score plus the
  student's demonstrated academics, NOT on guessed cutoffs.

OUTPUT FORMAT: return ONLY a single valid JSON object. No markdown, no code fences, no
text before or after. All scores are integers 0-100. Use EXACTLY this shape:

{
  "overall_score": 0,
  "confidence": "Low | Medium | High",
  "confidence_reason": "one or two sentences on how much evidence you had",
  "summary": "A detailed 4-6 sentence overview of where this student stands: what their overall score reflects, the 1-2 things pushing it up, the 1-2 things holding it back, how their profile compares to a competitive applicant in their intended field, and the single biggest opportunity ahead. Cite their actual evidence (grades, activities, goals). Do NOT be generic.",
  "categories": {"academics": 0, "leadership": 0, "extracurriculars": 0, "career_fit": 0},
  "category_notes": {"academics": "2-3 sentences citing the student's specific evidence for this category and exactly what would raise the score", "leadership": "2-3 sentences, specific", "extracurriculars": "2-3 sentences, specific", "career_fit": "2-3 sentences, specific"},
  "strengths": ["3-4 specific strengths, each tied to concrete evidence from the profile", "..."],
  "weaknesses": ["3-4 specific gaps, each tied to concrete evidence (or its absence) in the profile", "..."],
  "majors": [
    {"name": "exact major name from reference data", "fit": 0,
     "why": "1-2 sentences citing the student's evidence and the major's profile (e.g. math_intensity, personality_fit)"}
  ],
  "careers": [
    {"name": "exact career name from reference data", "fit": 0,
     "pay_potential": 0, "demand": 0,
     "why": "1-2 sentences tied to the student's evidence",
     "pros": ["", ""], "cons": ["", ""],
     "outlook": "short outlook derived from the career's growth_outlook + embedding_text"}
  ],
  "universities": [
    {"name": "exact university name from reference data", "tier": "Reach | Match | Safety",
     "match": 0, "verdict": "Realistic now | Reachable with work | Long shot",
     "for_major": "the major you are recommending this university for",
     "subject_evidence": "high | low | none — confidence of the university-major link used",
     "gap": "what the student would need to improve, or empty if already realistic"}
  ],
  "improvements": ["", "", ""],
  "action_plan": {"week1": ["", ""], "week2": ["", ""], "week3": ["", ""], "week4": ["", ""]},
  "sources_note": "one line: which claims came from reference data (and at what confidence) vs general guidance"
}

COUNTS (follow exactly):
- majors: 3-5, ordered best fit first. EACH major MUST include an integer "fit" (0-100)
  that genuinely reflects how well the student's evidence matches it. Vary it per major;
  never leave it blank or default it to 50.
- careers: 3-5, ordered best fit first. EACH career MUST include an integer "fit" (0-100)
  reflecting the student's evidence. Vary it per career; never leave it blank or 50.
- universities: list 4-6 relevant schools total (ALWAYS include any the student named),
  spread across selectivity from a stretch school down to a likely one. Pick from ACROSS
  the rank range in the reference data, not just famous schools.
  * Tier each school by its qs_rank/overall_score RELATIVE to the student's demonstrated
    academics: Reach = clearly above their level, Match = realistic, Safety = very likely.
  * Safety schools must be genuinely less selective — generally QS rank ~300 or higher
    (worse) — not elite universities.
  * Do NOT force the student's named target schools into different tiers. If all their
    targets are elite, list them ALL as Reach and ADD separate Match and Safety schools
    from the reference data.
  * "match" = the student's admission chance (0-100): roughly Reach below 50, Match 50-79,
    Safety 80-100. It MUST increase from Reach to Safety, so every Safety > every Match >
    every Reach.
- improvements: EXACTLY 3, highest-leverage first.
- action_plan: you MUST fill ALL FOUR weeks — week1, week2, week3 AND week4 — each with
  2-3 bullets. NEVER leave week4 (or any week) empty. Each bullet MUST be a concrete,
  specific action tailored to THIS student's gaps and goals — name the actual exam, skill,
  club, competition, university, or document involved, and where useful a measurable target
  (e.g. "Draft a personal statement for NUS Computer Science", "Raise mock SAT Math from
  680 to 720 via 3 timed sections/week"). NEVER generic filler like "study harder",
  "get involved", or "join a club". Weeks should build on one another toward the
  student's stated targets.
Output JSON only."""


@st.cache_data
def load_knowledge():
    path = Path(__file__).parent / "data" / "knowledge_final.json"
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def _relevance(words, entry):
    """How many profile words appear in an entry's name/aliases/keywords."""
    hay = " ".join([
        str(entry.get("name", "")),
        " ".join(entry.get("aliases", []) or []),
        " ".join(entry.get("keywords", []) or []),
    ]).lower()
    return sum(1 for w in words if w in hay)


def _rank_num(u):
    """Numeric QS rank for sorting; unknown/banded values sort to the bottom."""
    m = re.match(r"\d+", str(u.get("qs_rank", "")))
    return int(m.group()) if m else 10 ** 6


def compact_knowledge(knowledge, profile_text, max_majors=8, max_careers=8,
                      max_unis=12, max_uml=24):
    """Pick a SMALL, relevant slice of the knowledge base.

    The full file is ~3 MB / ~777k tokens (1,004 universities, 16,481 links) —
    dumping it all overflows the local model's context window, so it returns
    nothing and every score comes back 0. Here we select only the majors/
    careers/universities relevant to this student and prune the link tables to
    that subgraph, keeping the prompt a few thousand tokens.
    """
    if not knowledge:
        return None
    pt = (profile_text or "").lower()
    words = set(re.findall(r"[a-z]{3,}", pt))

    majors = knowledge.get("majors", []) or []
    careers = knowledge.get("careers", []) or []
    unis = knowledge.get("universities", []) or []
    uml = knowledge.get("university_major_links", []) or []
    mcl = knowledge.get("major_career_links", []) or []

    # ---- majors: most relevant to the profile ----
    sel_majors = sorted(majors, key=lambda m: _relevance(words, m), reverse=True)[:max_majors]
    sel_major_ids = {m["id"] for m in sel_majors}

    # ---- careers: linked to those majors first, then keyword matches ----
    linked_career_ids = {l["career_id"] for l in mcl if l.get("major_id") in sel_major_ids}
    sel_careers = sorted(
        careers,
        key=lambda c: (c["id"] in linked_career_ids, _relevance(words, c)),
        reverse=True,
    )[:max_careers]
    sel_career_ids = {c["id"] for c in sel_careers}

    # ---- universities: any the student named, plus a rank-spread of schools
    #      that actually offer one of the selected majors (so reach/match/safety
    #      all have candidates) ----
    uni_by_id = {u["id"]: u for u in unis}
    named, seen = [], set()
    for u in unis:
        if u["name"].lower() in pt or any(a and a.lower() in pt for a in u.get("aliases", []) or []):
            named.append(u)
            seen.add(u["id"])

    offering_ids = {l["university_id"] for l in uml if l.get("major_id") in sel_major_ids}
    pool = sorted((uni_by_id[i] for i in offering_ids if i in uni_by_id), key=_rank_num)
    slots = max(0, max_unis - len(named))
    if len(pool) > slots and slots > 0:
        step = len(pool) / slots
        pool = [pool[int(i * step)] for i in range(slots)]
    sel_unis = list(named)
    for u in pool:
        if u["id"] not in seen:
            sel_unis.append(u)
            seen.add(u["id"])
    sel_uni_ids = {u["id"] for u in sel_unis}

    # ---- prune link tables to the selected subgraph (high confidence first) ----
    sub_uml = [l for l in uml if l.get("university_id") in sel_uni_ids
               and l.get("major_id") in sel_major_ids]
    sub_uml.sort(key=lambda l: l.get("confidence") == "high", reverse=True)
    sub_uml = sub_uml[:max_uml]
    sub_mcl = [l for l in mcl if l.get("major_id") in sel_major_ids
               and l.get("career_id") in sel_career_ids]

    # ---- slim entries (drop the heavy embedding_text / keyword blobs) ----
    def slim_major(m):
        return {k: m[k] for k in ("id", "name", "difficulty", "math_intensity",
                "writing_intensity", "lab_intensity", "personality_fit") if k in m}

    def slim_career(c):
        out = {k: c[k] for k in ("id", "name", "salary_band", "growth_outlook",
               "related_major_ids") if k in c}
        out["summary"] = str(c.get("embedding_text", ""))[:200]
        return out

    def slim_uni(u):
        return {k: u[k] for k in ("id", "name", "country_id", "qs_rank", "overall_score") if k in u}

    return {
        "majors": [slim_major(m) for m in sel_majors],
        "careers": [slim_career(c) for c in sel_careers],
        "universities": [slim_uni(u) for u in sel_unis],
        "university_major_links": sub_uml,
        "major_career_links": sub_mcl,
    }


def get_client():
    # Local Ollama via its OpenAI-compatible endpoint. No real key needed —
    # Ollama ignores the api_key, but the SDK requires a non-empty string.
    base_url = os.getenv("OPENAI_BASE_URL", "http://localhost:11434/v1")
    api_key = os.getenv("OPENAI_API_KEY", "ollama")
    return OpenAI(api_key=api_key, base_url=base_url)


def extract_text_from_pdf(uploaded_file):
    text_parts = []
    with pdfplumber.open(uploaded_file) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts).strip()


def build_profile_from_form(fields):
    """Turn questionnaire answers into a profile text block the model can read."""
    lines = []
    for label, value in fields:
        value = (value or "").strip() if isinstance(value, str) else value
        if value:
            lines.append(f"{label}: {value}")
    return "\n".join(lines).strip()


def analyze_profile(client, profile_text, knowledge):
    # Send only a small, relevant slice — the full knowledge base overflows the
    # local model's context window and makes it return empty results.
    compact = compact_knowledge(knowledge, profile_text)
    reference = json.dumps(compact, ensure_ascii=False) if compact else "{}"
    user_content = (
        "=== REFERENCE DATA (use for facts about majors/careers/universities) ===\n"
        f"{reference}\n"
        "=== END REFERENCE DATA ===\n\n"
        "=== STUDENT PROFILE (evaluate using only this) ===\n"
        f"{profile_text}\n"
        "=== END STUDENT PROFILE ===\n\n"
        "Produce the readiness analysis as a single JSON object in the required schema."
    )
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]
    model = os.getenv("OLLAMA_MODEL", "unipath-cpu")
    # Ask for JSON mode when supported; fall back gracefully if the endpoint rejects it.
    # max_tokens caps generation so a rambling model can't run for many minutes.
    try:
        response = client.chat.completions.create(
            model=model, temperature=0.2, messages=messages, max_tokens=2800,
            response_format={"type": "json_object"},
        )
    except Exception:
        response = client.chat.completions.create(
            model=model, temperature=0.2, messages=messages, max_tokens=2800,
        )
    return response.choices[0].message.content


# ------------------------------------------------------------- parsing helpers
def clamp(v, lo=0, hi=100, default=0):
    try:
        n = int(round(float(v)))
    except Exception:
        return default
    return max(lo, min(hi, n))


def strlist(v):
    if isinstance(v, list):
        return [str(x).strip() for x in v if str(x).strip()]
    if isinstance(v, str) and v.strip():
        return [v.strip()]
    return []


def parse_analysis(text):
    """Pull a JSON object out of the model's reply, tolerating fences/extra text."""
    if not text:
        return None
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*", "", t).strip()
        if t.endswith("```"):
            t = t[:-3].strip()
    i, j = t.find("{"), t.rfind("}")
    if i != -1 and j != -1 and j > i:
        t = t[i:j + 1]
    try:
        return json.loads(t)
    except Exception:
        return None


def normalize(d):
    """Coerce the raw parsed dict into a safe, fully-defaulted structure."""
    if not isinstance(d, dict):
        return None
    cats = d.get("categories") or {}
    notes = d.get("category_notes") or {}
    keys = ("academics", "leadership", "extracurriculars", "career_fit")
    categories = {k: clamp(cats.get(k)) for k in keys}
    category_notes = {k: str(notes.get(k, "") or "") for k in keys}

    overall = clamp(d.get("overall_score"))
    if overall == 0:  # model omitted it — compute the weighted rubric ourselves
        overall = clamp(
            0.40 * categories["academics"] + 0.20 * categories["leadership"]
            + 0.20 * categories["extracurriculars"] + 0.20 * categories["career_fit"]
        )

    # If the model omits "fit", fall back to a profile-grounded estimate from the
    # category scores instead of a flat, misleading 50.
    maj_fit_default = clamp(round(0.6 * categories["academics"] + 0.4 * categories["career_fit"]))
    car_fit_default = clamp(round(0.5 * categories["career_fit"] + 0.5 * categories["academics"]))

    majors = []
    for m in (d.get("majors") or []):
        if isinstance(m, dict) and m.get("name"):
            majors.append({
                "name": str(m["name"]).strip(),
                "fit": clamp(m.get("fit"), default=maj_fit_default),
                "why": str(m.get("why", "") or "").strip(),
            })

    careers = []
    for c in (d.get("careers") or []):
        if isinstance(c, dict) and c.get("name"):
            careers.append({
                "name": str(c["name"]).strip(),
                "fit": clamp(c.get("fit"), default=car_fit_default),
                "pay_potential": clamp(c.get("pay_potential"), default=50),
                "demand": clamp(c.get("demand"), default=50),
                "why": str(c.get("why", "") or "").strip(),
                "pros": strlist(c.get("pros")),
                "cons": strlist(c.get("cons")),
                "outlook": str(c.get("outlook", "") or "").strip(),
            })

    unis = []
    for u in (d.get("universities") or []):
        if isinstance(u, dict) and u.get("name"):
            tier = str(u.get("tier", "Match") or "Match").strip().title()
            if tier not in ("Reach", "Match", "Safety"):
                tier = "Match"
            unis.append({
                "name": str(u["name"]).strip(),
                "tier": tier,
                "match": clamp(u.get("match"), default=50),
                "verdict": str(u.get("verdict", "") or "").strip(),
                "gap": str(u.get("gap", "") or "").strip(),
            })

    ap = d.get("action_plan") or {}
    action_plan = {wk: strlist(ap.get(wk)) for wk in ("week1", "week2", "week3", "week4")}

    return {
        "overall_score": overall,
        "confidence": str(d.get("confidence", "Medium") or "Medium").strip().title(),
        "confidence_reason": str(d.get("confidence_reason", "") or "").strip(),
        "summary": str(d.get("summary", "") or "").strip(),
        "categories": categories,
        "category_notes": category_notes,
        "strengths": strlist(d.get("strengths")),
        "weaknesses": strlist(d.get("weaknesses")),
        "majors": majors,
        "careers": careers,
        "universities": unis,
        "improvements": strlist(d.get("improvements")),
        "action_plan": action_plan,
        "sources_note": str(d.get("sources_note", "") or "").strip(),
    }


def build_rank_index(knowledge):
    """Map university name/alias (lowercased) -> numeric QS rank."""
    idx = {}
    for u in (knowledge or {}).get("universities", []) or []:
        r = _rank_num(u)
        idx[u["name"].strip().lower()] = r
        for a in u.get("aliases", []) or []:
            if a:
                idx[a.strip().lower()] = r
    return idx


def _selectivity(rank):
    """0-100 'how hard to get in', from QS rank (1 = hardest). Unknown -> low
    selectivity (unranked schools are treated as accessible safeties)."""
    if rank >= 10 ** 6:
        return 18
    for cutoff, val in ((10, 97), (30, 88), (60, 78), (100, 68), (150, 58),
                        (250, 45), (400, 32), (600, 22)):
        if rank <= cutoff:
            return val
    return 14


_VERDICTS = {
    "Reach": "Long shot — aim high",
    "Match": "Realistic with steady work",
    "Safety": "Very likely — a solid floor",
}


def _uni_pool_for_major(knowledge, major_name):
    """Universities offering a given major (by name), sorted best-rank first."""
    majors = {m["name"].strip().lower(): m["id"] for m in (knowledge or {}).get("majors", []) or []}
    uni_by_id = {u["id"]: u for u in (knowledge or {}).get("universities", []) or []}
    mid = majors.get((major_name or "").strip().lower())
    if mid:
        ids = [l["university_id"] for l in knowledge.get("university_major_links", []) or []
               if l.get("major_id") == mid]
        pool = [uni_by_id[i] for i in ids if i in uni_by_id]
    else:
        pool = list(uni_by_id.values())
    return sorted(pool, key=_rank_num)


def finalize_universities(d, knowledge, per_tier=3, min_per_tier=2):
    """Re-tier every university deterministically from its real QS rank vs. the
    student's strength, then backfill from the full dataset so Reach/Match/Safety
    each have real options. Guarantees Safety chance > Match > Reach and stops an
    elite school (e.g. CMU) from being mislabeled a 'safety'.
    """
    if not d or not knowledge:
        return
    idx = build_rank_index(knowledge)
    # student strength: mostly academics, tempered by the overall score
    strength = round(0.65 * d["categories"]["academics"] + 0.35 * d["overall_score"])

    def classify(rank):
        # match% = admission chance. Tiers: Reach < 50, Match 50-79, Safety >= 80
        # (under 50% means rejection is the more likely outcome → a reach).
        m = clamp(strength - _selectivity(rank) + 52)
        tier = "Reach" if m < 50 else ("Match" if m < 80 else "Safety")
        return tier, m

    primary_major = d["majors"][0]["name"] if d.get("majors") else None
    buckets = {"Reach": [], "Match": [], "Safety": []}
    used = set()

    # 1) place the model's own picks (validated against the knowledge base)
    for u in d.get("universities", []):
        key = u["name"].strip().lower()
        if key in used:
            continue
        tier, m = classify(idx.get(key, 10 ** 6))
        u["tier"], u["match"], u["verdict"] = tier, m, _VERDICTS[tier]
        if not u.get("for_major") and primary_major:
            u["for_major"] = primary_major
        buckets[tier].append(u)
        used.add(key)

    # 2) backfill from the student's primary-major pool so each tier has options
    for cand in _uni_pool_for_major(knowledge, primary_major):
        if all(len(buckets[t]) >= min_per_tier for t in buckets):
            break
        key = cand["name"].strip().lower()
        if key in used:
            continue
        tier, m = classify(_rank_num(cand))
        if len(buckets[tier]) >= per_tier:
            continue
        buckets[tier].append({
            "name": cand["name"], "tier": tier, "match": m,
            "verdict": _VERDICTS[tier], "for_major": primary_major or "", "gap": "",
        })
        used.add(key)

    # 3) flatten Reach -> Match -> Safety, best chance first within each tier
    final = []
    for tier in ("Reach", "Match", "Safety"):
        final += sorted(buckets[tier], key=lambda x: x["match"], reverse=True)[:per_tier]
    d["universities"] = final


def profile_completeness(text):
    """Deterministic 0-100 score for how much the student told us (9 signal groups)."""
    t = (text or "").lower()
    groups = [
        ["gpa", "average", "grade", "%", "/4", "/5"],
        ["sat", "act", "ielts", "toefl", "ap ", "ib ", "a-level", "test"],
        ["math", "physics", "chemistry", "biology", "english", "subject", "strong"],
        ["major", "interest", "computer", "engineer", "business", "science", "intend"],
        ["club", "volunteer", "sport", "leader", "president", "captain", "team"],
        ["intern", "project", "work", "research", "experience", "job"],
        ["award", "prize", "won", "medal", "competition", "olympiad", "honor"],
        ["university", "college", "target", "mit", "nus", "toronto", "stanford", "waterloo"],
        ["country", "region", "city", "malaysia", "singapore", "canada", "usa", "india"],
    ]
    hits = sum(1 for kws in groups if any(k in t for k in kws))
    return round(hits / len(groups) * 100)


# --------------------------------------------------------------- view helpers
def notify_analysis_done():
    """Fire a desktop/browser notification + a soft chime when analysis finishes,
    so the user can step away during the slow CPU run and get pinged when ready."""
    components.html(
        """
        <script>
        (function(){
          try {
            const title = "UniPath AI — analysis complete";
            const body  = "Your readiness report is ready to view.";
            const fire = () => { try { new Notification(title, {body: body}); } catch(e){} };
            if ("Notification" in window) {
              if (Notification.permission === "granted") { fire(); }
              else if (Notification.permission !== "denied") {
                Notification.requestPermission().then(p => { if (p === "granted") fire(); });
              }
            }
            // gentle two-note chime
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (Ctx) {
              const ctx = new Ctx();
              [[880, 0], [1320, 0.18]].forEach(([f, t]) => {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.connect(g); g.connect(ctx.destination);
                o.type = "sine"; o.frequency.value = f;
                const s = ctx.currentTime + t;
                g.gain.setValueAtTime(0.0001, s);
                g.gain.exponentialRampToValueAtTime(0.18, s + 0.04);
                g.gain.exponentialRampToValueAtTime(0.0001, s + 0.5);
                o.start(s); o.stop(s + 0.5);
              });
            }
          } catch(e){}
        })();
        </script>
        """,
        height=0,
    )


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


def score_color(s):
    if s >= 75:
        return "#2fa18f"
    if s >= 55:
        return "#e6b84e"
    if s >= 40:
        return "#e69a48"
    return "#ea4862"


def render_ring(score, size=180, label="Readiness"):
    c = score_color(score)
    return (
        f'<div class="ring" style="--p:{score};--c:{c};width:{size}px;height:{size}px">'
        f'<div class="ring-hole">'
        f'<span class="ring-num" style="color:{c}">{score}</span>'
        f'<span class="ring-sub">/ 100</span>'
        f'<span class="ring-cap">{esc(label)}</span>'
        f'</div></div>'
    )


def render_bar(pct, color=None):
    pct = clamp(pct)
    color = color or score_color(pct)
    return f'<div class="bar"><div class="bar-fill" style="width:{pct}%;background:{color}"></div></div>'


def render_radar(cats):
    order = [
        ("Academics", cats["academics"]),
        ("Leadership", cats["leadership"]),
        ("Activities", cats["extracurriculars"]),
        ("Career Fit", cats["career_fit"]),
    ]
    cx = cy = 124
    R = 88
    angles = [-math.pi / 2, 0, math.pi / 2, math.pi]  # top, right, bottom, left

    grid = ""
    for lvl in (0.25, 0.5, 0.75, 1.0):
        pts = " ".join(
            f"{cx + R * lvl * math.cos(a):.1f},{cy + R * lvl * math.sin(a):.1f}" for a in angles
        )
        grid += f'<polygon points="{pts}" fill="none" stroke="rgba(159,216,214,.15)" stroke-width="1"/>'

    axes = "".join(
        f'<line x1="{cx}" y1="{cy}" x2="{cx + R * math.cos(a):.1f}" y2="{cy + R * math.sin(a):.1f}" '
        f'stroke="rgba(159,216,214,.13)" stroke-width="1"/>'
        for a in angles
    )

    dpts, dots, labels = [], "", ""
    for (name, val), a in zip(order, angles):
        v = clamp(val)
        r = R * v / 100
        px, py = cx + r * math.cos(a), cy + r * math.sin(a)
        dpts.append(f"{px:.1f},{py:.1f}")
        dots += f'<circle cx="{px:.1f}" cy="{py:.1f}" r="3.6" fill="#9fd8d6"/>'
        lx, ly = cx + (R + 16) * math.cos(a), cy + (R + 16) * math.sin(a)
        if abs(math.cos(a)) > 0.5:
            anchor = "start" if math.cos(a) > 0 else "end"
        else:
            anchor = "middle"
        labels += (
            f'<text x="{lx:.1f}" y="{ly:.1f}" fill="#97a3c0" font-size="10.5" '
            f'font-family="Space Mono,monospace" text-anchor="{anchor}" '
            f'dominant-baseline="middle">{name} {v}</text>'
        )
    data_poly = (
        f'<polygon points="{" ".join(dpts)}" fill="rgba(234,72,98,.20)" '
        f'stroke="#ea4862" stroke-width="2"/>'
    )
    return (
        '<svg viewBox="0 0 248 248" width="240" height="240" class="radar">'
        f'{grid}{axes}{data_poly}{dots}{labels}</svg>'
    )


def fitcard(name, fit, why, meta=""):
    c = score_color(fit)
    meta_html = f'<div class="fitcard-meta">{esc(meta)}</div>' if meta else ""
    why_html = f'<p class="fitcard-why">{esc(why)}</p>' if why else ""
    return (
        '<div class="fitcard">'
        '<div class="fitcard-top">'
        f'<span class="fitcard-name">{esc(name)}</span>'
        f'<span class="fitcard-pct" style="color:{c}">{fit}%</span>'
        '</div>'
        f'{render_bar(fit)}{why_html}{meta_html}'
        '</div>'
    )


# -------------------------------------------------------------- report exports
def build_markdown(d, completeness):
    L = []
    L.append("# UniPath AI Readiness Report\n")
    L.append(f"**Overall readiness:** {d['overall_score']}/100  ")
    L.append(f"**Confidence:** {d['confidence']}. {d['confidence_reason']}  ")
    L.append(f"**Profile completeness:** {completeness}%\n")

    if d["summary"]:
        L.append("## Overview\n")
        L.append(d["summary"])
        L.append("")

    L.append("## Category Scores\n")
    names = {"academics": "Academics", "leadership": "Leadership",
             "extracurriculars": "Extracurriculars", "career_fit": "Career Fit"}
    for k, label in names.items():
        note = d["category_notes"].get(k, "")
        L.append(f"- **{label}: {d['categories'][k]}/100**. {note}")
    L.append("")

    if d["strengths"]:
        L.append("## Strengths\n")
        L += [f"- {s}" for s in d["strengths"]]
        L.append("")
    if d["weaknesses"]:
        L.append("## Weaknesses\n")
        L += [f"- {s}" for s in d["weaknesses"]]
        L.append("")

    if d["majors"]:
        L.append("## Recommended Majors\n")
        for m in d["majors"]:
            L.append(f"**{m['name']}** (fit {m['fit']}%)")
            if m["why"]:
                L.append(f"{m['why']}")
            L.append("")

    if d["careers"]:
        L.append("## Career Paths to Consider\n")
        for c in d["careers"]:
            L.append(f"**{c['name']}** (fit {c['fit']}%)")
            if c["why"]:
                L.append(c["why"])
            if c["pros"]:
                L.append(f"- Pros: {'; '.join(c['pros'])}")
            if c["cons"]:
                L.append(f"- Cons / tradeoffs: {'; '.join(c['cons'])}")
            if c["outlook"]:
                L.append(f"- Outlook: {c['outlook']}")
            L.append(f"- Relative pay potential: {c['pay_potential']}/100 · Relative demand: {c['demand']}/100")
            L.append("")

    if d["universities"]:
        L.append("## Target Universities\n")
        for tier in ("Reach", "Match", "Safety"):
            row = [u for u in d["universities"] if u["tier"] == tier]
            if not row:
                continue
            L.append(f"### {tier}\n")
            for u in row:
                L.append(f"**{u['name']}** (match {u['match']}%) · {u['verdict']}")
                if u["gap"]:
                    L.append(f"Gap: {u['gap']}")
                L.append("")

    if d["improvements"]:
        L.append("## Top 3 Improvement Areas\n")
        L += [f"{i}. {s}" for i, s in enumerate(d["improvements"], 1)]
        L.append("")

    L.append("## Personalized 30-Day Action Plan\n")
    for i, wk in enumerate(("week1", "week2", "week3", "week4"), 1):
        items = d["action_plan"].get(wk) or []
        if items:
            L.append(f"**Week {i}:**")
            L += [f"- {s}" for s in items]
            L.append("")

    if d["sources_note"]:
        L.append("## Sources & Limitations\n")
        L.append(d["sources_note"])
        L.append("")

    L.append("## Disclaimer\n")
    L.append("This is a readiness estimate, not an admission prediction. Pay-potential and "
             "demand figures are relative qualitative indicators, not real salaries. Always "
             "verify university requirements with official sources.")
    return "\n".join(L)


def _pdf_clean(s):
    repl = {"–": "-", "—": "-", "•": "-", "’": "'", "‘": "'", "“": '"', "”": '"', "…": "..."}
    for a, b in repl.items():
        s = s.replace(a, b)
    return s.encode("latin-1", "replace").decode("latin-1")


def build_pdf(d, completeness):
    if not HAVE_PDF:
        return None
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # new_x=LMARGIN/new_y=NEXT keeps each block on its own left-aligned line —
    # without it multi_cell parks the cursor at the right edge and the next
    # call fails with "Not enough horizontal space".
    def line(t, h=6):
        pdf.multi_cell(0, h, _pdf_clean(t), new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    def h1(t):
        pdf.set_font("Helvetica", "B", 18)
        pdf.set_text_color(20, 20, 20)
        line(t, 9)
        pdf.ln(1)

    def h2(t):
        pdf.ln(2)
        pdf.set_font("Helvetica", "B", 13)
        pdf.set_text_color(40, 40, 40)
        line(t, 7)

    def body(t, bold=False):
        pdf.set_font("Helvetica", "B" if bold else "", 11)
        pdf.set_text_color(30, 30, 30)
        line(t)

    def bullet(t):
        pdf.set_font("Helvetica", "", 11)
        pdf.set_text_color(30, 30, 30)
        line("- " + t)

    h1("UniPath AI - Readiness Report")
    body(f"Overall readiness: {d['overall_score']}/100", bold=True)
    body(f"Confidence: {d['confidence']} - {d['confidence_reason']}")
    body(f"Profile completeness: {completeness}%")

    if d["summary"]:
        h2("Overview")
        body(d["summary"])

    h2("Category Scores")
    names = {"academics": "Academics", "leadership": "Leadership",
             "extracurriculars": "Extracurriculars", "career_fit": "Career Fit"}
    for k, label in names.items():
        bullet(f"{label}: {d['categories'][k]}/100 - {d['category_notes'].get(k, '')}")

    if d["strengths"]:
        h2("Strengths")
        for s in d["strengths"]:
            bullet(s)
    if d["weaknesses"]:
        h2("Weaknesses")
        for s in d["weaknesses"]:
            bullet(s)

    if d["majors"]:
        h2("Recommended Majors")
        for m in d["majors"]:
            body(f"{m['name']} - fit {m['fit']}%", bold=True)
            if m["why"]:
                body(m["why"])

    if d["careers"]:
        h2("Career Paths to Consider")
        for c in d["careers"]:
            body(f"{c['name']} - fit {c['fit']}%", bold=True)
            if c["why"]:
                body(c["why"])
            if c["pros"]:
                bullet("Pros: " + "; ".join(c["pros"]))
            if c["cons"]:
                bullet("Cons / tradeoffs: " + "; ".join(c["cons"]))
            if c["outlook"]:
                bullet("Outlook: " + c["outlook"])
            bullet(f"Relative pay potential: {c['pay_potential']}/100 - Relative demand: {c['demand']}/100")

    if d["universities"]:
        h2("Target Universities")
        for tier in ("Reach", "Match", "Safety"):
            row = [u for u in d["universities"] if u["tier"] == tier]
            if not row:
                continue
            body(tier, bold=True)
            for u in row:
                bullet(f"{u['name']} - match {u['match']}% - {u['verdict']}")
                if u["gap"]:
                    body("   Gap: " + u["gap"])

    if d["improvements"]:
        h2("Top 3 Improvement Areas")
        for i, s in enumerate(d["improvements"], 1):
            bullet(f"{i}. {s}")

    h2("30-Day Action Plan")
    for i, wk in enumerate(("week1", "week2", "week3", "week4"), 1):
        items = d["action_plan"].get(wk) or []
        if items:
            body(f"Week {i}:", bold=True)
            for s in items:
                bullet(s)

    if d["sources_note"]:
        h2("Sources & Limitations")
        body(d["sources_note"])

    h2("Disclaimer")
    body("This is a readiness estimate, not an admission prediction. Pay-potential and demand "
         "figures are relative qualitative indicators, not real salaries. Always verify "
         "university requirements with official sources.")

    out = pdf.output(dest="S")
    return bytes(out) if isinstance(out, (bytes, bytearray)) else out.encode("latin-1")


# ---------------------------------------------------------------- wizard state
STEPS = ["Start", "Profile", "Analyze", "Dashboard"]
st.session_state.setdefault("step", 0)
st.session_state.setdefault("profile_text", "")
st.session_state.setdefault("data", None)
st.session_state.setdefault("raw", None)
st.session_state.setdefault("notify", False)


def goto(n):
    st.session_state.step = n
    st.rerun()


def render_rail(step):
    html = ['<div class="rail">']
    for i, label in enumerate(STEPS):
        state = "done" if i < step else ("active" if i == step else "todo")
        mark = "✓" if i < step else f"{i + 1:02d}"
        html.append(
            f'<div class="node {state}"><div class="dot">{mark}</div>'
            f'<div class="lbl">{label}</div></div>'
        )
        if i < len(STEPS) - 1:
            html.append(f'<div class="seg {"fill" if i < step else ""}"></div>')
    html.append("</div>")
    return "".join(html)


client = get_client()
knowledge = load_knowledge()
step = st.session_state.step

st.markdown(render_rail(step), unsafe_allow_html=True)

# ----------------------------------------------------------------- slide 0
if step == 0:
    st.markdown('<div class="eyebrow">Charting your path to university</div>', unsafe_allow_html=True)
    st.markdown('<div class="hero-title">UniPath&nbsp;<span>AI</span></div>', unsafe_allow_html=True)
    st.markdown(
        '<p class="lede">Turn university confusion into a clear, honest plan. We map your '
        "grades, activities, and goals to fitting majors, realistic career paths, and target "
        "schools, sorted into reach, match, and safety.</p>",
        unsafe_allow_html=True,
    )
    st.markdown(
        '<span class="badge">🔒 Runs 100% on your computer. Nothing is uploaded.</span>',
        unsafe_allow_html=True,
    )
    st.write("")
    c1, c2 = st.columns([1, 3])
    with c1:
        if st.button("Begin  →", type="primary", use_container_width=True):
            goto(1)

# ----------------------------------------------------------------- slide 1
elif step == 1:
    st.markdown('<div class="slide-kicker">Step 02 · Your profile</div>', unsafe_allow_html=True)
    st.markdown('<div class="slide-head">Tell us about yourself</div>', unsafe_allow_html=True)

    mode = st.radio(
        "How would you like to share your profile?",
        ["📄 Upload a PDF (resume / transcript / portfolio)", "📝 Fill out a questionnaire"],
        horizontal=True,
        key="input_mode",
    )

    profile_text = ""
    if mode.startswith("📄"):
        st.caption("Upload a text-based PDF (not a scanned image).")
        uploaded = st.file_uploader("Choose a PDF file", type=["pdf"], key="pdf")
        if uploaded is not None:
            try:
                profile_text = extract_text_from_pdf(uploaded)
            except Exception:
                st.error("We couldn't read this file. Make sure it's a valid PDF and try again.")
            if not profile_text:
                st.warning("No readable text found. This may be a scanned image, so try a text-based PDF.")
            else:
                with st.expander("View extracted text"):
                    st.text_area("Extracted text", profile_text, height=220, key="pdf_preview")
    else:
        with st.form("questionnaire"):
            st.caption("Fill in what you can, leave the rest blank.")
            a, b = st.columns(2)
            with a:
                grade = st.text_input("Current grade / year", placeholder="e.g. Grade 11", key="q_grade")
                gpa = st.text_input("GPA / average (with scale)", placeholder="e.g. 3.8/4.0 or 92%", key="q_gpa")
                tests = st.text_input("Test scores (optional)", placeholder="e.g. SAT 1450, IELTS 7.5", key="q_tests")
                country = st.text_input("Country / region", placeholder="e.g. Malaysia", key="q_country")
            with b:
                interests = st.text_input("Intended major / interests", placeholder="e.g. Computer Science, AI", key="q_interests")
                subjects = st.text_input("Strongest subjects", placeholder="e.g. Math, Physics", key="q_subjects")
                targets = st.text_input("Target universities (up to 3)", placeholder="e.g. NUS, U of Toronto, MIT", key="q_targets")
            activities = st.text_area("Extracurriculars & leadership", placeholder="Clubs, roles, sports, volunteering...", height=80, key="q_activities")
            experience = st.text_area("Work, projects & awards", placeholder="Internships, projects, competitions, awards...", height=80, key="q_experience")
            st.form_submit_button("Save my answers")

        profile_text = build_profile_from_form([
            ("Current grade/year", st.session_state.get("q_grade")),
            ("GPA/average", st.session_state.get("q_gpa")),
            ("Test scores", st.session_state.get("q_tests")),
            ("Country/region", st.session_state.get("q_country")),
            ("Intended major / interests", st.session_state.get("q_interests")),
            ("Strongest subjects", st.session_state.get("q_subjects")),
            ("Target universities", st.session_state.get("q_targets")),
            ("Extracurriculars & leadership", st.session_state.get("q_activities")),
            ("Work, projects & awards", st.session_state.get("q_experience")),
        ])

    st.session_state.profile_text = profile_text

    st.write("")
    back, _, nxt = st.columns([1, 2, 1])
    with back:
        if st.button("←  Back", use_container_width=True):
            goto(0)
    with nxt:
        if st.button("Continue  →", type="primary", use_container_width=True, disabled=not profile_text):
            goto(2)
    if not profile_text:
        st.caption("Add a PDF or fill in a few fields to continue.")

# ----------------------------------------------------------------- slide 2
elif step == 2:
    st.markdown('<div class="slide-kicker">Step 03 · Ready to analyze</div>', unsafe_allow_html=True)
    st.markdown('<div class="slide-head">Here\'s what we\'ll do</div>', unsafe_allow_html=True)
    st.markdown(
        "We'll score your profile on a **40 / 20 / 20 / 20** rubric (Academics · Leadership · "
        "Extracurriculars · Career fit), then build an interactive dashboard of **majors**, "
        "**career paths**, and **target universities** sorted into reach / match / safety, "
        "grounded in vetted data, with no made-up statistics."
    )
    st.markdown("**Your profile so far:**")
    recap = st.session_state.profile_text or "Nothing captured yet."
    st.markdown(f'<div class="recap">{esc(recap)}</div>', unsafe_allow_html=True)
    st.write("")

    back, _, run = st.columns([1, 2, 1.3])
    with back:
        if st.button("←  Edit profile", use_container_width=True):
            goto(1)
    with run:
        go = st.button("🧭  Analyze my profile", type="primary", use_container_width=True)

    if go:
        stages = [
            "📄 Reading your profile…",
            "📊 Scoring academics, leadership & activities…",
            "🎓 Matching majors & career paths…",
        ]
        after = [
            "🏫 Ranking target universities…",
            "🗺️ Drafting your 30-day roadmap…",
        ]
        try:
            with st.status("🧭 Analyzing your profile…", expanded=True) as status:
                for s in stages:
                    st.write(s)
                    time.sleep(0.45)
                raw = analyze_profile(client, st.session_state.profile_text, knowledge)
                for s in after:
                    st.write(s)
                    time.sleep(0.4)
                st.session_state.raw = raw
                data = normalize(parse_analysis(raw))
                if data:
                    finalize_universities(data, knowledge)
                st.session_state.data = data
                status.update(label="✅ Analysis complete. Building your dashboard…", state="complete")
            st.session_state.notify = True
            time.sleep(0.3)
            goto(3)
        except Exception as exc:
            using_url = os.getenv("OPENAI_BASE_URL", "http://localhost:11434/v1")
            using_model = os.getenv("OLLAMA_MODEL", "unipath-cpu")
            st.error(
                "The AI analysis failed.\n\n"
                f"- Connecting to: `{using_url}`\n"
                f"- Model: `{using_model}`\n\n"
                f"Error: {exc}\n\n"
                "Make sure Ollama is running and the model exists (`ollama list`)."
            )
    st.caption("First analysis on CPU can take 1-3 minutes. The model is reasoning locally.")

# ----------------------------------------------------------------- slide 3
elif step == 3:
    d = st.session_state.data
    st.markdown('<div class="slide-kicker">Step 04 · Your readiness dashboard</div>', unsafe_allow_html=True)

    if st.session_state.get("notify"):
        st.session_state.notify = False
        st.toast("✅ Analysis complete — your dashboard is ready!", icon="🧭")
        notify_analysis_done()

    if not d:
        st.warning("We couldn't read a clean result from the model. Here's the raw output:")
        if st.session_state.raw:
            st.markdown('<div class="report-wrap">', unsafe_allow_html=True)
            st.markdown(st.session_state.raw)
            st.markdown("</div>", unsafe_allow_html=True)
        b1, _, b2 = st.columns([1, 2, 1])
        with b1:
            if st.button("←  Back"):
                goto(2)
        with b2:
            if st.button("Try again"):
                st.session_state.data = None
                st.session_state.raw = None
                goto(2)
    else:
        completeness = profile_completeness(st.session_state.profile_text)
        conf = d["confidence"].lower()
        conf_cls = "high" if conf == "high" else ("low" if conf == "low" else "medium")

        # ---- hero: score ring + radar ----
        h1c, h2c = st.columns([1, 1])
        with h1c:
            st.markdown(
                '<div class="dash-hero">'
                + render_ring(d["overall_score"])
                + '<div class="hero-meta">'
                + f'<span class="conf {conf_cls}">Confidence: {esc(d["confidence"])}</span>'
                + (f'<span class="conf-reason">{esc(d["confidence_reason"])}</span>' if d["confidence_reason"] else "")
                + '</div></div>',
                unsafe_allow_html=True,
            )
        with h2c:
            st.markdown(
                render_radar(d["categories"]) + '<div class="radar-cap">Readiness across the rubric</div>',
                unsafe_allow_html=True,
            )

        # ---- category chips ----
        names = {"academics": "Academics", "leadership": "Leadership",
                 "extracurriculars": "Extracurriculars", "career_fit": "Career Fit"}
        chips = ['<div class="chiprow">']
        for k, label in names.items():
            v = d["categories"][k]
            note = d["category_notes"].get(k, "")
            chips.append(
                '<div class="chip"><div class="chip-top">'
                f'<span class="chip-name">{label}</span>'
                f'<span class="chip-val" style="color:{score_color(v)}">{v}</span></div>'
                f'{render_bar(v)}'
                + (f'<div class="chip-note">{esc(note)}</div>' if note else "")
                + '</div>'
            )
        chips.append('</div>')
        st.markdown("".join(chips), unsafe_allow_html=True)

        # completeness bar
        st.markdown(
            '<div class="metricrow"><div class="metric">'
            '<div class="metric-lbl"><span>Profile completeness</span>'
            f'<span style="color:{score_color(completeness)}">{completeness}%</span></div>'
            f'{render_bar(completeness, "#9fd8d6")}</div></div>',
            unsafe_allow_html=True,
        )
        if completeness < 70:
            st.caption("Tip: a fuller profile (test scores, awards, target schools) sharpens every score below.")

        st.write("")

        # ---- explorable sections ----
        t_over, t_maj, t_car, t_uni, t_road = st.tabs(
            ["📋 Overview", "🎓 Majors", "💼 Careers", "🏫 Universities", "🗺️ Roadmap"]
        )

        with t_over:
            if d["summary"]:
                st.markdown(
                    '<div class="panel summary"><h4>🧭 The big picture</h4>'
                    f'<p class="summary-text">{esc(d["summary"])}</p></div>',
                    unsafe_allow_html=True,
                )
            cols = []
            if d["strengths"]:
                cols.append(
                    '<div class="panel str"><h4>✅ Strengths</h4><ul>'
                    + "".join(f"<li>{esc(s)}</li>" for s in d["strengths"])
                    + '</ul></div>'
                )
            if d["weaknesses"]:
                cols.append(
                    '<div class="panel weak"><h4>⚠️ Watch-outs</h4><ul>'
                    + "".join(f"<li>{esc(s)}</li>" for s in d["weaknesses"])
                    + '</ul></div>'
                )
            if cols:
                st.markdown('<div class="two-col">' + "".join(cols) + '</div>', unsafe_allow_html=True)
            if d["sources_note"]:
                st.markdown(f'<div class="section-note">Sources: {esc(d["sources_note"])}</div>', unsafe_allow_html=True)

        with t_maj:
            if d["majors"]:
                st.markdown('<div class="section-note">How well each major fits your demonstrated evidence.</div>', unsafe_allow_html=True)
                for m in d["majors"]:
                    st.markdown(fitcard(m["name"], m["fit"], m["why"]), unsafe_allow_html=True)
            else:
                st.info("No major recommendations were returned.")

        with t_car:
            if d["careers"]:
                st.markdown(
                    '<div class="section-note">Fit, plus <b>relative</b> pay-potential and demand '
                    '(qualitative 0-100 indicators, not real salaries).</div>',
                    unsafe_allow_html=True,
                )
                for c in d["careers"]:
                    parts = [
                        '<div class="fitcard">',
                        '<div class="fitcard-top">',
                        f'<span class="fitcard-name">{esc(c["name"])}</span>',
                        f'<span class="fitcard-pct" style="color:{score_color(c["fit"])}">{c["fit"]}% fit</span>',
                        '</div>',
                        render_bar(c["fit"]),
                    ]
                    if c["why"]:
                        parts.append(f'<p class="fitcard-why">{esc(c["why"])}</p>')
                    # relative pay-potential + demand
                    parts.append('<div class="metricrow">')
                    parts.append(
                        '<div class="metric"><div class="metric-lbl"><span>Pay potential (relative)</span>'
                        f'<span style="color:{score_color(c["pay_potential"])}">{c["pay_potential"]}</span></div>'
                        f'{render_bar(c["pay_potential"], "#e6b84e")}</div>'
                    )
                    parts.append(
                        '<div class="metric"><div class="metric-lbl"><span>Demand (relative)</span>'
                        f'<span style="color:{score_color(c["demand"])}">{c["demand"]}</span></div>'
                        f'{render_bar(c["demand"], "#2fa18f")}</div>'
                    )
                    parts.append('</div>')
                    # pros / cons
                    pc = []
                    if c["pros"]:
                        pc.append(
                            '<div class="pccol"><div class="pchead pro">Pros</div><ul class="pclist">'
                            + "".join(f"<li>{esc(p)}</li>" for p in c["pros"]) + '</ul></div>'
                        )
                    if c["cons"]:
                        pc.append(
                            '<div class="pccol"><div class="pchead con">Cons / tradeoffs</div><ul class="pclist">'
                            + "".join(f"<li>{esc(p)}</li>" for p in c["cons"]) + '</ul></div>'
                        )
                    if pc:
                        parts.append('<div class="pcrow">' + "".join(pc) + '</div>')
                    if c["outlook"]:
                        parts.append(f'<p class="fitcard-why"><b>Outlook:</b> {esc(c["outlook"])}</p>')
                    parts.append('</div>')
                    st.markdown("".join(parts), unsafe_allow_html=True)
            else:
                st.info("No career recommendations were returned.")

        with t_uni:
            if d["universities"]:
                tier_color = {"Reach": "#ea4862", "Match": "#e6b84e", "Safety": "#2fa18f"}
                st.markdown('<div class="section-note">Realistic chances by tier, based only on your evidence and our reference data.</div>', unsafe_allow_html=True)
                for tier in ("Reach", "Match", "Safety"):
                    row = [u for u in d["universities"] if u["tier"] == tier]
                    if not row:
                        continue
                    st.markdown(
                        f'<div class="tierhead"><span class="tierdot" style="background:{tier_color[tier]}"></span>{tier}</div>',
                        unsafe_allow_html=True,
                    )
                    for u in row:
                        parts = [
                            '<div class="fitcard">',
                            '<div class="fitcard-top">',
                            f'<span class="fitcard-name">{esc(u["name"])}</span>',
                            f'<span class="fitcard-pct" style="color:{score_color(u["match"])}">{u["match"]}%</span>',
                            '</div>',
                            render_bar(u["match"], tier_color[tier]),
                        ]
                        if u["verdict"]:
                            parts.append(f'<div class="uni-verdict" style="margin-top:.5rem">{esc(u["verdict"])}</div>')
                        if u["gap"]:
                            parts.append(f'<p class="uni-gap">{esc(u["gap"])}</p>')
                        parts.append('</div>')
                        st.markdown("".join(parts), unsafe_allow_html=True)
            else:
                st.info("No university recommendations were returned.")

        with t_road:
            if d["improvements"]:
                st.markdown('<div class="section-note">Your highest-leverage moves right now.</div>', unsafe_allow_html=True)
                for i, s in enumerate(d["improvements"], 1):
                    st.markdown(
                        f'<div class="imp"><div class="imp-n">{i}</div><div class="imp-t">{esc(s)}</div></div>',
                        unsafe_allow_html=True,
                    )
            plan = d["action_plan"]
            if any(plan.get(w) for w in ("week1", "week2", "week3", "week4")):
                st.markdown('<div class="tierhead" style="margin-top:1.2rem">📅 30-Day Action Plan</div>', unsafe_allow_html=True)
                wcols = st.columns(4)
                for idx, wk in enumerate(("week1", "week2", "week3", "week4")):
                    items = plan.get(wk) or []
                    with wcols[idx]:
                        st.markdown(
                            f'<div class="week"><div class="week-tag">Week {idx + 1}</div><ul>'
                            + "".join(f"<li>{esc(s)}</li>" for s in items)
                            + '</ul></div>',
                            unsafe_allow_html=True,
                        )

        # ---- exports + disclaimer ----
        st.markdown(
            '<div class="disclaimer">This is a readiness estimate, not an admission prediction. '
            "Pay-potential and demand are relative qualitative indicators, not real salaries. "
            "University requirements change, so always verify with official sources.</div>",
            unsafe_allow_html=True,
        )
        st.write("")
        md = build_markdown(d, completeness)
        cols = st.columns([1.2, 1.2, 1.2, 1])
        with cols[0]:
            st.download_button(
                "⬇️  Markdown report", data=md,
                file_name="unipath_report.md", mime="text/markdown",
                use_container_width=True,
            )
        with cols[1]:
            pdf_bytes = build_pdf(d, completeness)
            if pdf_bytes:
                st.download_button(
                    "⬇️  PDF report", data=pdf_bytes,
                    file_name="unipath_report.pdf", mime="application/pdf",
                    use_container_width=True,
                )
            else:
                st.button("PDF unavailable", disabled=True, use_container_width=True,
                          help="Install fpdf2 (in requirements.txt) to enable PDF export.")
        with cols[3]:
            if st.button("Start over", use_container_width=True):
                st.session_state.data = None
                st.session_state.raw = None
                goto(0)

# ----------------------------------------------------------------------- footer
st.markdown(
    '<p class="foot">UniPath AI · runs entirely on your machine, private by design</p>',
    unsafe_allow_html=True,
)
