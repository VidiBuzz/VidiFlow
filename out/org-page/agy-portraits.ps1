<#
  agy-portraits.ps1  -  Sequential agent-portrait renders via the Antigravity CLI (agy)
  Adapted 2026-10-11 from M:\code\VidiBot\docs\site-images\agy-batch-2026-10-11.ps1 (the original is untouched).
  Renders ONE image at a time (never parallel), sleeping between jobs.
  Stops immediately on a 429 / quota / rate-limit error so nothing else burns quota.

  Run it from the project folder:
    Set-Location M:\code\VidiFlow\out\org-page
    powershell -NoProfile -ExecutionPolicy Bypass -File .\agy-portraits.ps1

  Log: out\org-page\agy-portrait-log-2026-10-11.csv
#>
[CmdletBinding()]
param(
  [string]$CsvPath   = 'portrait-prompts.csv',
  [string]$OutDir    = 'img\agents',
  [string]$WorkDir   = '.',
  [string]$RootDir   = '.',
  [string]$BrainDir1 = (Join-Path $env:USERPROFILE '.gemini\antigravity-cli\brain'),
  [string]$BrainDir2 = 'C:\Users\James\.gemini\antigravity\brain',
  [string]$Model     = 'gemini-3.8-flash-high',
  [int]$Limit        = 0,
  [int]$SleepSeconds = 8,
  [int]$TimeoutMinutes = 12,
  [string]$PrintTimeout = '8m',
  [string]$PythonExe = 'C:\Python314\python.exe',
  [switch]$SkipExisting
)
$ErrorActionPreference = 'Stop'
if (-not (Get-Command agy -ErrorAction SilentlyContinue)) { throw 'agy is not on PATH.' }
$agyExe = (Get-Command agy).Source
if (-not $agyExe) { throw 'Could not resolve the full path to agy.' }
if (-not (Test-Path $CsvPath)) { throw "CSV not found: $CsvPath" }
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$LogPath = Join-Path $RootDir 'agy-portrait-log-2026-10-11.csv'
if (-not (Test-Path $LogPath)) {
  'slug,filename,start,end,seconds,result,source' | Out-File -FilePath $LogPath -Encoding utf8
}
function Write-Log($slug,$file,$start,$end,$secs,$result,$src) {
  $clean = ($src -replace '[\r\n,"]',' ')
  if ($clean.Length -gt 300) { $clean = $clean.Substring(0,300) }
  ('{0},{1},{2},{3},{4},{5},"{6}"' -f $slug,$file,$start,$end,$secs,$result,$clean) |
    Out-File -FilePath $LogPath -Append -Encoding utf8
}

$rows = @(Import-Csv -Path $CsvPath)
if ($Limit -gt 0) { $rows = @($rows | Select-Object -First $Limit) }
Write-Host ("Rendering {0} portrait(s) sequentially -> {1}" -f $rows.Count, $OutDir)
Write-Host ("agy: {0}" -f $agyExe)
Write-Host ("Log: {0}" -f $LogPath)

$n = 0
foreach ($r in $rows) {
  $n++
  $dest = Join-Path $OutDir $r.filename
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($r.filename)
  if ($SkipExisting -and (Test-Path $dest)) { Write-Host "[$n] $slug exists, skipping"; continue }

  $prompt = ("Use your image generation tool to create an image and save it as img/agents/{0}. " +
             "Prompt: {1} Avoid: {2}. Output square 1024 by 1024 pixels, PNG.") -f `
             $r.filename, $r.prompt, $r.negative
  $prompt = $prompt -replace '"', "'"

  Write-Host ("[{0}/{1}] {2}  {3}" -f $n, $rows.Count, $slug, $r.filename)
  $t0 = Get-Date
  $startStamp = $t0.ToString('s')
  $output = ''
  try {
    $job = Start-Job -ScriptBlock {
      param($exe,$p,$m,$wd,$pt)
      Set-Location $wd
      & $exe --dangerously-skip-permissions -p $p --model $m --print-timeout $pt 2>&1 | Out-String
    } -ArgumentList $agyExe, $prompt, $Model, $WorkDir, $PrintTimeout
    if (-not (Wait-Job $job -Timeout ($TimeoutMinutes * 60))) {
      Stop-Job $job; Remove-Job $job -Force
      throw "timed out after $TimeoutMinutes min"
    }
    $output = Receive-Job $job | Out-String
    Remove-Job $job -Force
  } catch {
    $secs = [int]((Get-Date) - $t0).TotalSeconds
    Write-Warning "  FAILED: $($_.Exception.Message)"
    Write-Log $slug $r.filename $startStamp ((Get-Date).ToString('s')) $secs 'failed' $_.Exception.Message
    Start-Sleep -Seconds $SleepSeconds; continue
  }
  $endStamp = (Get-Date).ToString('s')
  $secs = [int]((Get-Date) - $t0).TotalSeconds

  if ($output -match '(?i)\b429\b|quota|resource[_ ]exhausted|exhausted|rate limit|too many requests') {
    Write-Warning '  QUOTA ERROR from agy. Stopping the batch so nothing else burns quota.'
    Write-Log $slug $r.filename $startStamp $endStamp $secs 'quota-stop' $output
    break
  }

  # Prefer the requested destination; otherwise the newest image written into agy's own brain folder after start.
  $img = $null
  if ((Test-Path $dest) -and ((Get-Item $dest).LastWriteTime -ge $t0.AddSeconds(-2))) {
    $img = Get-Item $dest
  } else {
    foreach ($bd in @($BrainDir1,$BrainDir2)) {
      if (Test-Path $bd) {
        $cand = Get-ChildItem -Path $bd -Recurse -File -Include *.png,*.jpg,*.jpeg,*.webp -ErrorAction SilentlyContinue |
                Where-Object { $_.LastWriteTime -ge $t0.AddSeconds(-2) } |
                Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($cand) { $img = $cand; break }
      }
    }
  }

  if ($img) {
    if ($img.FullName -eq $dest -and $img.Extension -eq '.png') {
      Write-Host "  OK -> $dest  ($secs s)  [written directly]"
      Write-Log $slug $r.filename $startStamp $endStamp $secs 'success' ($img.FullName + ' ok (direct)')
    } elseif ($img.Extension -eq '.png') {
      Copy-Item -LiteralPath $img.FullName -Destination $dest -Force
      Write-Host "  OK -> $dest  ($secs s)"
      Write-Log $slug $r.filename $startStamp $endStamp $secs 'success' $img.FullName
    } else {
      & $PythonExe -c "from PIL import Image; Image.open(r'$($img.FullName)').convert('RGB').save(r'$dest','PNG')"
      if ($LASTEXITCODE -ne 0) {
        Copy-Item -LiteralPath $img.FullName -Destination $dest -Force
        Write-Warning "  PNG conversion failed; raw $($img.Extension) copied under .png name"
        Write-Log $slug $r.filename $startStamp $endStamp $secs 'success' ($img.FullName + " convert failed")
      } else {
        Write-Host "  OK -> $dest  ($secs s)  [converted from $($img.Extension)]"
        Write-Log $slug $r.filename $startStamp $endStamp $secs 'success' ($img.FullName + " converted from $($img.Extension)")
      }
    }
  } else {
    Write-Warning "  No new image found under the brain folders."
    Write-Log $slug $r.filename $startStamp $endStamp $secs 'no-image' $output
  }
  if ($n -lt $rows.Count) { Start-Sleep -Seconds $SleepSeconds }
}
Write-Host "Done. See $LogPath"
