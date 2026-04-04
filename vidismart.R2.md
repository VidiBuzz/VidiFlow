# VidiSmart R2 CDN Configuration

## Status: ACTIVE (Fixed 2026-02-17)

## Account Details
- **Account Name**: Vidiman@vidicity.net
- **Account ID**: `5830508745fd2ac063426ebf9429c22d`
- **S3 API Endpoint**: `https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com`

## R2 Bucket
- **Bucket Name**: `vidismart`
- **Location**: ENAM (Eastern North America)
- **Storage Class**: Standard
- **Created**: 2025-12-18
- **Total Files**: 642+
- **Use for**: ALL new content - AppFlowy, vidi.news, vidismart websites

## Custom Domain
- **Domain**: `cdn.vidi.news`
- **Status**: ACTIVE
- **CDN URL Pattern**: `https://cdn.vidi.news/[filename]`
- **Fallback r2.dev URL**: `https://pub-3c3bb3e6eb0741bba48d492416052b4b.r2.dev/[filename]`

## Zone: vidi.news
- **Zone ID**: `e12aa15e6d126cb2b94797c7586feccb`
- **Status**: Active
- **Assigned Nameservers**: `ada.ns.cloudflare.com`, `jerry.ns.cloudflare.com`
- **Registrar**: GoDaddy

## API Credentials
- **R2 Access Key ID**: (stored in deploy scripts - see list-r2-files.js)
- **R2 Secret Access Key**: (stored in deploy scripts - see list-r2-files.js)
- **Cloudflare API Token**: (DO NOT commit - R2 permissions only)

## CRITICAL RULES
- **NEVER** delete the R2 custom domain mapping via API - read-only checks only
- **NEVER** modify zone settings via API without explicit permission
- SiteGround hosting is GONE - no longer used
- vidistudios@gmail.com account is NO LONGER USED

## Upload New Files
Use the S3 API credentials in the deploy scripts (e.g., list-r2-files.js) to upload.
Files uploaded to the `vidismart` bucket are immediately available at `https://cdn.vidi.news/[key]`.

## Video Assets on CDN
- `vidismart.mp4` - Main demo video
- `The_Visual_AI_Smart_Stack.mp4`
- `Wellness3.AirPMD.mp4`
- `SmartDoc2.mp4`
- `Digital_Twin_Tensor_Truth.mp4`
- Plus 637+ additional files (images, HTML, assets)
