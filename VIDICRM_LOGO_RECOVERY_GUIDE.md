# VidiCRM Custom Logo Recovery Guide

## 🔴 PROBLEM
All custom logos in VidiCRM (Directus) were deleted.

## ✅ GOOD NEWS
VidiCRM stores files in **Cloudflare R2** - logos might still exist there!

---

## 📋 VidiCRM Architecture

```
VidiCRM = Directus CMS
Port: 8055
Database: PostgreSQL (vidismart-postgres container)
File Storage: Cloudflare R2 (S3-compatible)
```

### Docker Configuration
**File:** `/mnt/m/code/vidismart/docker-compose.yml`

**Services:**
1. **database** (PostgreSQL + PostGIS) - Port 5432
2. **cache** (Redis) - Port 6379
3. **directus** (Headless CMS) - Port 8055

**File Storage Settings:**
```yaml
STORAGE_LOCATIONS: 'r2'
STORAGE_R2_DRIVER: 's3'
STORAGE_R2_BUCKET: '${R2_BUCKET_NAME}'
STORAGE_R2_ENDPOINT: 'https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com'
```

---

## 🔧 RECOVERY STEPS

### Step 1: Check if Directus is Running

```bash
# Check Docker container status
docker ps | grep directus

# Check health endpoint
curl http://localhost:8055/server/health
```

**Expected Response:**
```json
{"status":"ok"}
```

### Step 2: Access Directus Admin Panel

```bash
# Open in browser:
http://localhost:8055

# Login:
Email: admin@vidismart.com
Password: admin_password
```

### Step 3: Check R2 Bucket Directly

**Option A - Using Cloudflare Dashboard:**
1. Go to https://dash.cloudflare.com
2. Navigate to R2 Storage
3. Find the VidiCRM bucket
4. Look for logo files in `/uploads/` or `/assets/`

**Option B - Using AWS CLI (R2 is S3-compatible):**
```bash
# Install AWS CLI if needed
# Configure with R2 credentials

# List files in bucket
aws s3 ls s3://${R2_BUCKET_NAME}/ --endpoint-url https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com

# Download all logos
aws s3 sync s3://${R2_BUCKET_NAME}/uploads ./recovered-logos/ --endpoint-url https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com
```

### Step 4: Check Database for File Records

```bash
# Connect to PostgreSQL
docker exec -it vidismart-postgres psql -U directus -d vidismart_community

# Check directus_files table
SELECT id, filename_download, storage, title, created_on
FROM directus_files
WHERE filename_download LIKE '%logo%'
ORDER BY created_on DESC
LIMIT 20;

# Check if files were soft-deleted
SELECT id, filename_download, storage, title, deleted_on
FROM directus_files
WHERE deleted_on IS NOT NULL
ORDER BY deleted_on DESC
LIMIT 20;
```

### Step 5: Restore from Database Backup

If R2 files are gone, check database backups:

```bash
# Find recent PostgreSQL dumps
find /mnt/m/code -name "*.sql" -name "*vidismart*" -mtime -7 2>/dev/null

# Restore from backup (CAREFUL - test first)
docker exec -i vidismart-postgres psql -U directus -d vidismart_community < backup.sql
```

---

## 🎯 WHERE TO LOOK FOR LOGOS

### 1. Cloudflare R2 Bucket
- Path: `s3://{bucket-name}/uploads/`
- Path: `s3://{bucket-name}/assets/`
- Files might still exist even if Directus DB records were deleted

### 2. Local Docker Volume
```bash
# Check if any local storage exists
docker volume ls | grep vidismart

# Inspect volume
docker volume inspect vidismart_postgres_data

# Files might be in container
docker exec vidismart-directus ls -la /directus/uploads 2>/dev/null
```

### 3. Git History
```bash
# Check if logos were committed to git
git log --all --full-history -- "*logo*"

# Find deleted files
git log --diff-filter=D --summary | grep logo
```

### 4. Backup Directories
```bash
# Check BAK folder
find /mnt/m/code/BAK -name "*logo*" -type f

# Check vidismart backups
find /mnt/m/code/vidismart -name "*.bak" -o -name "backup*"
```

---

## 🚨 PREVENT FUTURE LOSS

### 1. Enable R2 Versioning
In Cloudflare Dashboard → R2 → Bucket Settings:
- Enable **Object Versioning**
- This keeps deleted file versions

### 2. Automated Backups

**Database Backup Script:**
```bash
#!/bin/bash
# File: /mnt/m/code/vidismart/backup-vidicrm.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/mnt/m/code/BAK/vidicrm-backups"

mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec vidismart-postgres pg_dump -U directus vidismart_community > \
  $BACKUP_DIR/vidicrm_db_$DATE.sql

# Backup R2 files (if AWS CLI configured)
aws s3 sync s3://${R2_BUCKET_NAME}/ $BACKUP_DIR/r2_files_$DATE/ \
  --endpoint-url https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com

echo "Backup completed: $DATE"
```

**Run daily with cron:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /mnt/m/code/vidismart/backup-vidicrm.sh
```

### 3. Git Commit Assets
```bash
# Periodically commit critical assets
cd /mnt/m/code/vidismart
mkdir -p assets/logos
# Download from R2 or Directus
cp logos/* assets/logos/
git add assets/logos/
git commit -m "Backup VidiCRM custom logos"
git push
```

---

## 📝 RECOVERY CHECKLIST

- [ ] Check if Directus container is running (`docker ps`)
- [ ] Access Directus admin panel (http://localhost:8055)
- [ ] Check R2 bucket in Cloudflare Dashboard
- [ ] Query `directus_files` table in PostgreSQL
- [ ] Search for soft-deleted files (deleted_on IS NOT NULL)
- [ ] Download files from R2 using AWS CLI
- [ ] Check git history for committed logos
- [ ] Search BAK folder for backups
- [ ] Check Docker volumes for local files
- [ ] Restore from database backup if needed

---

## 🔑 REQUIRED INFORMATION

To recover, you need:

1. **R2 Credentials** (from .env file):
   - `R2_ACCOUNT_ID`
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`
   - `R2_BUCKET_NAME`

2. **Directus Admin Access**:
   - Email: `admin@vidismart.com`
   - Password: Check `.env` or docker-compose.yml

3. **PostgreSQL Access**:
   - Host: localhost:5432
   - User: directus
   - Password: directus_password
   - Database: vidismart_community

---

## 🎯 MOST LIKELY SOLUTION

The logos are probably **still in the R2 bucket** even if the Directus database records were deleted.

**Quick Recovery:**
1. Access Cloudflare Dashboard → R2
2. Find your VidiCRM bucket
3. Look in `/uploads/` folder
4. Download the logo files
5. Re-upload through Directus admin panel

---

## 📞 NEED HELP?

**Check:**
1. `.env` file for R2 credentials
2. Cloudflare Dashboard for R2 access
3. Directus admin panel file library
4. PostgreSQL database for file records

**Files:**
- Docker config: `/mnt/m/code/vidismart/docker-compose.yml`
- Environment: `/mnt/m/code/vidismart/.env`
- This guide: `/mnt/m/code/vidismart/VIDICRM_LOGO_RECOVERY_GUIDE.md`

---

**Created:** February 3, 2026
**Status:** Recovery in progress
