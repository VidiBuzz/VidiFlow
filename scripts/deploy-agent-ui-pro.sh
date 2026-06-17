#!/bin/bash
# Deploy agent-ui.html and agent-ui-pro.html to vidismart.com on SiteGround
set -e

echo "=== Deploying VidiSmart files to SiteGround ==="

# Copy SSH key to /tmp with proper permissions
cp /mnt/c/Users/James/.ssh/vidismart-deploy /tmp/vd
chmod 600 /tmp/vd

# Run SFTP upload
sftp -P 18765 -i /tmp/vd -o StrictHostKeyChecking=no sftp6806-64fc400c@sftp.siteground.net <<'SFTP_COMMANDS'
put /mnt/m/code/vidismart/agent-ui.html vidismart.com/vidismart.com/public_html/agent-ui.html
put /mnt/m/code/vidismart/agent-ui-pro.html vidismart.com/vidismart.com/public_html/agent-ui-pro.html
put /mnt/m/code/vidismart/images/choo_choo_orchestrator.png vidismart.com/vidismart.com/public_html/images/choo_choo_orchestrator.png
bye
SFTP_COMMANDS

echo "=== Deployment complete ==="
echo "Public UI: https://vidismart.com/agent-ui.html"
echo "Pro UI: https://vidismart.com/agent-ui-pro.html?unlocked=1"
