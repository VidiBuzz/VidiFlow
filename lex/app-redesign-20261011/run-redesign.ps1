# Launches the Lex redesign OpenCode session detached, stdin closed, logged in this folder.
$ErrorActionPreference = 'Stop'
$d   = 'M:\code\VidiFlow\lex\app-redesign-20261011'
$oc  = 'C:\Users\James\AppData\Local\Microsoft\WinGet\Links\opencode.exe'
$model = 'opencode/muse-spark-1.3-contributor-free'
$running = @(Get-CimInstance Win32_Process -Filter "Name='opencode.exe'" | Where-Object { $_.CommandLine -match ' run ' })
if ($running.Count -ge 2) { Write-Output "BLOCKED: $($running.Count) opencode run sessions already active (max 2)."; exit 2 }
if (Test-Path "$d\opencode-session.pid") {
  $old = Get-Content "$d\opencode-session.pid" -Raw
  if ($old -and (Get-CimInstance Win32_Process -Filter "ProcessId=$([int]$old) AND Name='opencode.exe'")) { Write-Output "ALREADY RUNNING pid $old"; exit 0 }
}
$empty = "$d\.stdin-empty.txt"; Set-Content -Path $empty -Value $null -NoNewline
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$log = "$d\opencode-session-$stamp.log"; $err = "$d\opencode-session-$stamp.err.log"
$argline = "run --model $model --auto --title `"Lex UI redesign 2026-10-11`" --dir `"$d`" -f `"$d\REDESIGN-PROMPT.md`" -- `"Follow the attached REDESIGN-PROMPT.md exactly. Work only in this folder. Finish with CHANGES.md and the screens PNGs.`""
$p = Start-Process -FilePath $oc -ArgumentList $argline -WorkingDirectory $d -RedirectStandardInput $empty -RedirectStandardOutput $log -RedirectStandardError $err -WindowStyle Hidden -PassThru
Set-Content "$d\opencode-session.pid" $p.Id
Set-Content "$d\opencode-session.current-log.txt" $log
Write-Output "STARTED pid $($p.Id) model $model log $log"

