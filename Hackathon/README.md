# UniPath AI

A Streamlit app that evaluates a student's university-readiness from an uploaded PDF,
using a **free, local AI model** (Llama 3.1 via [Ollama](https://ollama.com)). No API
key, no cloud, no cost.

## Run it on another computer

1. **Copy this whole folder** to the other PC (USB stick, cloud drive, etc.).
   You need these at minimum: `app.py`, `run.bat`, `requirements.txt`, `.env`, `Modelfile`, and the `data/` folder (`data/knowledge.json`, which grounds the major/career/university suggestions).
2. **Double-click `run.bat`.**

That's it. The first run automatically:
- installs Python (if missing) via `winget`
- installs Ollama (if missing) via `winget`
- installs the Python packages
- downloads the AI model `llama3.1:8b` (~4.9 GB, one time)
- starts everything and opens the app at <http://localhost:8501>

> **First run needs an internet connection** (to download Python, Ollama, and the model).
> After that it works fully offline. The first analysis is slow on CPU — give it 1–3 minutes.

## Requirements on the target PC
- **Windows 10/11** with `winget` (App Installer — preinstalled on current Windows).
- **~8 GB free disk space** and ideally **8 GB+ RAM**.
- Internet for the first run only.

## Why it runs on the CPU (and how to use the GPU instead)
The app uses a CPU-forced model called `unipath-cpu`, built from `Modelfile`
(`PARAMETER num_gpu 0`). This is deliberate: on machines with an **outdated NVIDIA
driver**, running on the GPU crashes with
`CUDA error: device kernel image is invalid`. Forcing CPU avoids that on every machine.

If the target PC has a **working, up-to-date NVIDIA GPU** and you want the big speed boost:
1. Update the NVIDIA driver (via the NVIDIA App or nvidia.com/drivers) and reboot.
2. Edit `.env` and change `OLLAMA_MODEL=unipath-cpu` to `OLLAMA_MODEL=llama3.1:8b`.

## Want a different / smaller model?
Edit `.env` and change `OLLAMA_MODEL` (e.g. `llama3.2:3b` is smaller/faster, lower quality).
Then `run.bat` will download that one instead.

## Troubleshooting
- **`winget` not recognized:** update "App Installer" from the Microsoft Store, then re-run.
- **Model download interrupted:** just run `run.bat` again — it resumes.
- **Port 8501 in use:** close any other running copy, then re-run.
