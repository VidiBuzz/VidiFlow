#!/bin/bash
set -e
cp /mnt/c/Users/James/.ssh/vidismart-deploy /tmp/vd3
chmod 600 /tmp/vd3
sed -i 's/\r$//' /tmp/vd3
echo "Key file info:"
file /tmp/vd3
wc -l /tmp/vd3
echo "Testing SFTP connection..."
sftp -P 18765 -i /tmp/vd3 -o StrictHostKeyChecking=no sftp6806-64fc400c@sftp.siteground.net <<'EOF'
pwd
bye
EOF
echo "Connection test complete."
