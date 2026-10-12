<#
  agy-batch-2026-10-11.ps1  -  Sequential Gemini image renders via the Antigravity CLI (agy)
  Reads image-prompts-2026-10-11.csv and renders ONE image at a time (never parallel),
  sleeping 10 s between jobs. Stops immediately on a 429 / quota error.

  Usage (PowerShell 7 or Windows PowerShell 5.1):
    .\agy-batch-2026-10-11.ps1 -Limit 3                 # first 3 rows (P1 rows come first)
    .\agy-batch-2026-10-11.ps1 -StartAt 12 -Limit 10    # rows 12..21 (1-based row number)
    .\agy-batch-2026-10-11.ps1 -StartAt VS-01           # start at a slot id
    .\agy-batch-2026-10-11.ps1 -Priority P1             # only P1 rows

  Prepared 2026-10-11 by Grok Bot. Fixed 2026-10-11 (print-mode flags, full agy path into
  the job, quota regex incl. RESOURCE_EXHAUSTED/exhausted, real PNG conversion) and run
  for the 11 P1 slots.
#>
[CmdletBinding()]
param(
  [string]$CsvPath   = (Join-Path $PSScriptRoot 'image-prompts-2026-10-11.csv'),
  [string]$OutDir    = 'M:\code\VidiFlow\out\site-images',
  [string]$BrainDir  = (Join-Path $env:USERPROFILE '.gemini\antigravity-cli\brain'),
  [string]$Model     = 'gemini-3.8-flash-high',
  [int]$Limit        = 0,          # 0 = no limit
  [string]$StartAt   = '1',        # 1-based row number OR slot id (e.g. VN-01)
  [string]$Priority  = '',         # optional filter: P1 / P2 / P3
  [int]$SleepSeconds = 10,
  [int]$TimeoutMinutes = 10,
  [string]$PrintTimeout = '8m',    # agy --print-timeout value
  [string]$PythonExe = 'C:\Python314\python.exe',
  [switch]$SkipExisting
)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command agy -ErrorAction SilentlyContinue)) { throw 'agy is not on PATH. Install the Antigravity CLI first.' }
$agyExe = (Get-Command agy).Source
if (-not $agyExe) { throw 'Could not resolve the full path to agy.' }
if (-not (Test-Path $CsvPath)) { throw "CSV not found: $CsvPath" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$LogPath = Join-Path $OutDir ('agy-batch-log-{0}.csv' -f (Get-Date -Format 'yyyy-MM-dd'))
if (-not (Test-Path $LogPath)) {
  'timestamp,id,filename,status,seconds,source,message' | Out-File -FilePath $LogPath -Encoding utf8
}
function Write-Log($id,$file,$status,$secs,$src,$msg) {
  $clean = ($msg -replace '[\r\n,"]',' ')
  if ($clean.Length -gt 300) { $clean = $clean.Substring(0,300) }
  ('{0},{1},{2},{3},{4},"{5}","{6}"' -f (Get-Date -Format 's'),$id,$file,$status,$secs,$src,$clean) |
    Out-File -FilePath $LogPath -Append -Encoding utf8
}

$rows = @(Import-Csv -Path $CsvPath)
if ($Priority) { $rows = @($rows | Where-Object { $_.priority -eq $Priority }) }
$startIdx = 0
if ($StartAt -match '^\d+$') { $startIdx = [int]$StartAt - 1 }
else {
  $startIdx = [Array]::FindIndex($rows, [Predicate[object]]{ param($r) $r.id -eq $StartAt })
  if ($startIdx -lt 0) { throw "StartAt id '$StartAt' not found in CSV" }
}
$rows = @($rows | Select-Object -Skip $startIdx)
if ($Limit -gt 0) { $rows = @($rows | Select-Object -First $Limit) }
Write-Host ("Rendering {0} image(s) sequentially -> {1}" -f $rows.Count, $OutDir)
Write-Host ("agy: {0}" -f $agyExe)
Write-Host ("Log: {0}" -f $LogPath)

$n = 0
foreach ($r in $rows) {
  $n++
  $dest = Join-Path $OutDir $r.filename
  if ($SkipExisting -and (Test-Path $dest)) { Write-Host "[$n] $($r.id) exists, skipping"; Write-Log $r.id $r.filename 'skipped' 0 '' 'exists'; continue }

  $prompt = ("Use your image generation tool to create an image and save it as {0}. " +
             "Prompt: {1} Avoid: {2}. Output aspect {3}x{4} ({3} by {4} pixels), PNG.") -f `
             $r.filename, $r.prompt, $r.negative, $r.width, $r.height
  $prompt = $prompt -replace '"', "'"

  Write-Host ("[{0}/{1}] {2}  {3}  {4}x{5}" -f $n, $rows.Count, $r.id, $r.filename, $r.width, $r.height)
  $t0 = Get-Date
  $output = ''
  try {
    $job = Start-Job -ScriptBlock {
      param($exe,$p,$m,$wd,$pt)
      Set-Location $wd
      & $exe --dangerously-skip-permissions -p $p --model $m --print-timeout $pt 2>&1 | Out-String
    } -ArgumentList $agyExe, $prompt, $Model, $OutDir, $PrintTimeout
    if (-not (Wait-Job $job -Timeout ($TimeoutMinutes * 60))) {
      Stop-Job $job; Remove-Job $job -Force
      throw "timed out after $TimeoutMinutes min"
    }
    $output = Receive-Job $job | Out-String
    Remove-Job $job -Force
  } catch {
    $secs = [int]((Get-Date) - $t0).TotalSeconds
    Write-Warning "  FAILED: $($_.Exception.Message)"
    Write-Log $r.id $r.filename 'failed' $secs '' $_.Exception.Message
    Start-Sleep -Seconds $SleepSeconds; continue
  }
  $secs = [int]((Get-Date) - $t0).TotalSeconds

  if ($output -match '(?i)\b429\b|quota|resource[_ ]exhausted|exhausted|rate limit|too many requests') {
    Write-Warning '  429 / quota error from agy. Stopping the batch so nothing else burns quota.'
    Write-Log $r.id $r.filename 'quota-stop' $secs '' $output
    break
  }

  # Prefer the requested destination if agy honored it; otherwise take the newest image
  # written into agy's own brain folder after this job started.
  $img = $null
  if ((Test-Path $dest) -and ((Get-Item $dest).LastWriteTime -ge $t0.AddSeconds(-2))) {
    $img = Get-Item $dest
  } elseif (Test-Path $BrainDir) {
    $img = Get-ChildItem -Path $BrainDir -Recurse -File -Include *.png,*.jpg,*.jpeg,*.webp -ErrorAction SilentlyContinue |
           Where-Object { $_.LastWriteTime -ge $t0.AddSeconds(-2) } |
           Sort-Object LastWriteTime -Descending | Select-Object -First 1
  }

  if ($img) {
    if ($img.FullName -eq $dest -and $img.Extension -eq '.png') {
      Write-Host "  OK -> $dest  ($secs s)  [written directly]"
      Write-Log $r.id $r.filename 'success' $secs $img.FullName 'ok (direct)'
    } elseif ($img.Extension -eq '.png') {
      Copy-Item -LiteralPath $img.FullName -Destination $dest -Force
      Write-Host "  OK -> $dest  ($secs s)"
      Write-Log $r.id $r.filename 'success' $secs $img.FullName 'ok (png copied)'
    } else {
      # Real conversion (not a rename): JPEG/WEBP -> PNG via Pillow.
      & $PythonExe -c "from PIL import Image; Image.open(r'$($img.FullName)').convert('RGB').save(r'$dest','PNG')"
      if ($LASTEXITCODE -ne 0) {
        Copy-Item -LiteralPath $img.FullName -Destination $dest -Force
        Write-Warning "  PNG conversion failed; raw $($img.Extension) copied under .png name"
        Write-Log $r.id $r.filename 'success' $secs $img.FullName "convert failed; raw $($img.Extension) copied"
      } else {
        Write-Host "  OK -> $dest  ($secs s)  [converted from $($img.Extension)]"
        Write-Log $r.id $r.filename 'success' $secs $img.FullName "converted from $($img.Extension)"
      }
    }
  } else {
    Write-Warning "  No new image found under $BrainDir"
    Write-Log $r.id $r.filename 'no-image' $secs '' $output
  }
  if ($n -lt $rows.Count) { Start-Sleep -Seconds $SleepSeconds }
}
Write-Host "Done. See $LogPath"
