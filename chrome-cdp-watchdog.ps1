# Chrome CDP Watchdog - Runs continuously to ensure Chrome stays running on port 9000
# This script should be run at Windows startup

$port = 9000
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$userDataDir = "C:\Users\James\AppData\Local\Temp\chrome-cdp-profile"
$checkInterval = 30  # Check every 30 seconds

Write-Host "Chrome CDP Watchdog started. Monitoring port $port..." -ForegroundColor Cyan

while ($true) {
    # Check if anything is listening on port 9000
    $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    
    if (-not $listener) {
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Chrome CDP not running. Restarting..." -ForegroundColor Yellow
        
        # Start Chrome with remote debugging enabled
        $process = Start-Process -FilePath $chromePath -ArgumentList "--remote-debugging-port=$port", "--user-data-dir=$userDataDir" -PassThru
        
        # Wait for Chrome to start
        Start-Sleep -Seconds 3
        
        # Verify it's running
        $listener = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        if ($listener) {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - Chrome CDP restarted successfully (PID: $($process.Id))" -ForegroundColor Green
        } else {
            Write-Host "$(Get-Date -Format 'HH:mm:ss') - Failed to restart Chrome CDP" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds $checkInterval
}
