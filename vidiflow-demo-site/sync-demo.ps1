# Sync vidiflow-demo-site with the latest source pages + images.
# Run from anywhere: powershell -File vidiflow-demo-site\sync-demo.ps1
$ErrorActionPreference = 'Stop'
$root = 'M:\code\vidismart'
$site = "$root\vidiflow-demo-site"

$flat = @{
  "$root\vidiflow\AGENT_BRIDGE.html"               = 'AGENT_BRIDGE.html'
  "$root\vidiflow\AGENT_ORG.html"                  = 'AGENT_ORG.html'
  "$root\vidiflow\AGENT_CONTROL_DASHBOARD.html'    = 'AGENT_CONTROL_DASHBOARD.html'
  "$root\vidiflow\PROJECT_DASHBOARD.html"          = 'PROJECT_DASHBOARD.html'
  "$root\vidiflow\AGENT_PLATFORM_COMPARISON.html"  = 'AGENT_PLATFORM_COMPARISON.html'
  "$root\vidiflow-force-graph.html"                = 'vidiflow-force-graph.html'
  "$root\vidiflow-status-orb.html"                 = 'vidiflow-status-orb.html'
  "$root\vidiflow-data-flow.html"                  = 'vidiflow-data-flow.html'
  "$root\VIDISHOP-INTERFACE-SPEC.html"             = 'VIDISHOP-INTERFACE-SPEC.html'
}
foreach ($k in $flat.Keys) { Copy-Item $k "$site\$($flat[$k])" -Force }

New-Item -ItemType Directory -Force -Path "$site\monetization" | Out-Null
Copy-Item "$root\monetization\vidiflow-lex.html" "$site\monetization\vidiflow-lex.html" -Force
Copy-Item "$root\monetization\assets" "$site\monetization\assets" -Recurse -Force
Copy-Item "$root\images\org-head-*.png", "$root\images\viditwin_lexi_avatar.png", "$root\images\viditwin_max_avatar.png" "$site\images" -Force -ErrorAction SilentlyContinue
Write-Host "demo site synced: $site"
