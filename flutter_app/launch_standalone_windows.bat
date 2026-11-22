@echo off
setlocal
echo ======================================================================
echo   MediRemind - Launch Standalone Desktop Executable (Task 3.4)
echo   Front-End Developer: Jibson Cabilin
echo ======================================================================
echo.

set EXE_PATH=%~dp0build\windows\runner\Release\mediremind.exe

if not exist "%EXE_PATH%" (
    echo [INFO] Standalone executable not yet compiled.
    echo Running release build script first...
    call "%~dp0build_windows_release.bat"
)

if exist "%EXE_PATH%" (
    echo Launching mediremind.exe standalone without debugger attached...
    start "" "%EXE_PATH%"
    echo [SUCCESS] Standalone Windows application launched!
) else (
    echo [INFO] Ready to launch once compiled via 'flutter build windows --release'.
)

echo.
pause
