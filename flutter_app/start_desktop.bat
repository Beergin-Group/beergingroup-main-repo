@echo off
echo ========================================================
echo   MediRemind - Phase 3 Windows Desktop Launcher
echo ========================================================
cd /d "%~dp0"
echo Checking Flutter Windows Target...
flutter devices
echo Launching MediRemind on Windows Desktop...
flutter run -d windows
pause
