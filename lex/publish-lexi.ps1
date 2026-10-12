# Lexi one-click publish (Windows PowerShell 5.1+, no admin required).
#
# What it does, in order:
#   1. sanity-checks the toolchain (Python 3.14, Node, optional JDK/Android SDK)
#   2. regenerates lex/extension/data.js (15 terms) + lex/data/published-terms.json from the seed
#   3. packages lex/extension into downloads/lexi-extension-v<version>.zip and prints the sha256
#   4. uploads it to R2 -> https://cdn.vidi.news/downloads/lexi-extension-latest.zip
#      (the URL the install button points at; replaces the 404 on vidiflow.net)
#   5. verifies the published URLs return 200 and prints their sizes
#   6. builds the Lexi Android debug APK when a JDK + SDK exist, otherwise prints install commands
#
# Usage:
#   publish-lexi.cmd                  (double-click, or run from a terminal)
#   powershell -ExecutionPolicy Bypass -File publish-lexi.ps1
#   publish-lexi.ps1 -SkipAndroid     (web/extension part only)
#   publish-lexi.ps1 -PublishTerms    (also upload lexi/terms.json for extension/Android sync)
param(
    [switch]$SkipAndroid,
    [switch]$PublishTerms
)

$ErrorActionPreference = "Stop"
$Root    = "M:\code\vidismart"
$Lex     = Join-Path $Root "lex"
$Python  = "C:\Python314\python.exe"
$Account = "5830508745fd2ac063426ebf9429c22d"
$Bucket  = "vidismart"
$Cdn     = "https://cdn.vidi.news"

function Step($text) { Write-Host ""; Write-Host "== $text" -ForegroundColor Cyan }
function Ok($text)   { Write-Host "   OK  $text" -ForegroundColor Green }
function Warn($text) { Write-Host "   !!  $text" -ForegroundColor Yellow }
function Die($text)  { Write-Host "   XX  $text" -ForegroundColor Red; exit 1 }

# ---------------------------------------------------------------- 1. toolchain
Step "1/6  Toolchain"
if (-not (Test-Path $Python)) { Die "Python not found at $Python (AGENTS.md pins C:\Python314\python.exe)" }
Ok "python  $Python"

$node = Get-Command node -ErrorAction SilentlyContinue
if ($node) { Ok "node    $($node.Source)" } else { Warn "node not on PATH (only build_prompt_pack.py needs it)" }

$javaHome = $env:JAVA_HOME
$javac    = Get-Command javac -ErrorAction SilentlyContinue
$sdk      = $env:ANDROID_HOME
if (-not $sdk) { $sdk = $env:ANDROID_SDK_ROOT }
$haveAndroid = $false
if ($javaHome -or $javac) {
    $haveAndroid = $true
    if ($javaHome) { Ok "jdk     $javaHome" } else { Ok "jdk     $($javac.Source)" }
} else { Warn "no JDK found (Android build will be skipped)" }
if ($sdk -and (Test-Path $sdk)) { Ok "sdk     $sdk" } else { Warn "no Android SDK found (ANDROID_HOME / ANDROID_SDK_ROOT)" }

# ---------------------------------------------------------------- 2. dictionary
Step "2/6  Rebuild the dictionary from lex\data\seed-unified.json"
& $Python (Join-Path $Lex "pipeline\build_extension_data.py") --check
if ($LASTEXITCODE -ne 0) { Warn "validation flagged problems (see above) - continuing" }
& $Python (Join-Path $Lex "pipeline\build_extension_data.py")
if ($LASTEXITCODE -ne 0) { Die "build_extension_data.py failed" }
Ok "data.js + published-terms.json regenerated"

# ---------------------------------------------------------------- 3. package
Step "3/6  Package the extension"
& $Python (Join-Path $Lex "pipeline\package_extension.py")
if ($LASTEXITCODE -ne 0) { Die "package_extension.py failed" }

$version = (Get-Content (Join-Path $Lex "extension\manifest.json") -Raw | ConvertFrom-Json).version
$zip     = Join-Path $Root "downloads\lexi-extension-v$version.zip"
if (-not (Test-Path $zip)) { Die "expected zip missing: $zip" }
Ok "zip      $zip ($((Get-Item $zip).Length) bytes)"

