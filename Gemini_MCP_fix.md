# Gemini MCP Fix: Google Drive Auth & Path Bug

## The Problem
The official `@modelcontextprotocol/server-gdrive` package was technically archived and is no longer officially supported. This causes it to have an extremely buggy path resolution on Windows and WSL, often crashing with the following error:
`Error: Cannot find module 'M:\code\vidismart\$HOME\.config\google-mcp\gcp-oauth.keys.json'`

This happens because the package blindly tries to mash a Linux `$HOME` variable with your Windows paths if the environment settings aren't strictly passed in.

Additionally, if the OAuth tokens expire (which happens naturally every 7 days if your Google Cloud app is in "Testing" mode), it throws the fatal error: 
`Credentials not found. Please run with 'auth' argument first. : calling "initialize": EOF`

## The Solution

To fix this, we bypass the buggy `$HOME` path logic completely by feeding the exact paths of the credentials into both your Terminal (for the authentication step) and your `mcp_config.json` (for the background server process).

### Step 1: Re-authenticate in Native Windows
Because running `npx auth` in WSL fails to launch a browser properly, you must run the auth flow in a **native Windows PowerShell** or Command Prompt so it can physically open your web browser. 

Open **PowerShell**, navigate to `M:\code\vidismart`, and run:
```powershell
$env:GDRIVE_OAUTH_PATH="m:\code\vidismart\gcp-oauth.keys.json"
$env:GDRIVE_CREDENTIALS_PATH="m:\code\vidismart\.gdrive-credentials\credentials.json"
npx -y @modelcontextprotocol/server-gdrive auth
```
*(Complete the login in your web browser. When it finishes, you should see "Credentials saved. You can now run the server.")*

### Step 2: The Permanent Config Fix
To prevent the `$HOME` error from happening when the Agent starts up, ensure your `C:\Users\James\.gemini\antigravity\mcp_config.json` file contains those exact paths inside an `env` block under the `google-drive` server definition:

```json
    "google-drive": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gdrive@latest"
      ],
      "env": {
        "GDRIVE_OAUTH_PATH": "m:\\code\\vidismart\\gcp-oauth.keys.json",
        "GDRIVE_CREDENTIALS_PATH": "m:\\code\\vidismart\\.gdrive-credentials\\credentials.json"
      }
    }
```

Once saved, reload your IDE or agent, and the server will boot up flawlessly using those explicit, safe credential paths.
