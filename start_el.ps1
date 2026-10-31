# EL Phase 2 PowerShell Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "     Starting EL Assistant & Coding Agent Studio   " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Ollama
$ollamaProc = Get-Process -Name "*ollama*" -ErrorAction SilentlyContinue
if (-not $ollamaProc) {
    Write-Host "[1/3] Starting Ollama AI Service..." -ForegroundColor Yellow
    Start-Process -FilePath "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 2
} else {
    Write-Host "[1/3] Ollama AI Service already active." -ForegroundColor Green
}

# 2. Backend
Write-Host "[2/3] Starting FastAPI Backend (:8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\El\backend'; .\.venv\Scripts\Activate.ps1; uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
Start-Sleep -Seconds 2

# 3. Frontend
Write-Host "[3/3] Starting React Dashboard (:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'd:\El\frontend'; npm run dev -- --host 127.0.0.1 --port 5173"
Start-Sleep -Seconds 3

# Launch Browser
Write-Host "Opening EL Dashboard at http://localhost:5173/ ..." -ForegroundColor Green
Start-Process "http://localhost:5173/"

Write-Host "EL is live and operational!" -ForegroundColor Cyan
