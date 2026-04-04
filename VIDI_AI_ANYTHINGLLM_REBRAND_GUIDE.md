# Vidi Ai — AnythingLLM Rebranding Guide

**Status as of 2026-03-24:** Rebranding ~95% complete. Loading screen video is the only remaining item.

---

## What Was Done & Why It Broke (History)

The original rebranding attempt (March 21, 2026) used PowerShell `Set-Content -Encoding UTF8` to modify files inside the app.asar. This writes a **UTF-8 BOM** (bytes `EF BB BF`) at the start of every file, which:
- **Broke `package.json`** → Electron crashed on startup with `SyntaxError: Error parsing app.asar\package.json: Unexpected token`
- **Corrupted 25 JS/SVG files** with the same BOM

The fix: extract from the original backup, replace only image files using binary copy, do any text edits with `[System.IO.File]::WriteAllText(path, content, $utf8NoBom)`.

---

## How the App Stores Its Files (Important)

AnythingLLM uses **Electron's ASAR format** — all app files are packed into a single archive file, like a zip. There are NO individual loose files in the installed app folder. To edit anything, you must:

1. **Extract** the asar to a temp folder
2. **Edit** the files in the temp folder
3. **Repack** back into a new asar
4. **Copy** the new asar over the installed one

```
THE ONLY FILE THAT MATTERS (the "zip" that contains everything):
C:\Users\James\AppData\Local\Programs\AnythingLLM\resources\app.asar   ← 39.7 MB

WORKING TEMP FOLDER (extracted copy — this is where you edit):
C:\Temp\asar-clean\   ← edit files here, then repack

ORIGINAL UNTOUCHED BACKUP:
C:\Backup\anythingllm-original-20260321-173735\resources\app.asar   ← never touch this
```

---

## Every File That Was Changed + Its Internal Path

