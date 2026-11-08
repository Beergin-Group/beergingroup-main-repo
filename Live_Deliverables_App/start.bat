@echo off
title MediRemind — Week 3 & 4 Live Deliverables Server
color 0A

echo =========================================================================
echo   MediRemind — Cross-Platform Medicine & Prescription Reminder
echo   Deliverables Package: Week 3 (Auth) & Week 4 (Medicine Management)
echo   Team Beergin: Jerold, Francis, Jibson, Nove
echo =========================================================================
echo.

cd /d "%~dp0backend"

if not exist node_modules (
    echo [Info] Installing backend dependencies...
    call npm install
)

echo [1/2] Launching MediRemind REST API Server on localhost:5000...
start cmd /k "title MediRemind API Backend && color 0B && node server.js"

echo [2/2] Opening Live Interactive App in your default web browser...
timeout /t 2 >nul
start http://localhost:5000

echo.
echo =========================================================================
echo   Server is running at http://localhost:5000
echo   Pre-seeded Test Credentials:
echo     - Patient:   patient@mediremind.com   / password123
echo     - Caregiver: caregiver@mediremind.com / password123
echo =========================================================================
echo.
pause
