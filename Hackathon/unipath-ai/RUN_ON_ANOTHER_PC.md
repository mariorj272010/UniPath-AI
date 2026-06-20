# UniPath AI × MICRORITM — run on another computer

A cinematic Next.js front-end for UniPath AI, wired to a **local** Llama model via Ollama.
No cloud, no API key. This zip excludes `node_modules/` and `.next/` (rebuilt on first run).

## Prerequisites (install once)
1. **Node.js 20+** — https://nodejs.org (LTS).
2. **Ollama** — https://ollama.com/download
3. The AI model. In a terminal:
   ```bash
   ollama pull llama3.1:8b
   ```
   Then build the CPU-forced model used by default (run from this folder, where `Modelfile` lives
   in the parent `Hackathon` folder — copy it next to you or point to it):
   ```bash
   ollama create unipath-cpu -f ../Modelfile
   ```
   > Prefer GPU speed and have an up-to-date NVIDIA driver? Skip `unipath-cpu` and set
   > `OLLAMA_MODEL=llama3.1:8b` in `.env.local` instead.

## Run the app
From this `unipath-ai/` folder:
```bash
npm install          # first time only (needs internet)
npm run dev          # starts http://localhost:3000
```
Open **http://localhost:3000**. Make sure Ollama is running (`ollama serve`, or the Ollama app).

First analysis on CPU takes ~1–3 minutes — the loading screen is expected to sit a while.

## Config (`.env.local`)
```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=unipath-cpu
```

## Production build (optional)
```bash
npm run build
npm run start        # serves the optimized build
```

## Troubleshooting
- **"Couldn't reach the local AI engine"** → Ollama isn't running, or the model is missing.
  Check `ollama list` (you should see `unipath-cpu` or `llama3.1:8b`).
- **Port 3000 in use** → `npm run dev -- -p 3010`.
- The original Streamlit version (`app.py`, `run.bat`) is in the parent `Hackathon/` folder and
  still works independently if you prefer it.
