@echo off
rem Starts the Scope Control Agent and opens it in the browser.
cd /d "%~dp0"
start "" cmd /c "timeout /t 3 >nul & start http://localhost:8765"
".venv\Scripts\python.exe" -m uvicorn server:app --port 8765
