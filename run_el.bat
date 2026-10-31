@echo off
title Starting EL Phase 2 Assistant & Coding Agent
echo ===================================================
echo           Starting EL Assistant & Coding Studio
echo ===================================================

:: 1. Start Ollama in background if not already running
tasklist /fi "imagename eq ollama.exe" | find /i "ollama.exe" >nul
if errorlevel 1 (
    echo Starting Ollama AI Service...
    start "" /b "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
    timeout /t 3 /nobreak >nul
) else (
    echo [OK] Ollama service already running.
)

:: 2. Start Backend FastAPI
echo Starting EL FastAPI Backend on port 8000...
start "EL Backend API" /d "d:\El\backend" cmd /k ".\.venv\Scripts\activate.bat && uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul

:: 3. Start Frontend React Dashboard
echo Starting EL Frontend Dashboard on port 5173...
start "EL Frontend" /d "d:\El\frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"
timeout /t 3 /nobreak >nul

:: 4. Open Default Browser
echo Launching EL Dashboard in your browser...
start http://localhost:5173/

echo ===================================================
echo [SUCCESS] EL is now live at http://localhost:5173/
echo ===================================================
pause
