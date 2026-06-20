# UniPath AI

UniPath AI reads a student's resume/transcript PDF and produces an honest **university-readiness
report**. The intelligence runs on a **local Llama 3.1 model via [Ollama](https://ollama.com)** —
**no cloud, no API key, no cost.** After the first download it works fully offline.

## What's in this repo

| Folder | What it is | Needs |
|--------|------------|-------|
| **`Hackathon/unipath-ai/`** | The main **Next.js** web app (cinematic UI) | **Node.js + Ollama** |
| `Hackathon/` (`app.py`, `run.bat`) | Older **Streamlit** version, same job in Python | Python + Ollama |
| repo root (`app/`, `components/`) | MICRORITM marketing site (Next.js) | Node.js |

The quick start below sets up the **main app** (`Hackathon/unipath-ai`) on a **fresh Windows
laptop with nothing installed** — everything from the terminal.

---

## Quick start (Windows, from a clean laptop)

Open **PowerShell** (Start → type `PowerShell`) and run these in order. You only do this once.
You need internet for the first run; after that it's offline.

**1. Install Node.js**
```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
```

**2. Install Ollama**
```powershell
winget install --id Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
```

> **Now close PowerShell and open a new window** so it picks up the `node`, `npm`, and `ollama`
> commands. Verify: `node --version`, `npm --version`, `ollama --version`.

**3. Start the Ollama server** (leave this window open)
```powershell
ollama serve
```

**4. In a second window, download the AI model** (~4.9 GB, one time)
```powershell
ollama pull llama3.1:8b
```

**5. Build the CPU-only model** (avoids GPU-driver crashes on random laptops)
```powershell
cd Hackathon\unipath-ai
ollama create unipath-cpu -f ..\Modelfile
```

**6. Install the app and run it**
```powershell
npm install
npm run dev
```

Open **http://localhost:3000**. The first analysis takes **1–3 minutes** (a real AI model
running on your CPU) — the loading screen is supposed to sit a while.

➡️ **Full step-by-step guide with explanations and troubleshooting:**
[`Hackathon/unipath-ai/README.md`](Hackathon/unipath-ai/README.md)

---

## Requirements

- **Windows 10/11** with `winget` (preinstalled on current Windows).
- **~8 GB free disk space**, ideally **8 GB+ RAM**.
- Internet for the **first** run only.

> **macOS / Linux?** Same idea — install Node from [nodejs.org](https://nodejs.org) and Ollama
> from [ollama.com/download](https://ollama.com/download), then run steps 3–6 with `/` paths.
> See [`Hackathon/unipath-ai/README.md`](Hackathon/unipath-ai/README.md) for details.

## Prefer the one-click Python version?

The Streamlit app in `Hackathon/` installs everything itself: double-click
**`Hackathon/run.bat`** — it auto-installs Python, Ollama, and the model via `winget`, then opens
the app at http://localhost:8501.
