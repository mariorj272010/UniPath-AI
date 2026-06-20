@echo off
setlocal enabledelayedexpansion
title UniPath AI - Launcher
cd /d "%~dp0"

echo ============================================================
echo   UniPath AI  -  one-click launcher
echo ============================================================
echo.
echo This sets up everything the first time (Python, Ollama, the
echo AI model) and then starts the app. First run needs internet
echo and can take a while. Later runs are fast.
echo.

REM ----------------------------------------------------------------
REM 1) Find or install Python
REM ----------------------------------------------------------------
set "PYEXE="
py -3 --version >nul 2>nul && set "PYEXE=py -3"
if not defined PYEXE if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PYEXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"

if not defined PYEXE (
    echo [setup] Installing Python ...
    winget install --id Python.Python.3.13 -e --source winget --accept-package-agreements --accept-source-agreements
    if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" (
        set "PYEXE=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
    ) else (
        echo [error] Python install failed. Install Python 3.13 manually from python.org and re-run.
        pause & exit /b 1
    )
)
echo [ok] Python: %PYEXE%

REM ----------------------------------------------------------------
REM 2) Find or install Ollama
REM ----------------------------------------------------------------
set "OLLAMA=%LOCALAPPDATA%\Programs\Ollama\ollama.exe"
if not exist "%OLLAMA%" (
    echo [setup] Installing Ollama ...
    winget install --id Ollama.Ollama -e --source winget --accept-package-agreements --accept-source-agreements
)
if not exist "%OLLAMA%" (
    echo [error] Ollama install failed. Install it manually from ollama.com and re-run.
    pause & exit /b 1
)
echo [ok] Ollama: %OLLAMA%

REM ----------------------------------------------------------------
REM 3) Install Python packages
REM ----------------------------------------------------------------
echo [setup] Installing Python packages ...
%PYEXE% -m pip install --upgrade pip >nul
%PYEXE% -m pip install -r requirements.txt
if errorlevel 1 (
    echo [error] Package install failed. Check your internet connection and re-run.
    pause & exit /b 1
)

REM ----------------------------------------------------------------
REM 4) Make sure an Ollama server is running
REM    (harmless if one is already running - that start just exits)
REM ----------------------------------------------------------------
echo [setup] Starting Ollama ...
set "OLLAMA_HOST=127.0.0.1:11434"
start "Ollama Server" /MIN "%OLLAMA%" serve
REM small wait for the server to come up (ping is a portable sleep)
ping -n 6 127.0.0.1 >nul

REM ----------------------------------------------------------------
REM 5) Download the base model (first time, ~4.9 GB), then build the
REM    CPU-forced variant. num_gpu 0 in the Modelfile keeps it on the
REM    CPU no matter the GPU/driver, which avoids the CUDA crash seen
REM    on machines with outdated NVIDIA drivers.
REM ----------------------------------------------------------------
echo [setup] Ensuring the base AI model is downloaded (first time only) ...
"%OLLAMA%" pull llama3.1:8b
if errorlevel 1 (
    echo [error] Could not download the model. Check your internet connection and re-run.
    pause & exit /b 1
)
echo [setup] Building CPU-optimized model (prevents GPU driver crashes) ...
"%OLLAMA%" create unipath-cpu -f "%~dp0Modelfile"
if errorlevel 1 (
    echo [error] Could not build the CPU model. Make sure Modelfile is in this folder.
    pause & exit /b 1
)

REM ----------------------------------------------------------------
REM 6) Skip Streamlit's first-run "Email:" prompt (it would block here)
REM ----------------------------------------------------------------
if not exist "%USERPROFILE%\.streamlit" mkdir "%USERPROFILE%\.streamlit"
if not exist "%USERPROFILE%\.streamlit\credentials.toml" (
    > "%USERPROFILE%\.streamlit\credentials.toml" echo [general]
    >> "%USERPROFILE%\.streamlit\credentials.toml" echo email = ""
)

REM ----------------------------------------------------------------
REM 7) Free port 8501 in case an OLD copy of the app is still running
REM    (otherwise you'd keep seeing the old version).
REM ----------------------------------------------------------------
echo [setup] Closing any old copy of the app on port 8501 ...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8501 ^| findstr LISTENING') do taskkill /F /PID %%p >nul 2>nul

REM ----------------------------------------------------------------
REM 8) Launch the app
REM ----------------------------------------------------------------
echo.
echo ============================================================
echo   Starting UniPath AI ... your browser will open shortly.
echo   To stop: close this window.
echo ============================================================
echo.
%PYEXE% -m streamlit run app.py --server.port 8501

pause
