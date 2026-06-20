# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**UniPath AI** is a Streamlit app that evaluates a high school student's university-readiness
from an uploaded resume/transcript PDF (or a questionnaire) and produces an honest readiness
report. It runs against a **local AI model** (Llama 3.1 8B via [Ollama](https://ollama.com))
through Ollama's OpenAI-compatible API — no cloud, no API key, no cost.

## Running the Project

- **One-click (Windows):** double-click `run.bat`. On first run it bootstraps everything —
  installs Python and Ollama via `winget` if missing, installs the Python packages, pulls
  the `llama3.1:8b` model (~4.9 GB, one time), builds the CPU-forced `unipath-cpu` model
  from `Modelfile`, then launches the app at <http://localhost:8501>. First run needs
  internet; afterwards it works offline.
- **Manual:** `pip install -r requirements.txt`, ensure Ollama is running with the model
  available (`ollama list`), then `streamlit run app.py`.

First analysis on CPU is slow — expect 1–3 minutes.

## Architecture

Everything lives in `app.py` (single-file Streamlit app):

- **`CUSTOM_CSS`** — large inline `<style>` block injected via `st.markdown`. Dark navy
  theme; accent colors red `#e94560` and teal `#a8dadc`. Strips Streamlit chrome and
  renders the signature "waypoint rail" stepper.
- **`SYSTEM_PROMPT`** — the full advisor prompt. Encodes a weighted rubric (Academics 40%,
  Leadership 20%, Extracurriculars 20%, Career/Major Fit 20%), strict anti-fabrication rules,
  and the exact Markdown report structure the model must return.
- **`load_knowledge()`** — `@st.cache_data`; loads `data/knowledge.json`, the vetted
  reference data grounding all major/career/university claims. Returns `None` on failure.
- **`get_client()`** — builds an `OpenAI` client pointed at Ollama's endpoint
  (`OPENAI_BASE_URL`, default `http://localhost:11434/v1`).
- **`extract_text_from_pdf()`** — pulls text from an uploaded PDF via `pdfplumber`.
- **`build_profile_from_form()`** — turns questionnaire fields into a profile text block.
- **`analyze_profile()`** — sends REFERENCE DATA + STUDENT PROFILE to the model
  (`OLLAMA_MODEL`, default `unipath-cpu`, temperature 0.3) and returns the Markdown report.
- **Wizard flow** — a 4-step session-state machine (`STEPS = ["Start", "Profile", "Analyze",
  "Report"]`). `st.session_state.step` drives which slide renders; `goto(n)` sets the step
  and reruns; `render_rail(step)` draws the progress stepper.

## Configuration

- `.env` (loaded with `override=True` so it wins over stray machine env vars):
  - `OPENAI_BASE_URL`, `OPENAI_API_KEY` (Ollama ignores the key but the SDK requires a value)
  - `OLLAMA_MODEL` — defaults to `unipath-cpu`. Switch to `llama3.1:8b` for GPU speed on a
    machine with an up-to-date NVIDIA driver.
- `Modelfile` — defines `unipath-cpu`: `FROM llama3.1:8b` with `PARAMETER num_gpu 0` to force
  CPU execution. This deliberately avoids the `CUDA error: device kernel image is invalid`
  crash seen with outdated NVIDIA drivers.
- `data/knowledge.json` — required reference data; suggestions are grounded in it.
