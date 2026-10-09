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
rem  Safe to run again: tools that are really installed are skipped.
rem  NOTE: winget returns NEGATIVE error codes, so every check uses
rem        "if !errorlevel! neq 0" (not "if errorlevel 1", which treats negatives as success).
rem ============================================================

echo.
echo  === Thuytiengem Portfolio - setup ===
echo.

where winget >nul 2>nul
if !errorlevel! neq 0 (
  echo [!] winget was not found. Install it first, then run this file again.
  pause
  exit /b 1
)

echo [*] Preparing winget (the first run can take a minute) ...
winget source update >nul 2>nul

rem ---------- Git / Node / VS Code ----------
call :ensure git  Git.Git                    "Git"                "%ProgramFiles%\Git\cmd\git.exe"
call :ensure node OpenJS.NodeJS.LTS          "Node.js LTS"        "%ProgramFiles%\nodejs\node.exe"
call :ensure code Microsoft.VisualStudioCode "Visual Studio Code" "%LOCALAPPDATA%\Programs\Microsoft VS Code\bin\code.cmd"
call :refreshpath

rem ---------- Claude Code (CLI) ----------
echo.
echo [*] Checking Claude Code ...
call :findclaude
if not defined CLAUDE_OK (
  echo [*] Installing Claude Code ...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://claude.ai/install.ps1 | iex"
  call :findclaude
)
if not defined CLAUDE_OK (
  where npm >nul 2>nul
  if !errorlevel! equ 0 (
    echo [*] Native installer did not work - trying npm ...
    call npm install -g @anthropic-ai/claude-code
    call :refreshpath
    call :findclaude
  )
)
if defined CLAUDE_OK (echo [ok] Claude Code) else (echo [!] Claude Code could not be installed - see the log above)

rem ---------- VS Code extensions ----------
set "CODE=%LOCALAPPDATA%\Programs\Microsoft VS Code\bin\code.cmd"
if not exist "%CODE%" set "CODE=%ProgramFiles%\Microsoft VS Code\bin\code.cmd"
if exist "%CODE%" (
  echo.
  echo [*] Installing VS Code extensions ...
  call "%CODE%" --install-extension ms-vscode.live-server --force
  call "%CODE%" --install-extension anthropic.claude-code --force
) else (
  echo [!] VS Code not found - skipping extensions
)

rem ---------- project ----------
set "PROJ=%~dp0"
if not exist "%PROJ%web-config.json" (
  where git >nul 2>nul
  if !errorlevel! neq 0 (
    echo [!] Git is missing - cannot clone the project.
    goto :summary
  )
  echo.
  set /p REPO="Paste the Git URL of the portfolio repo (Enter to skip): "
  if "!REPO!"=="" goto :summary
  for %%r in ("!REPO!") do set "NAME=%%~nr"
  git clone "!REPO!" "%~dp0!NAME!"
  if !errorlevel! neq 0 (
    echo [!] git clone failed.
    goto :summary
  )
  set "PROJ=%~dp0!NAME!\"
)

where git >nul 2>nul
if !errorlevel! equ 0 (
  git config --global user.name >nul 2>nul
  if !errorlevel! neq 0 (
    echo.
    echo Git needs your name and email for commits.
    set /p GNAME="  Your name: "
    set /p GMAIL="  Your email: "
    if not "!GNAME!"=="" git config --global user.name "!GNAME!"
    if not "!GMAIL!"=="" git config --global user.email "!GMAIL!"
  )
)

if exist "%CODE%" if exist "%PROJ%web-config.json" (
  echo.
  echo [*] Opening the project in VS Code ...
  call "%CODE%" "%PROJ%"
)

:summary
call :refreshpath
echo.
echo  ================= SUMMARY =================
call :status git  "Git        "
call :status node "Node.js    "
call :status code "VS Code    "
call :findclaude
if defined CLAUDE_OK (echo    Claude Code : OK) else (echo    Claude Code : MISSING)
echo  ===========================================
echo.
echo  - Close this window, then open a NEW cmd / VS Code so the new PATH is used.
echo  - VS Code: Start menu, "Visual Studio Code" (or type  code  in a new cmd)
echo  - Claude:  open a new terminal and type  claude  (log in the first time)
echo  - Preview: open index.html in VS Code, click "Show Preview" (top right)
echo  - Studio:  Ctrl+Shift+P, Run Task, "Studio: start server",
echo             then open http://localhost:4100/portfolio-studio/
echo.
pause
exit /b 0

rem ================= helpers =================

rem :ensure <command> <winget id> <"name"> <"known install path">
:ensure
echo.
echo [*] Checking %~3 ...
where %1 >nul 2>nul
if !errorlevel! equ 0 (echo [ok] %~3 already installed& exit /b 0)
if exist "%~4" (echo [ok] %~3 already installed& exit /b 0)
echo [*] Installing %~3 ...
winget install -e --id %2 --accept-package-agreements --accept-source-agreements
if !errorlevel! neq 0 (
  echo [!] winget returned an error for %~3 - see the log above
) else (
  echo [ok] %~3 installed
)
exit /b 0

rem :findclaude -> sets CLAUDE_OK; if claude.exe is in %USERPROFILE%\.local\bin, that folder is added to the user PATH
:findclaude
set "CLAUDE_OK="
if exist "%USERPROFILE%\.local\bin\claude.exe" (
  set "CLAUDE_OK=1"
  powershell -NoProfile -Command "$d = $env:USERPROFILE + '\.local\bin'; $p = [Environment]::GetEnvironmentVariable('Path','User'); if (-not $p) { $p = '' }; if (($p -split ';') -notcontains $d) { [Environment]::SetEnvironmentVariable('Path', ($p.TrimEnd(';') + ';' + $d).TrimStart(';'), 'User'); Write-Host '[*] Added' $d 'to your PATH' }"
  set "PATH=%USERPROFILE%\.local\bin;!PATH!"
  exit /b 0
)
where claude >nul 2>nul
if !errorlevel! equ 0 set "CLAUDE_OK=1"
exit /b 0

rem :status <command> <"label">
:status
where %1 >nul 2>nul
if !errorlevel! equ 0 (
  echo    %~2 : OK
  exit /b 0
)
if /i "%1"=="code" if exist "%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe" (
  echo    %~2 : OK - open a new window to use the code command
  exit /b 0
)
echo    %~2 : MISSING
exit /b 0

:refreshpath
rem reload PATH from the registry so freshly installed tools work in this window
for /f "usebackq delims=" %%p in (`powershell -NoProfile -Command "[Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')"`) do set "PATH=%%p"
if exist "%USERPROFILE%\.local\bin\claude.exe" set "PATH=%USERPROFILE%\.local\bin;!PATH!"
exit /b 0
