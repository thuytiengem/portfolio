@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Thuytiengem Portfolio - Windows setup

rem ============================================================
rem  One-shot setup for a new Windows machine:
rem    Git, Node.js LTS, VS Code, Claude Code (CLI),
rem    VS Code extensions (Live Preview + Claude Code),
rem    then clones the repo (if needed) and opens it in VS Code.
rem
rem  Usage:
rem    - Put this file inside the cloned project and double-click it, OR
rem    - Put it in an empty folder, run it, and paste the repo URL when asked.
rem  Safe to run again: already-installed tools are skipped.
rem ============================================================

echo.
echo  === Thuytiengem Portfolio - setup ===
echo.

where winget >nul 2>nul
if errorlevel 1 (
  echo [!] winget was not found. Install "App Installer" from the Microsoft Store, then run this file again.
  echo     https://apps.microsoft.com/detail/9NBLGGH4NNS1
  pause
  exit /b 1
)

call :install Git.Git "Git"
call :install OpenJS.NodeJS.LTS "Node.js LTS"
call :install Microsoft.VisualStudioCode "Visual Studio Code"

call :refreshpath

rem ---------- Claude Code (CLI) ----------
where claude >nul 2>nul
if errorlevel 1 (
  echo.
  echo [*] Installing Claude Code ...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://claude.ai/install.ps1 | iex"
  call :refreshpath
  if exist "%USERPROFILE%\.local\bin\claude.exe" set "PATH=%USERPROFILE%\.local\bin;!PATH!"
  where claude >nul 2>nul
  if errorlevel 1 (
    echo [*] Native installer did not finish - falling back to npm ...
    call npm install -g @anthropic-ai/claude-code
    call :refreshpath
  )
) else (
  echo [ok] Claude Code already installed
)

rem ---------- VS Code extensions ----------
set "CODE=code"
where code >nul 2>nul
if errorlevel 1 set "CODE=%LOCALAPPDATA%\Programs\Microsoft VS Code\bin\code.cmd"
echo.
echo [*] Installing VS Code extensions ...
call "%CODE%" --install-extension ms-vscode.live-server --force
call "%CODE%" --install-extension anthropic.claude-code --force

rem ---------- project ----------
set "PROJ=%~dp0"
if not exist "%PROJ%web-config.json" (
  echo.
  set /p REPO="Paste the Git URL of the portfolio repo (e.g. https://github.com/you/gemchan-portfolio.git): "
  if "!REPO!"=="" (
    echo [!] No URL given - skipping clone.
    goto :done
  )
  for %%r in ("!REPO!") do set "NAME=%%~nr"
  git clone "!REPO!" "%~dp0!NAME!"
  if errorlevel 1 (
    echo [!] git clone failed.
    goto :done
  )
  set "PROJ=%~dp0!NAME!\"
)

git config --global user.name >nul 2>nul
if errorlevel 1 (
  echo.
  echo Git needs your name and email for commits.
  set /p GNAME="  Your name: "
  set /p GMAIL="  Your email: "
  if not "!GNAME!"=="" git config --global user.name "!GNAME!"
  if not "!GMAIL!"=="" git config --global user.email "!GMAIL!"
)

echo.
echo [*] Opening the project in VS Code ...
call "%CODE%" "%PROJ%"

:done
echo.
echo  === Done ===
echo  - Preview the site: open index.html in VS Code, click "Show Preview" (top right)
echo    or run the task "Studio: start server" (Ctrl+Shift+P, Run Task).
echo  - Content editor:   Ctrl+Shift+P, Run Task, "Studio: start server",
echo    then open http://localhost:4100/portfolio-studio/
echo  - Claude Code:      open a NEW terminal and type  claude   (log in the first time)
echo  If a command is "not recognized", close this window / VS Code and open them again.
echo.
pause
exit /b 0

rem ---------- helpers ----------
:install
winget list -e --id %1 >nul 2>nul
if not errorlevel 1 (
  echo [ok] %~2 already installed
  exit /b 0
)
echo [*] Installing %~2 ...
winget install -e --id %1 --silent --accept-package-agreements --accept-source-agreements
exit /b 0

:refreshpath
rem reload PATH from the registry so freshly installed tools work in this window
for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"`) do set "PATH=%%p"
exit /b 0