# ---------------------------------------------------------------- 4. token + upload
Step "4/6  Publish to cdn.vidi.news (R2)"
$token = $env:CF_API_TOKEN
if (-not $token) {
    Write-Host "   Need a Cloudflare API token with 'Workers R2 Storage: Edit'"
    Write-Host "   (dashboard.cloudflare.com > My Profile > API Tokens). Input is hidden."
    $secure = Read-Host "   CF_API_TOKEN" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $token = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}
if (-not $token) {
    Warn "no token - skipping the upload."
    Warn "The zip is still usable: drag $zip into the '$Bucket' R2 bucket as downloads/lexi-extension-latest.zip"
} else {
    $env:CF_API_TOKEN = $token
    Ok "token acquired (never printed)"
    & $Python (Join-Path $Lex "pipeline\package_extension.py") --upload
    if ($LASTEXITCODE -ne 0) { Die "upload failed - see the message above" }

    if ($PublishTerms) {
        $termsFile = Join-Path $Lex "data\published-terms.json"
        if (Test-Path $termsFile) {
            $bytes = [IO.File]::ReadAllBytes($termsFile)
            $apiUrl = "https://api.cloudflare.com/client/v4/accounts/$Account/r2/buckets/$Bucket/objects/lexi/terms.json"
            $hdrs = @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" }
            try {
                Invoke-WebRequest -Uri $apiUrl -Method Put -Headers $hdrs -Body $bytes -UseBasicParsing | Out-Null
                Ok "uploaded $Cdn/lexi/terms.json ($($bytes.Length) bytes)"
            } catch { Warn "terms.json upload failed: $($_.Exception.Message)" }
        } else { Warn "published-terms.json not found" }
    }
}

# ---------------------------------------------------------------- 5. verify
Step "5/6  Verify the public URLs"
foreach ($u in @("$Cdn/downloads/lexi-extension-latest.zip", "$Cdn/downloads/lexi-extension-v$version.zip")) {
    try {
        $r = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing
        Ok "$u -> HTTP $($r.StatusCode), $($r.Headers['Content-Length']) bytes, $($r.Headers['Content-Type'])"
    } catch { Warn "$u -> $($_.Exception.Message)" }
}

# ---------------------------------------------------------------- 6. Android
if ($SkipAndroid) {
    Step "6/6  Android build skipped (-SkipAndroid)"
} elseif ($haveAndroid -and $sdk -and (Test-Path $sdk)) {
    Step "6/6  Build the Lexi Android debug APK"
    $androidDir = Join-Path $Lex "android"
    $gradlew = Join-Path $androidDir "gradlew.bat"
    if (-not (Test-Path $gradlew)) {
        Warn "gradlew.bat is not present (gradle-wrapper.jar is binary and not in git)."
        Warn "Open $androidDir in Android Studio once - it generates the wrapper - then re-run this script."
    } else {
        Push-Location $androidDir
        & $gradlew :app:assembleDebug
        if ($LASTEXITCODE -ne 0) { Warn "gradle reported errors - the first build usually needs a couple of fixes" }
        else { Ok "APK: $androidDir\app\build\outputs\apk\debug\app-debug.apk" }
        Pop-Location
    }
} else {
    Step "6/6  Android build needs a toolchain (not installed on this machine)"
    Write-Host "   Install:"
    Write-Host "     winget install --id Microsoft.OpenJDK.17"
    Write-Host "     winget install --id Google.AndroidStudio"
    Write-Host "   then open $Lex\android in Android Studio (it creates gradlew), set ANDROID_HOME,"
    Write-Host "   and re-run this script."
}

Step "Done"
Write-Host "   Install button URL : $Cdn/downloads/lexi-extension-latest.zip" -ForegroundColor Green
Write-Host "   Local zip          : $zip"
Write-Host "   Landing page CTA   : already added to lex\app\index.html and monetization\vidiflow-lex.html"
Write-Host "   Still to deploy    : the two HTML files above to the vidiflow.net origin (tunnel/box is unreachable from here)"
