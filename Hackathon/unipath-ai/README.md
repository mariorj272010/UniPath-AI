# UniPath AI — Run It From a Brand-New Laptop

This is the **Next.js** front-end for UniPath AI: a cinematic web app that reads a student's
resume/transcript PDF and produces a university-readiness report. The "brain" is a **local**
Llama 3.1 model running through **Ollama** — so there is **no cloud, no API key, and no cost**.

This guide assumes a **completely fresh Windows 10/11 laptop**: no Node.js, no Ollama, nothing.
Every step is done **in the terminal**. Just follow it top to bottom. Total time is mostly
waiting for the ~4.9 GB AI model to download.

> **On macOS or Linux?** The ideas are identical; only the install commands differ. See
> [Appendix: macOS / Linux](#appendix-macos--linux) at the bottom.

---

## What you are about to install

| Piece | What it is | Why you need it |
|-------|------------|-----------------|
| **Node.js 20+** | JavaScript runtime + `npm` | Runs the Next.js web app |
| **Ollama** | Local AI model runner | Runs the Llama model on your own machine |
| **llama3.1:8b** | The AI model (~4.9 GB) | The actual intelligence behind the report |
| **unipath-cpu** | A CPU-only build of that model | Avoids GPU-driver crashes on random laptops |
| **npm packages** | The app's code dependencies | Downloaded automatically by `npm install` |

You need an **internet connection for the first run only**. After everything is downloaded,
the app works fully offline.

**Disk space:** keep ~8 GB free. **RAM:** 8 GB is the realistic minimum.

---

## Step 0 — Open a terminal

Press **Start**, type **`PowerShell`**, and open **Windows PowerShell**.

Everything below is typed into this window. Copy a command, paste it (right-click or
`Ctrl+V`), press **Enter**, and wait for it to finish before the next one.

To check you have the `winget` installer (it ships with current Windows):

```powershell
winget --version
```

If you see a version number, you're good. If it says it's not recognized, open the
**Microsoft Store**, search **"App Installer"**, and update it — then reopen PowerShell.

---

## Step 1 — Install Node.js

```powershell
winget install --id OpenJS.NodeJS.LTS -e --accept-package-agreements --accept-source-agreements
```

This installs the latest **LTS** version (20+), which is what this app needs.

**Important:** close PowerShell and open a **new** PowerShell window now, so it picks up the
newly installed `node` and `npm` commands. Then verify:

```powershell
node --version
npm --version
```

You should see a version for each (e.g. `v20.x.x` and `10.x.x`). If `node` is "not
recognized," restart the laptop and try the verify commands again — Windows sometimes needs a
reboot to update the PATH.

---

## Step 2 — Install Ollama

```powershell
winget install --id Ollama.Ollama -e --accept-package-agreements --accept-source-agreements
```

Again, **close and reopen PowerShell** so the `ollama` command becomes available, then check:

```powershell
ollama --version
```

---

## Step 3 — Start the Ollama server

Ollama needs a background server running for the app to talk to. Start it:

```powershell
ollama serve
```

This window will now **stay busy** showing server logs — that's correct. **Leave it open.**

Open a **second** PowerShell window (Start → PowerShell again) for the remaining steps.

> Tip: Installing Ollama also adds a desktop app that auto-starts the same server. If you
> ever see `address already in use`, the server is already running — just skip `ollama serve`
> and move on.

---

## Step 4 — Download the AI model

In your **second** window, download the base model. This is the big one (~4.9 GB):

```powershell
ollama pull llama3.1:8b
```

Let it finish. If your connection drops, just run the same command again — it resumes where
it left off.

---

## Step 5 — Build the CPU-only model (`unipath-cpu`)

The app defaults to a CPU-forced build of the model. This is deliberate: on laptops with an
outdated NVIDIA driver, running on the GPU crashes with
`CUDA error: device kernel image is invalid`. Forcing CPU makes it run **everywhere**.

The recipe lives in a file called `Modelfile`, one folder up from this app (in the
`Hackathon` folder). First, move into this app's folder, then build:

```powershell
cd "C:\Users\reyna\OneDrive\Desktop\testing\Hackathon\unipath-ai"
ollama create unipath-cpu -f ..\Modelfile
```

> If you copied this project somewhere else, change the `cd` path above to wherever the
> `unipath-ai` folder actually is on this laptop.

Confirm both models are present:

```powershell
ollama list
```

You should see `llama3.1:8b` and `unipath-cpu` in the list.

---

## Step 6 — Install the app's dependencies

Still inside the `unipath-ai` folder, download the web app's code packages (needs internet,
one time):

