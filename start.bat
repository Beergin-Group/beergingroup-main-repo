@echo off
title MediRemind Web System — Feature Branch
color 0A
echo.
echo  ============================================================
echo   MediRemind Web System ^| Team Beergin
echo   Branch: feature/web_systems
echo   Course: Application Development ^& Emerging Technologies
echo  ============================================================
echo.

cd /d "%~dp0backend"

echo  [1/2] Checking Node.js...
node -v >nul 2>&1
if errorlevel 1 (
    echo  ERROR: Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

echo  [2/2] Starting MediRemind Web System Server...
echo.
echo  The web system will open at: http://localhost:5000
echo.

REM Open browser after a short delay
start "" /b timeout /t 2 /nobreak >nul & start "" "http://localhost:5000"

node server.js

pause
