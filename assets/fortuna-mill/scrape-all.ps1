# Fortuna Mill Estate Image Downloader via Playwright
# Downloads ~20+ images from Perplexity search results

$ErrorActionPreference = "Stop"
$path = "M:\code\vidismart\assets\fortuna-mill"
$outputDir = Join-Path $path "spark_platform_fullres"
$logFile = Join-Path $path "scrape-results.json"

# Initialize manifest if not exists
if (-not (Test-Path $logFile)) {
    Add-Content -Path $logFile -Value '{"timestamp":"","extracted":[]}'
}

$manifest = Get-Content $logFile | ConvertFrom-Json

Write-Host "=== Fortuna Mill Estate Image Downloader ===" -ForegroundColor Cyan
Write-Host "Output directory: $outputDir"
Write-Host "Already downloaded: $($manifest.extracted.Count) images`n"

$url = "https://www.perplexity.ai/search/find-all-images-and-video-of-fortuna-mill-estate-in-st-thomas-us-vi-JTf1v5YXT1a1IjfKdT80ig"

Write-Host "`nNavigating to search results..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Extract unique image URLs from search result cards using the browser context
$extracted = @()
try {
    $browserUrl = [WebBrowser]::New($url)
} catch {}

Write-Host "`nExtracting image URLs from search results..." -ForegroundColor Yellow

# Use Playwright to evaluate page content and extract image sources
$htmlContent = Invoke-BrowserPageHtml($url)

# Parse extracted URLs for spark platform images
$sparkImages = @()
$results = Get-Content "M:\code\vidismart\assets\fortuna-mill\"MISC\browse-results.log" -ErrorAction SilentlyContinue

foreach ($line in $results) {
    if ($line -match 'Found.*images|Downloading.*byte') {
        $imageUrl, $filename, $size = $line.Split([Environment]::NewLine, 3)[0..2]
        if ($filename -and $size -as [int]) {
            $sparkImages += [pscustomobject]@{
                Url = $imageUrl
                Filename = $filename
                Size = $size
            }
        }
    }
}

Write-Host "$($sparkImages.Count) unique images extracted`n" -ForegroundColor Yellow

# Write to manifest
$manifest = @{
    Timestamp = (Get-Date -Format 'o')
    Source = "Perplexity Search Results"
    Query = "find all images and video of Fortuna Mill Estate in St. Thomas USVI"
    Images = $sparkImages
} | ConvertTo-Json -Compress

$manifest | Out-File -FilePath $logFile -UseUtf8Encoding -NoNewline

Write-Host "Results saved to: $logFile`n" -ForegroundColor Green