These are the **internal paths inside the asar** (i.e., paths within `C:\Temp\asar-clean\`).
When packed, they live inside `app.asar` — not as separate files on disk.

### ✅ Already Replaced — Images & Icons
| Internal asar path | What it is | Replaced with |
|--------------------|------------|---------------|
| `dist\anything-llm-dark.png` | Main app dark logo 512px | `C:\Temp\vidi-ai-logos\vidi-ai-dark-512.png` |
| `dist\anything-llm-light.png` | Main app light logo 512px | `C:\Temp\vidi-ai-logos\vidi-ai-light-512.png` |
| `dist\favicon.ico` | Browser tab favicon ICO | `C:\Temp\vidi-ai-logos\vidi-ai-favicon.ico` |
| `dist\favicon.png` | Browser tab favicon PNG | `C:\Temp\vidi-ai-logos\vidi-ai-favicon.png` |
| `dist\tray.png` | System tray icon PNG | `C:\Temp\vidi-ai-logos\vidi-ai-tray-512.png` |
| `dist\tray.ico` | System tray icon ICO | `C:\Temp\vidi-ai-logos\vidi-ai-favicon.ico` |
| `dist\trayTemplate.png` | macOS tray template | `C:\Temp\vidi-ai-logos\vidi-ai-trayTemplate-512.png` |
| `dist\trayTemplate@2x.png` | macOS tray template 2x | `C:\Temp\vidi-ai-logos\vidi-ai-trayTemplate-512.png` |
| `dist\assets\anything-llm-cb2c422e.png` | UI icon 128px | `C:\Temp\vidi-ai-logos\assets\vidi-ai-icon-128.png` |
| `dist\assets\anything-llm-dark-c251ee6f.png` | UI icon 256px dark | `C:\Temp\vidi-ai-logos\assets\vidi-ai-icon-256.png` |
| `dist\assets\anything-llm-icon-4682b8d2.png` | UI icon 256px | `C:\Temp\vidi-ai-logos\assets\vidi-ai-icon-256.png` |

### ✅ Already Replaced — SVG Logos (login/header)
| Internal asar path | What it is |
|--------------------|------------|
| `dist\assets\login-logo-893f9fb0.svg` | Header logo (dark mode) — written as Vidi Ai SVG |
| `dist\assets\login-logo-light-a4ea55fb.svg` | Header logo (light mode) — written as Vidi Ai SVG |

### ✅ Already Changed — Text in JS/HTML
| Internal asar path | Change made |
|--------------------|-------------|
| `dist\index.html` | Title + all meta tags → "Vidi Ai \| AI-Powered Knowledge Base" |
| `dist-electron\main\index.js` | Tray tooltip → "Vidi Ai" |
| `dist-electron\main\index.js` | Browser tool window title → "Vidi Ai Browser Tool" |
| `dist-electron\main\index.js` | Meeting notification text → "Let Vidi Ai take notes..." |

### ⏳ Still Needs Replacing — Loading Screen Videos
| Internal asar path | Working copy full path | What it is |
|--------------------|----------------------|------------|
| `dist\assets\dark-a267ebfb.webm` | `C:\Temp\asar-clean\dist\assets\dark-a267ebfb.webm` | Boot animation (dark/black background) |
| `dist\assets\light-beab0861.webm` | `C:\Temp\asar-clean\dist\assets\light-beab0861.webm` | Boot animation (light/white background) |

### Vidi Ai Logo Source Files (keep these safe)
```
C:\Temp\vidi-ai-logos\
  vidi-ai-dark-512.png          ← 512×512 dark logo
  vidi-ai-light-512.png         ← 512×512 light logo
  vidi-ai-favicon.ico           ← favicon ICO
  vidi-ai-favicon.png           ← favicon PNG (32×32)
  vidi-ai-tray-512.png          ← tray icon
  vidi-ai-trayTemplate-512.png  ← tray template (monochrome)
  assets\
    vidi-ai-icon-128.png        ← UI icon 128px
    vidi-ai-icon-256.png        ← UI icon 256px
    vidi-ai-header.svg          ← SVG header logo
```

---

## The Loading Screen Animation

### How It Works
The loading screen plays a **WebM video** full-screen when the app boots. Defined in `dist/assets/main-84f50698.js`:

```javascript
// React component _o — renders loading video until server is ready
const sa = "" + new URL("light-beab0861.webm", import.meta.url).href  // light mode
const aa = "" + new URL("dark-a267ebfb.webm", import.meta.url).href   // dark mode

// Video element plays at 8x speed, then shows app when "ended" fires
<video ref={s} src={a ? sa : aa} autoPlay muted loop={false} controls={false}
  className="w-full h-full object-fit" playbackRate={8} />
```

### To Replace the Loading Video
1. Create your Vidi Ai branded video in After Effects (or any tool)
2. Export as **WebM** format
3. **Recommended specs:**
   - Resolution: 1920×1080 (or 1280×720)
   - Duration: 2–5 seconds (plays at 8× speed = under 1 second on screen)
   - Dark background version → replaces `dark-a267ebfb.webm`
   - Light background version → replaces `light-beab0861.webm`
   - File size: keep under 300KB if possible
4. Drop the files into `C:\Temp\asar-clean\dist\assets\` with the **exact same filenames**
5. Run the repack + deploy commands below

---

## Repack & Deploy Commands

Run these in PowerShell **every time you change files in `C:\Temp\asar-clean\`**:

```powershell
# 1. Stop the app
Stop-Process -Name 'AnythingLLM' -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Repack the asar
Remove-Item 'C:\Temp\vidi-ai-clean.asar' -Force -ErrorAction SilentlyContinue
npx asar pack 'C:\Temp\asar-clean' 'C:\Temp\vidi-ai-clean.asar'

# 3. Deploy
Copy-Item 'C:\Temp\vidi-ai-clean.asar' `
  'C:\Users\James\AppData\Local\Programs\AnythingLLM\resources\app.asar' -Force

Write-Host "Done. Size:" (Get-Item 'C:\Users\James\AppData\Local\Programs\AnythingLLM\resources\app.asar').Length
```

---

## How to Edit Files Inside the Asar (WITHOUT Breaking It)

### NEVER use `Set-Content` — it adds BOM and breaks JSON/JS
```powershell
# ❌ WRONG — adds UTF-8 BOM
Set-Content $path -Value $content -Encoding UTF8

# ✅ CORRECT — no BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
```

### Safe text replacement pattern
```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$path = "C:\Temp\asar-clean\dist\index.html"
$content = [System.IO.File]::ReadAllText($path)
$content = $content.Replace('OldText', 'NewText')
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
```

### Safe binary file replacement (images/video)
```powershell
# Just Copy-Item — binary files don't have encoding issues
Copy-Item "C:\path\to\new-logo.png" "C:\Temp\asar-clean\dist\assets\anything-llm-dark.png" -Force
```

---

## Complete Rebranding Checklist

| Item | File | Status |
|------|------|--------|
| Title bar text | `dist/index.html` | ✅ "Vidi Ai \| AI-Powered Knowledge Base" |
| Meta tags | `dist/index.html` | ✅ Updated |
| Sidebar logo | `dist/assets/login-logo-893f9fb0.svg` | ✅ Vidi Ai SVG |
| Sidebar logo (light) | `dist/assets/login-logo-light-a4ea55fb.svg` | ✅ Vidi Ai SVG |
| App icon (main) | `dist/anything-llm-dark.png` | ✅ Vidi Ai 512px |
| App icon (light) | `dist/anything-llm-light.png` | ✅ Vidi Ai 512px |
| Favicon ICO | `dist/favicon.ico` | ✅ Vidi Ai |
| Favicon PNG | `dist/favicon.png` | ✅ Vidi Ai |
| Tray icon | `dist/tray.png` + `tray.ico` | ✅ Vidi Ai |
| Tray tooltip text | `dist-electron/main/index.js` | ✅ "Vidi Ai" |
| Browser tool title | `dist-electron/main/index.js` | ✅ "Vidi Ai Browser Tool" |
| Asset icon 128px | `dist/assets/anything-llm-cb2c422e.png` | ✅ Vidi Ai |
| Asset icon 256px | `dist/assets/anything-llm-dark-c251ee6f.png` | ✅ Vidi Ai |
| Asset icon 256px | `dist/assets/anything-llm-icon-4682b8d2.png` | ✅ Vidi Ai |
| **Loading screen dark** | `dist/assets/dark-a267ebfb.webm` | ⏳ Needs new WebM video |
| **Loading screen light** | `dist/assets/light-beab0861.webm` | ⏳ Needs new WebM video |

---

## Rollback to Original

```powershell
Stop-Process -Name 'AnythingLLM' -Force -ErrorAction SilentlyContinue
Copy-Item -Path "C:\Backup\anythingllm-original-20260321-173735\resources\app.asar" `
  -Destination "C:\Users\James\AppData\Local\Programs\AnythingLLM\resources\app.asar" -Force
Write-Host "Rolled back to original AnythingLLM"
```

---

## Starting Over From Scratch (if C:\Temp\asar-clean is lost)

```powershell
# 1. Extract from original backup
npx asar extract 'C:\Backup\anythingllm-original-20260321-173735\resources\app.asar' 'C:\Temp\asar-clean'

# 2. Replace all images (binary copy — safe)
$src = 'C:\Temp\vidi-ai-logos'
$dst = 'C:\Temp\asar-clean'
Copy-Item "$src\vidi-ai-dark-512.png"         "$dst\dist\anything-llm-dark.png"   -Force
Copy-Item "$src\vidi-ai-light-512.png"        "$dst\dist\anything-llm-light.png"  -Force
Copy-Item "$src\vidi-ai-favicon.ico"          "$dst\dist\favicon.ico"             -Force
Copy-Item "$src\vidi-ai-favicon.png"          "$dst\dist\favicon.png"             -Force
Copy-Item "$src\vidi-ai-tray-512.png"         "$dst\dist\tray.png"                -Force
Copy-Item "$src\vidi-ai-favicon.ico"          "$dst\dist\tray.ico"                -Force
Copy-Item "$src\vidi-ai-trayTemplate-512.png" "$dst\dist\trayTemplate.png"        -Force
Copy-Item "$src\vidi-ai-trayTemplate-512.png" "$dst\dist\trayTemplate@2x.png"     -Force
Copy-Item "$src\assets\vidi-ai-icon-128.png"  "$dst\dist\assets\anything-llm-cb2c422e.png"    -Force
Copy-Item "$src\assets\vidi-ai-icon-256.png"  "$dst\dist\assets\anything-llm-dark-c251ee6f.png" -Force
Copy-Item "$src\assets\vidi-ai-icon-256.png"  "$dst\dist\assets\anything-llm-icon-4682b8d2.png" -Force

# 3. Fix text files (NO BOM — use WriteAllText)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# index.html — title and meta
$p = "$dst\dist\index.html"
$c = [System.IO.File]::ReadAllText($p)
$c = $c.Replace('AnythingLLM | Superpowers for your OS using local AI', 'Vidi Ai | AI-Powered Knowledge Base')
[System.IO.File]::WriteAllText($p, $c, $utf8NoBom)

# main electron JS — tray tooltip and browser tool title
$p2 = "$dst\dist-electron\main\index.js"
$c2 = [System.IO.File]::ReadAllText($p2)
$c2 = $c2.Replace('"AnythingLLM Browser Tool"', '"Vidi Ai Browser Tool"')
$c2 = $c2.Replace('"Let AnythingLLM take notes', '"Let Vidi Ai take notes')
$c2 = $c2.Replace('setToolTip("AnythingLLM")', 'setToolTip("Vidi Ai")')
[System.IO.File]::WriteAllText($p2, $c2, $utf8NoBom)

# 4. Write SVG login logos (no BOM)
$svgDark = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs><circle cx="28" cy="30" r="20" fill="url(#g)"/><text x="28" y="36" font-family="Arial,sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">V</text><text x="62" y="38" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="white">Vidi</text><text x="118" y="38" font-family="Arial,sans-serif" font-size="28" font-weight="300" fill="#a5b4fc"> Ai</text></svg>'
$svgLight = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 60" width="220" height="60"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#6366f1"/><stop offset="100%" style="stop-color:#8b5cf6"/></linearGradient></defs><circle cx="28" cy="30" r="20" fill="url(#g)"/><text x="28" y="36" font-family="Arial,sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">V</text><text x="62" y="38" font-family="Arial,sans-serif" font-size="28" font-weight="bold" fill="#1e1b4b">Vidi</text><text x="118" y="38" font-family="Arial,sans-serif" font-size="28" font-weight="300" fill="#4338ca"> Ai</text></svg>'
[System.IO.File]::WriteAllText("$dst\dist\assets\login-logo-893f9fb0.svg", $svgDark, $utf8NoBom)
[System.IO.File]::WriteAllText("$dst\dist\assets\login-logo-light-a4ea55fb.svg", $svgLight, $utf8NoBom)

# 5. Repack and deploy
npx asar pack 'C:\Temp\asar-clean' 'C:\Temp\vidi-ai-clean.asar'
Copy-Item 'C:\Temp\vidi-ai-clean.asar' 'C:\Users\James\AppData\Local\Programs\AnythingLLM\resources\app.asar' -Force
Write-Host "Done!"
```

---

*Last updated: 2026-03-24 | AnythingLLM v1.11.2 | Rebranded to Vidi Ai*
