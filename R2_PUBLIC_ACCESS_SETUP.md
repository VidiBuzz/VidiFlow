# R2 Bucket Public Access Setup Guide

## Current Status
- File uploaded successfully to R2 ✅
- File NOT publicly accessible ❌ (Error 401)

## Problem
The R2 bucket "vidismart" does not have public access enabled. This is a bucket-level setting that must be configured in Cloudflare.

## Solution - Enable Public Access

### Option 1: Cloudflare Dashboard (Easiest)
1. Go to https://dash.cloudflare.com
2. Navigate to: R2 > Manage R2 > Buckets > vidismart
3. Click on the "Settings" tab
4. Under "Public Access", toggle "Allow public access"
5. Save changes

### Option 2: Using Wrangler CLI
```bash
# Install wrangler if not already installed
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Enable public access for the bucket
wrangler r2 bucket public-access set vidismart --allowed
```

### Option 3: Using Cloudflare API
```bash
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/r2/buckets/vidismart/public-access" \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  --data '{"public_access": "enabled"}'
```

## Once Public Access is Enabled
The file will be accessible at:
