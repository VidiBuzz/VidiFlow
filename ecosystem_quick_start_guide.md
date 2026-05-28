# 🎞️ VidiSmart Ecosystem: Quick Start & Connectivity Guide

This guide is designed to get you up to speed in under 10 minutes, focusing on the container interface you're seeing in VS Code and how to manage remote connections reliably.

````carousel
![VidiSmart Container Ecosystem 2026](file:///C:/Users/James/.gemini/antigravity/brain/39cdf760-cafd-4980-922f-a5fb8d9fc300/container_ecosystem_overview_1778545376308.png)
<!-- slide -->
![VS Code Container Interface Guide](file:///C:/Users/James/.gemini/antigravity/brain/39cdf760-cafd-4980-922f-a5fb8d9fc300/vscode_containers_walkthrough_1778545388053.png)
<!-- slide -->
![Secure Remote & SFTP Connection](file:///C:/Users/James/.gemini/antigravity/brain/39cdf760-cafd-4980-922f-a5fb8d9fc300/remote_sftp_connection_guide_1778545400352.png)
````

---

## 🏗️ 1. The Container Interface (VS Code View)

In your screenshot, the **Containers** sidebar is your dashboard for the "virtual servers" running on your machine.

### **Key Groups**
*   **`appflowy-cloud` (CRITICAL)**: This is your core collaboration hub.
    *   **Ports Reserved**: 3000, 3001, 4000, 8000.
    *   **Rule**: Never stop or modify these unless AppFlowy itself needs an update. If it shows "unhealthy" (yellow triangle), it may need a restart.
*   **`airpmd`**: The Healthcare AI project. It includes its own **Postgres** and **Redis** database containers.
*   **`agent-backend`**: The orchestration layer for your AI agents.
*   **`pgvector`**: Specialized vector database for AI-powered visual search.

### **Action Icons**
*   ▶️ **Play**: Starts a container if it's stopped.
*   ⏹️ **Stop**: Gracefully shuts down a service.
*   🐚 **Terminal icon**: Opens a command line *inside* that container. Use this to check logs or database status directly.
*   🗑️ **Trash**: Removes the container (not the data, if volumes are mapped).

---

## 📂 2. Connecting to SFTP (SiteGround & Remote)

SiteGround uses **SFTP (SSH File Transfer Protocol)**, which is much more secure than standard FTP.

### **The "Remote Connect" Method**
Instead of using a separate app like FileZilla, use the **Remote - SSH** extension in VS Code:

1.  **Open Remote Explorer**: Click the "monitor" icon in the far left sidebar.
2.  **Add New SSH Host**: Click the `+` icon.
3.  **Command**: Enter `ssh user@your-server-ip -p 18765` (SiteGround uses port 18765 for SSH).
4.  **Connect**: Select the host and enter your password. You can now edit files on the server as if they were local!

### **Direct SFTP Credentials**
*   **Host**: `vidismart.com`
*   **Port**: `18765`
*   **Protocol**: SFTP (not FTP)
*   **Root Directory**: `/public_html/`

---

## ⚡ 3. Critical Safeguards
*   **Port Registry**: Always check `m:\code\vidismart\PORT_REGISTRY.md` before starting any new development server.
*   **Backups**: All database data lives in `m:\backups\`. Ensure this folder is synced to your cloud storage before any major infrastructure changes.

> [!TIP]
> If a container is stuck (showing a yellow alert), right-click it and select **Restart**. This solves 90% of connectivity issues without affecting your code.
