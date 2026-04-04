# Google Drive MCP Setup Guide (Cline)

The Google Drive MCP server has been added to your Cline configuration in VS Code. To use it with your Google account, you need to complete the OAuth authentication setup.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it something like "VidiSmart MCP" or "Continue AI"
4. Click "Create"

## Step 2: Enable Google Drive API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal if using Google Workspace)
3. Fill in:
   - App name: "Continue AI - Google Drive"
   - User support email: Your email
   - Developer contact: Your email
4. Click **Save and Continue**
5. Add scopes: Add `https://www.googleapis.com/auth/drive.readonly` (or `https://www.googleapis.com/auth/drive` for full access)
6. Click **Save and Continue**

## Step 4: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Desktop app**
4. Name: "Continue MCP Client"
5. Click **Create**
6. Click **Download JSON** (or the download icon)
7. Save the file as `gcp-oauth.keys.json`

## Step 5: Place Credentials File

Place the downloaded `gcp-oauth.keys.json` file in one of these locations:

- **Option A**: In your Continue config directory (usually `~/.continue/`)
- **Option B**: In this project directory: `m:\code\vidismart\`

## Step 6: Restart VS Code

1. Close and reopen VS Code
2. When you first use a Google Drive tool in Cline, a browser window will open
3. Sign in with your Google account and authorize the app
4. Your credentials will be saved automatically for future use

---

## Troubleshooting

- If authentication doesn't trigger automatically, you may need to run: `npx -y @modelcontextprotocol/server-gdrive` manually in terminal first
- Make sure the OAuth credentials file is named exactly `gcp-oauth.keys.json`
- Ensure you've enabled the Google Drive API in your Google Cloud project
- Check Cline's MCP server status in the Cline panel
