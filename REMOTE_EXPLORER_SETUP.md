# VS Code Remote Explorer Setup Guide

## Overview

This guide explains how to use VS Code Remote Explorer to connect to your SiteGround servers and Railway deployments.

## ✅ Setup Complete

The following configurations have been added:

1. **SSH Config**: `C:\Users\James\.ssh\config`
2. **VS Code Settings**: `.vscode\settings.json`
3. **Railway CLI**: Installed globally via npm

## SiteGround Connections

### Available Hosts

You can now connect to these servers via VS Code Remote Explorer:

#### 1. **vidicity** (VidiCity.net - Primary)
```
Host: vidicity
Server: sftp.siteground.net
Port: 18765
User: sftp6806-64fc400c
Path: /home/customer/www/vidicity.net/
```

#### 2. **siteground** (Alias for backward compatibility)
Same as vidicity - use this if you're used to typing "siteground"

#### 3. **vidismart-main** (VidiSmart.com Main Site)
```
Host: vidismart-main
Server: gtxm1044.siteground.biz
Port: 18765
User: u2627-m33aqlpqghg3
Path: /home/customer/www/vidismart.com/public_html/
```

### How to Connect via VS Code

1. **Install Remote - SSH Extension** (if not already installed)
   - Press `Ctrl+Shift+X`
   - Search for "Remote - SSH"
   - Install the extension by Microsoft

2. **Open Remote Explorer**
   - Press `Ctrl+Shift+P`
   - Type "Remote-SSH: Connect to Host"
   - Select one of: `vidicity`, `siteground`, or `vidismart-main`

3. **Alternative Method**
   - Click the Remote Explorer icon in the left sidebar (looks like ><)
   - Click the "SSH Targets" dropdown
   - Click the folder icon next to your desired host

### Command Line Access

You can also SSH directly from terminal:

```bash
# Connect to VidiCity.net
ssh vidicity

# Connect to VidiSmart.com
ssh vidismart-main

# SFTP file transfer
sftp vidicity
```

### Common SiteGround Paths

Once connected, navigate to:

- **VidiCity.net**: `/home/customer/www/vidicity.net/public_html/`
- **VidiSmart.com**: `/home/customer/www/vidismart.com/public_html/`
- **Logs**: `/home/customer/www/*/logs/`
- **Config files**: `public_html/.htaccess`, `public_html/wp-config.php`

## Railway Connections

### Setup Railway Access

1. **Login to Railway**
   ```bash
   railway login
   ```
   This will open your browser for authentication.

2. **Link to Your Project**
   ```bash
   cd /mnt/m/code/vidismart
   railway link
   ```
   Select your project from the list.

3. **List Your Services**
   ```bash
   railway status
   ```

### Railway CLI Commands

```bash
# View service logs
railway logs

# Run commands in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# Deploy current directory
railway up

# SSH into Railway container (if enabled)
railway connect
```

### Railway SSH Access

Railway containers are **ephemeral** and don't support traditional SSH by default. Options:

#### Option 1: Railway Shell (Recommended)
```bash
railway shell
```
This gives you an interactive shell in your deployed container.

#### Option 2: TCP Proxy (Advanced)
If you need persistent SSH access, you'll need to:
1. Expose port 22 in your Railway service
2. Add SSH server to your Docker container
3. Use Railway's TCP proxy feature

**Not recommended** for most use cases - use `railway shell` instead.

### VS Code + Railway

For Railway, use the **built-in terminal** approach:

1. Open VS Code Terminal (`Ctrl+``)
2. Run: `railway shell`
3. You're now in your Railway container!

Alternatively, use the **Railway CLI** integration:

1. Install [Railway VS Code Extension](https://marketplace.visualstudio.com/items?itemName=Railway.railway)
2. Open Command Palette (`Ctrl+Shift+P`)
3. Type "Railway: Connect to Service"

## Troubleshooting

### SiteGround Connection Issues

**"Permission denied (publickey)"**
```bash
# Verify key permissions
chmod 600 ~/.ssh/vidismart-deploy

# Test connection
ssh -v vidicity
```

**"Connection timeout"**
- Check if port 18765 is blocked by firewall
- Try from different network (some ISPs block non-standard SSH ports)

**"No matching host key type found"**
```bash
# Add to SSH config
Host vidicity
  ...
  HostKeyAlgorithms +ssh-rsa
  PubkeyAcceptedAlgorithms +ssh-rsa
```

### Railway Connection Issues

**"Not logged in"**
```bash
railway login
```

**"No project linked"**
```bash
railway link
```

**"Command not found: railway"**
```bash
# Reinstall Railway CLI
npm install -g @railway/cli

# Or use npx
npx @railway/cli login
```

## Security Notes

1. **Never commit private keys** - They're in `~/.ssh/` and should stay there
2. **Use key-based auth** - Already configured, no passwords needed
3. **Keep keys secure** - 600 permissions (read/write for owner only)
4. **Rotate keys regularly** - Generate new keys every 6-12 months

## Additional Resources

- [VS Code Remote SSH Docs](https://code.visualstudio.com/docs/remote/ssh)
- [Railway CLI Docs](https://docs.railway.app/develop/cli)
- [SiteGround SSH Access](https://www.siteground.com/kb/ssh-credentials/)

---

## Quick Reference Card

### Connect to SiteGround
```
VS Code: Ctrl+Shift+P → "Remote-SSH: Connect to Host" → vidicity
Terminal: ssh vidicity
```

### Connect to Railway
```
Terminal: railway shell
VS Code: Install Railway extension → Connect to Service
```

### File Locations
```
SSH Config: C:\Users\James\.ssh\config
SSH Keys: C:\Users\James\.ssh\vidismart-deploy
VS Code Settings: .vscode\settings.json
```
