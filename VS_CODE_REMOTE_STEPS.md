# EXACT STEPS TO CONNECT TO SITEGROUND IN VS CODE

## ✅ Setup is COMPLETE - Here's What to Click:

### Method 1: Command Palette (FASTEST)

1. **Press `F1`** (or `Ctrl+Shift+P`)
2. **Type:** `remote ssh connect`
3. **Click:** "Remote-SSH: Connect to Host..."
4. **Select one of these:**
   - `vidicity` (VidiCity.net - RECOMMENDED)
   - `siteground` (same as vidicity)
   - `vidismart-main` (VidiSmart.com main site)
5. **Click:** "Linux" when asked to select platform
6. **Wait** for connection (you'll see a new VS Code window open)

### Method 2: Remote Explorer Icon (VISUAL)

1. **Look at the left sidebar** in VS Code
2. **Click the icon** that looks like: `><` (computer monitor with arrow)
   - It's called "Remote Explorer"
   - Usually near the bottom of the sidebar icons
3. **In the dropdown at top**, select "SSH"
4. **You'll see your hosts listed:**
   - vidicity
   - siteground
   - vidismart-main
5. **Hover over one** and click the **folder icon** (→) that appears
6. **New window opens** - you're connected!

### Method 3: Bottom-Left Green Button

1. **Look at bottom-left corner** of VS Code
2. **Click the green button** that says "><" or "Open Remote Window"
3. **Select:** "Connect to Host..."
4. **Choose:** `vidicity` or `siteground`

---

## WHAT YOU'LL SEE WHEN CONNECTED:

- **Bottom-left corner** will show: "SSH: vidicity"
- **File Explorer** will show remote server files
- **Terminal** will be on the remote server

## IF YOU DON'T SEE REMOTE EXPLORER:

### Install the Extension:

1. Press `Ctrl+Shift+X` (Extensions)
2. Search: `Remote - SSH`
3. Install: **"Remote - SSH"** by Microsoft (official extension)
4. Reload VS Code (`Ctrl+R`)
5. Try again!

### Check Installation:

```bash
# In VS Code terminal, run:
code --list-extensions | grep remote
```

Should show:
- `ms-vscode-remote.remote-ssh`
- `ms-vscode-remote.remote-ssh-edit`

---

## VERIFY YOUR SSH CONFIG IS WORKING:

Open a terminal and run:

```bash
# Test connection
ssh vidicity

# Should connect without asking for password
# You'll see: "exec request failed on channel 0" - THIS IS NORMAL
```

If you see "Permission denied", run:

```bash
chmod 600 ~/.ssh/vidismart-deploy
```

---

## PATHS ON REMOTE SERVER:

Once connected to **vidicity**:
- Main site: `/home/customer/www/vidicity.net/public_html/`
- WordPress: `/home/customer/www/vidicity.net/public_html/wp-content/`
- Logs: `/home/customer/www/vidicity.net/logs/`

Once connected to **vidismart-main**:
- Main site: `/home/customer/www/vidismart.com/public_html/`

---

## TROUBLESHOOTING:

### "Could not establish connection"
1. Check internet connection
2. Try: `ssh vidicity` in terminal first
3. Reload VS Code window (`Ctrl+R`)

### "No Remote SSH extension"
1. Install: `ms-vscode-remote.remote-ssh`
2. Reload VS Code

### "Bad configuration option"
1. Check: `C:\Users\James\.ssh\config`
2. Should have `Host vidicity` entry

### Still not working?
Run this in terminal:
```bash
ssh -v vidicity 2>&1 | head -30
```

Send me the output and I'll debug it.

---

## RAILWAY ACCESS (Bonus):

For Railway, you can't use Remote SSH (containers are ephemeral).

Instead, use Railway CLI in VS Code terminal:

```bash
# Login
npx @railway/cli login

# Link project
npx @railway/cli link

# Open shell in container
npx @railway/cli shell
```

---

## QUICK TEST:

1. Press `F1`
2. Type `remote ssh connect`
3. Click "Connect to Host"
4. Select `vidicity`
5. Wait 10 seconds
6. You should see "SSH: vidicity" in bottom-left corner

**DONE!**
