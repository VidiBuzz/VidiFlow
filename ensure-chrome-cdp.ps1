# Ensure Chrome with CDP is always running on port 9000
# This script checks if Chrome is listening on port 9000 and starts it if not

$port = 9000
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$userDataDir = "C:\Users\James\AppData\Local\Temp\chrome-cdp-profile"

# Check if anything is listening on port 9000
$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue

if ($listener) {
    Write-Host "Chrome CDP is already running on port $port" -ForegroundColor Green
    exit 0
}

Write-Host "Chrome CDP not found on port $port. Starting Chrome with remote debugging..." -ForegroundColor Yellow

# Start Chrome with remote debugging enabled
$process = Start-Process -FilePath $chromePath -ArgumentList "--remote-debugging-port=$port", "--user-data-dir=$userDataDir" -PassThru

# Wait a moment for Chrome to start
Start-Sleep -Seconds 3

# Verify it's running
$listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($listener) {
    Write-Host "Chrome CDP started successfully on port $port (PID: $($process.Id))" -ForegroundColor Green
} else {
    Write-Host "Failed to start Chrome CDP on port $port" -ForegroundColor Red
    exit 1
}
