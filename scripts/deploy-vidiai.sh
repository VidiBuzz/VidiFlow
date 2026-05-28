#!/bin/bash
# Deploy vidiai-configurator.html and hardware-images to vidismart.com
set -e

echo "=== Deploying vidiai-configurator to vidismart.com ==="

# Copy SSH key to /tmp with proper permissions
cp /mnt/c/Users/James/.ssh/vidismart-deploy /tmp/vd
chmod 600 /tmp/vd

# Run SFTP batch upload
sftp -P 18765 -i /tmp/vd -o StrictHostKeyChecking=no -b /mnt/m/code/vidismart/sftp-vidiai-deploy.txt sftp6806-64fc400c@sftp.siteground.net

echo ""
echo "=== Deployment complete ==="
echo "Live URL: https://vidismart.com/vidiai-configurator.html"
echo "Hardware images: https://vidismart.com/hardware-images/"
