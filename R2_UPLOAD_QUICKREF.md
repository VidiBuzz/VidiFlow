# R2 Image Upload Quick Reference

## Credentials (from vidismart.R2.md)
- **Account ID**: `5830508745fd2ac063426ebf9429c22d`
- **Endpoint**: `https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com`
- **Bucket**: `vidismart`
- **Access Key**: `e9c7b7eb9ea570cc59e413cfdf580deb`
- **Secret Key**: `aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b`

## Quick Upload Command
```bash
cd /tmp && python3 -m venv venv && source venv/bin/activate && pip install boto3 --quiet && python3 << 'EOF'
import boto3
from botocore.config import Config

s3 = boto3.client('s3',
    endpoint_url='https://5830508745fd2ac063426ebf9429c22d.r2.cloudflarestorage.com',
    aws_access_key_id='e9c7b7eb9ea570cc59e413cfdf580deb',
    aws_secret_access_key='aa9bdcf03e5958b0c16a40306e85b82107c206a4b25bfee2d25f3a1357ef1c5b',
    region_name='auto',
    config=Config(signature_version='s3v4')
)

with open('/path/to/image.png', 'rb') as f:
    s3.upload_fileobj(f, 'vidismart', 'image-name.png')
print("SUCCESS")
EOF
```

## Verify Upload
```bash
curl -s -o /dev/null -w "%{http_code}" "https://cdn.vidi.news/image-name.png"
```

## HTML Reference Format
```html
<img referrerpolicy="no-referrer" src="https://cdn.vidi.news/your-image.png" alt="Description">
```

## Key Points
1. Always use `referrerpolicy="no-referrer"` on img tags for R2 images
2. Files go to R2 bucket, NOT to vidismart.com/images folder
3. Use CDN domain: `https://cdn.vidi.news/[filename]`
4. Bucket name is `vidismart` (not vidinews-media)
