<#
  agy-broll-batch.ps1 - one text-free b-roll still per engine via agy (Gemini, Google AI Pro quota, $0).
  Run on V20 FROM THIS FOLDER (M:\code\VidiFlow\out\engine-videos). One job at a time, 10 s apart.
  Stops on any 429 / quota / RESOURCE_EXHAUSTED text. Calls agy.exe directly because the
  PowerShell `agy` function wrapper rejects -p ("parameter name 'p' is ambiguous").
  Usage:  .\agy-broll-batch.ps1                 # all engines that don't have broll\<id>-broll.png yet
          .\agy-broll-batch.ps1 -Only claude-code
#>
param([string]$Only = '', [string]$Model = 'gemini-3.8-flash-high')
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$agy = 'C:\Users\James\AppData\Local\agy\bin\agy.exe'
New-Item -ItemType Directory -Force broll | Out-Null
$jobs = [ordered]@{
  'claude-code'   = 'warm amber (#d4a574) light threads flowing from a glowing terminal-like slab of dark glass into a lattice of code-shaped light blocks, developer workstation mood'
  'grok-bot'      = 'cool electric blue (#5b8cff) constellation of many small glowing orbs orbiting one bright core, like a fleet of helpers around a hub'
  'openclaw'      = 'violet (#a78bfa) mechanical claw-like light structure gently gripping floating glass tool tiles, gateway arch of light'
  'nvidia-nat'    = 'vivid green (#76b900) glowing graph of connected nodes above a dark GPU-like circuit landscape, data pulses moving along edges'
  'openai-codex'  = 'emerald (#10b981) streams of light passing through stacked translucent glass panes like parallel code workspaces, calm precise mood'
  'openai-dots'   = 'amber (#f59e0b) and white dots of light arranged in a living grid, some dots pulsing and passing light to neighbours, always-on teamwork mood'
  'gemini'        = 'blue to violet (#4285f4 to #a142f4) twin luminous star shapes with soft gradient light ribbons weaving between floating glass panels'
}
foreach ($id in $jobs.Keys) {
  if ($Only -and $id -ne $Only) { continue }
  $dest = "broll\$id-broll.png"
  if (Test-Path $dest) { Write-Host "skip $id (exists)"; continue }
  $p = "Use your image generation tool to create an image and save it as $dest. Prompt: Cinematic wide abstract scene, deep near-black navy background (#07090f), $($jobs[$id]), soft volumetric light, depth of field, premium tech-keynote look, lots of empty dark space on the left third for overlay text. Avoid: any text, letters, words, numbers, logos, watermarks, UI labels, people, faces. Output aspect 16:9 (1920 by 1080 pixels), PNG."
  Write-Host "[$id] rendering..."
  $o = & $agy --dangerously-skip-permissions -p $p --model $Model --print-timeout 8m 2>&1 | Out-String
  if ($o -match '(?i)\b429\b|quota|resource[_ ]exhausted|exhausted|rate limit|too many requests') { Write-Warning "quota/429 text from agy - stopping.`n$o"; break }
  if (Test-Path $dest) { Write-Host "  ok $dest" } else { Write-Warning "  no file at $dest`n$o" }
  Start-Sleep 10
}
