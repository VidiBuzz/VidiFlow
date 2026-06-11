@echo off
REM ============================================================
REM Start Chrome with Remote Debugging (CDP) for Playwright MCP
REM ============================================================
REM This launches Chrome using your REAL profile so all extensions
REM (Rue, Anti Gravity, Kylo, etc.) and logins are preserved.
REM
REM IMPORTANT: Close any running Chrome instances first, or this
REM will connect to the existing one without debugging enabled.
REM ============================================================

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
set DEBUG_PORT=9222
set CHROME_USER_DATA="C:\Users\James\AppData\Local\Google\Chrome\User Data"

echo.
echo ============================================================
echo  Chrome CDP Launcher - Real Profile with Extensions
echo ============================================================
echo.

REM Check if Chrome debugging port is already in use
netstat -an | find ":%DEBUG_PORT%" >nul
if %errorlevel% equ 0 (
    echo [OK] Chrome debugging port %DEBUG_PORT% is already active.
    echo      Playwright MCP can connect to the existing instance.
    echo.
    pause
    exit /b 0
)

echo [INFO] Starting Chrome with remote debugging on port %DEBUG_PORT%...
echo [INFO] Using profile: %CHROME_USER_DATA%
echo [INFO] All extensions and logins will be available.
echo.

REM Launch Chrome with remote debugging using the real user profile
start "" %CHROME_PATH% --remote-debugging-port=%DEBUG_PORT% --user-data-dir=%CHROME_USER_DATA%

REM Wait for Chrome to start
timeout /t 3 >nul

REM Verify the debugging port is active
netstat -an | find ":%DEBUG_PORT%" >nul
if %errorlevel% equ 0 (
    echo [OK] Chrome is running with CDP on port %DEBUG_PORT%
    echo [OK] Playwright MCP endpoint: http://localhost:%DEBUG_PORT%
) else (
    echo [WARN] Debugging port not detected yet.
    echo        Make sure Chrome was fully closed before running this script.
    echo        Chrome cannot use the same profile if another instance is running.
)

echo.
pause
