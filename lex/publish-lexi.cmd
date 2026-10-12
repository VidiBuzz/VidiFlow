@echo off
REM Double-click this file (or run it from a terminal) to rebuild + publish Lexi.
REM It delegates to publish-lexi.ps1, forwarding any arguments you pass.
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0publish-lexi.ps1" %*
set RC=%ERRORLEVEL%
echo.
if %RC% NEQ 0 (
  echo [publish-lexi] finished with exit code %RC%
) else (
  echo [publish-lexi] finished OK
)
pause
endlocal
