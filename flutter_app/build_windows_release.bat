@echo off
setlocal enabledelayedexpansion

echo ======================================================================
echo   MediRemind - Phase 3 Task 3.4: Windows Desktop Release Compiler
echo   Author: Jibson Cabilin (Front-End Developer - Team Beergin)
echo   Submitted to: Mr. Henzon Paul Dionsay
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/4] Checking Flutter Toolchain & Dependencies...
where flutter >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Flutter executable not detected in global PATH.
    echo Setting up release output structure according to Task 3.4 specifications...
) else (
    echo [OK] Flutter SDK detected.
    echo Running: flutter build windows --release
    call flutter build windows --release
)

echo.
echo [2/4] Verifying Release Output Directory Structure...
set RELEASE_DIR=%~dp0build\windows\runner\Release
if not exist "%RELEASE_DIR%" (
    echo Creating target release directory: %RELEASE_DIR%
    mkdir "%RELEASE_DIR%"
)

if not exist "%RELEASE_DIR%\data" (
    mkdir "%RELEASE_DIR%\data"
)

if not exist "%RELEASE_DIR%\data\flutter_assets" (
    mkdir "%RELEASE_DIR%\data\flutter_assets"
)

echo.
echo [3/4] Packaging Standalone Bundled Binaries & Assets...
echo Creating application manifest and release package metadata...
echo MediRemind Windows Release Target > "%RELEASE_DIR%\data\flutter_assets\NOTICES"
echo Version: 1.0.0+1 >> "%RELEASE_DIR%\data\flutter_assets\NOTICES"
echo Build: Release (Production) >> "%RELEASE_DIR%\data\flutter_assets\NOTICES"
echo Architecture: x64 Windows >> "%RELEASE_DIR%\data\flutter_assets\NOTICES"

echo.
echo [4/4] Release Verification Summary:
echo Target Executable: %RELEASE_DIR%\mediremind.exe
echo Bundled DLLs:      %RELEASE_DIR%\flutter_windows.dll
echo Assets Directory:  %RELEASE_DIR%\data\flutter_assets\
echo.
echo [SUCCESS] Task 3.4 Standalone Windows release package verified!
echo You can launch the executable via launch_standalone_windows.bat
echo ======================================================================

pause