```powershell
npm install
```

This creates a `node_modules` folder. It can take a couple of minutes.

---

## Step 7 — Check the configuration

The app reads its settings from a file named **`.env.local`** in this folder. It should
already contain:

```
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=unipath-cpu
```

- `OLLAMA_BASE_URL` — where Ollama is listening (the default; don't change it).
- `OLLAMA_MODEL` — which model to use. Leave it as `unipath-cpu` for maximum compatibility.

If the file is missing, create it with those two lines. You don't need to touch this
otherwise.

---

## Step 8 — Run the app

```powershell
npm run dev
```

When it prints something like `Local: http://localhost:3000`, open a web browser and go to:

**http://localhost:3000**

Upload a resume/transcript PDF and let it analyze.

> **The first analysis is slow** — give it **1–3 minutes**. It's running a real AI model on
> your CPU, so the loading screen is *supposed* to sit there for a while. Later runs are
> faster.

To **stop** the app, click the `npm run dev` window and press `Ctrl + C`. To start it again
later, just `cd` into the folder and run `npm run dev` again (no reinstalling needed).

---

## Daily use after the first setup

Once everything is installed, starting the app is only two things:

1. Make sure Ollama is running (the desktop app, or `ollama serve` in a window).
2. In a terminal, from the `unipath-ai` folder:
   ```powershell
   npm run dev
   ```
3. Open **http://localhost:3000**.

No internet required from here on.

---

## Troubleshooting

**"Couldn't reach the local AI engine" (or similar) in the browser**
Ollama isn't running, or the model is missing. Check the server window is open
(`ollama serve`) and run `ollama list` — you should see `unipath-cpu`. If not, redo Step 5.

**`node` or `npm` is "not recognized"**
The terminal was opened before Node finished installing. Close it, open a fresh PowerShell,
and try again. If it still fails, reboot the laptop.

**`ollama` is "not recognized"**
Same thing — open a new terminal after installing, or reboot.

**`address already in use` when running `ollama serve`**
The server is already running (the Ollama desktop app started it). That's fine — skip
`ollama serve`.

**Port 3000 is already in use**
Run the app on a different port:
```powershell
npm run dev -- -p 3010
```
Then open **http://localhost:3010** instead.

**The download keeps failing**
`ollama pull llama3.1:8b` resumes on retry — just run it again. `npm install` is the same;
re-run it if it errors out mid-download.

**It's painfully slow and you have a good NVIDIA GPU**
By default it runs on CPU for safety. If your NVIDIA driver is fully up to date (update via
the NVIDIA App or nvidia.com/drivers, then reboot), you can use the GPU for a big speed boost:
open `.env.local` and change `OLLAMA_MODEL=unipath-cpu` to `OLLAMA_MODEL=llama3.1:8b`, then
restart the app.

---

## Appendix: macOS / Linux

The steps are the same — only installation differs:

- **Node.js:** install via [nodejs.org](https://nodejs.org) (LTS), or `brew install node`
  (macOS), or your package manager (Linux).
- **Ollama:** download from [ollama.com/download](https://ollama.com/download), or on Linux:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```
- Then the model + app steps are identical, using `/` paths:
  ```bash
  ollama pull llama3.1:8b
  cd path/to/Hackathon/unipath-ai
  ollama create unipath-cpu -f ../Modelfile
  npm install
  npm run dev
  ```

---

## Notes

- This `unipath-ai` app is the modern Next.js front-end. There is also an older **Streamlit**
  version (`app.py` + `run.bat`) in the parent `Hackathon/` folder that does the same job in
  Python — `run.bat` auto-installs everything on Windows if you'd rather use that.
- A production build is optional:
  ```powershell
  npm run build
  npm run start
  ```
