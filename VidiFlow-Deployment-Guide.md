# VidiFlow Self-Hosted Deployment Guide

## 📋 Overview

VidiFlow is your self-hosted, customizable fork of AppFlowy - an open-source alternative to Notion. This guide covers complete setup from backend deployment to data migration.

## 🏗️ Architecture

### Two-Repository Structure
1. **AppFlowy-Cloud** (Backend) - `/mnt/m/code/AppFlowy-Cloud/`
   - Rust-based server infrastructure
   - 9 Docker containers working together

2. **VidiFlow** (Frontend) - `/mnt/m/code/VidiFlow/`
   - Your customizable Flutter application fork
   - Connected to your self-hosted backend

### Backend Services (Docker Compose)
| Service | Port | Purpose |
|---------|------|---------|
| nginx | 3000, 3443 | Reverse proxy & web server (changed from 80/443 to avoid Huly conflict) |
| postgres | 5432 | Database with pgvector for AI |
| redis | 6379 | Caching & realtime collaboration |
| gotrue | 9999 | Authentication (Supabase Auth) |
| minio | 9000, 9001 | S3-compatible object storage |
| appflowy_cloud | 8000 | Core API server |
| admin_frontend | - | Admin management panel |
| ai | 5001 | AI services (OpenAI integration) |
| appflowy_worker | - | Background job processing |
| appflowy_web | - | Web interface |

## 🔐 Your Secure Credentials

**IMPORTANT: Keep these credentials safe!**

### Admin Access
- **Admin Email**: `admin@vidiflow.local`
- **Admin Password**: `VidiAdmin2025!Secure`
- **Admin Panel**: http://localhost:4000/admin

### Database
- **User**: `postgres`
- **Password**: `VidiFlow2025!SecurePass`
- **Database**: `postgres`
- **Port**: `5432`

### MinIO Storage
- **Access Key**: `vidiflow2025`
- **Secret Key**: `VidiFlowMinIO!Secret2025Key`
- **Console**: http://localhost:4000/minio

### JWT Secret
- **Secret**: `VidiFlow_JWT_Secret_2025_KeepThisSafe_RandomString_9876543210`

## 🚀 Deployment Steps

### Step 1: Prerequisites
```bash
# Ensure Docker Desktop is running on Windows
# It will automatically be available in WSL2

# Verify Docker is running
docker --version
docker ps
```

### Step 2: Start Backend Services
```bash
cd /mnt/m/code/AppFlowy-Cloud

# Start all services (first time may take 5-10 minutes to download images)
docker compose up -d

# Watch logs to monitor startup
docker compose logs -f

# Or check specific service logs
docker compose logs -f appflowy_cloud
docker compose logs -f gotrue
```

### Step 3: Verify Services
```bash
# Check all containers are running
docker compose ps

# Test health endpoints
curl http://localhost:4000/health           # AppFlowy Cloud
curl http://localhost:4000/gotrue/health    # GoTrue auth

# Access web interface
# Open browser: http://localhost:4000
```

### Step 4: Access Points

**⚠️ IMPORTANT: VidiFlow runs on port 3000 to avoid conflict with Huly (port 80)**

| Service | URL | Credentials |
|---------|-----|-------------|
| **Main App** | http://localhost:4000 | Create account or use admin |
| **Admin Panel** | http://localhost:4000/admin | admin@vidiflow.local |
| **MinIO Console** | http://localhost:4000/minio | vidiflow2025 |
| **PgAdmin** | http://localhost:4000/pgadmin | admin@example.com |

## 🔌 Connecting VidiFlow Frontend

### Option 1: Web Interface
The web interface is already running at http://localhost

### Option 2: Desktop App (VidiFlow Fork)
To build and run your customized VidiFlow desktop app:

```bash
cd /mnt/m/code/VidiFlow

# Configure to use your self-hosted backend
# Edit: frontend/appflowy_flutter/lib/env/cloud_env.dart

# Build the app (requires Flutter SDK)
cd frontend/appflowy_flutter
flutter pub get
flutter run
```

### Backend Configuration
Update your VidiFlow app to point to your self-hosted backend:

**File**: `frontend/appflowy_flutter/lib/env/cloud_env.dart`
```dart
static const cloudUrl = 'http://localhost:4000';
static const wsUrl = 'ws://localhost:4000/ws/v2';
```

## 📦 Data Migration Plan

### Step 1: Export from AppFlowy Cloud
Currently investigating export options:
1. Use official AppFlowy export feature (if available)
2. Database export via admin panel
3. API-based data extraction

### Step 2: Import to Self-Hosted
1. Use import feature in admin panel (http://localhost:4000/admin)
2. Direct database import
3. API-based bulk import

**Status**: Research in progress for best migration path

## 🎨 Customization Guide

### Frontend Customization (VidiFlow)
Your VidiFlow fork allows complete customization:

#### Stylesheets & Themes
```bash
# Theme files location
/mnt/m/code/VidiFlow/frontend/appflowy_flutter/lib/plugins/document/presentation/editor_plugins/theme/

# Color schemes
/mnt/m/code/VidiFlow/frontend/resources/flowy_icons/
```

#### Modify UI Components
```bash
# Widget library
/mnt/m/code/VidiFlow/frontend/appflowy_flutter/lib/workspace/

# Custom plugins
/mnt/m/code/VidiFlow/frontend/appflowy_flutter/lib/plugins/
```

#### Branding
- Logo: Update images in `/frontend/resources/`
- App name: Modify `pubspec.yaml` and build configurations
- Color scheme: Edit theme files

### Backend Customization
While backend is containerized, you can:
- Modify `.env` for configuration changes
- Add custom OAuth providers
- Configure AI models
- Adjust storage settings

## 🛠️ Common Operations

### Stop Services
```bash
cd /mnt/m/code/AppFlowy-Cloud
docker compose down
```

### Restart Services
```bash
docker compose restart
```

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f appflowy_cloud
docker compose logs -f postgres
docker compose logs -f gotrue
```

### Update Services
```bash
# Pull latest images
docker compose pull

# Restart with new images
docker compose up -d
```

### Backup Database
```bash
docker compose exec postgres pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

### Restore Database
```bash
docker compose exec -T postgres psql -U postgres postgres < backup.sql
```

## 🐞 Troubleshooting

### Services Won't Start
```bash
# Check Docker is running
docker ps

# Check logs for errors
docker compose logs

# Restart everything
docker compose down
docker compose up -d
```

### Port Conflicts
If port 80 is already in use, edit `.env`:
```bash
NGINX_PORT=8080  # Use different port
```

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U postgres -c "SELECT version();"
```

### Storage Issues
```bash
# Check MinIO
docker compose ps minio

# Access MinIO console
# http://localhost:4000/minio
# Login: vidiflow2025 / VidiFlowMinIO!Secret2025Key
```

## 📊 Monitoring

### Service Health
```bash
# Check all services
docker compose ps

# Resource usage
docker stats

# Disk usage
docker system df
```

### Database
```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres

# Check database size
\l+

# Check tables
\dt
```

## 🔒 Security Recommendations

### For Production Use:
1. **Change all passwords** in `.env` file
2. **Enable HTTPS** - Add SSL certificates to nginx
3. **Set up SMTP** for email verification (currently auto-confirms)
4. **Configure OAuth** for social login
5. **Regular backups** of database and storage
6. **Firewall rules** to protect exposed ports
7. **Update regularly** to get security patches

### Current Setup:
- ✅ Secure passwords configured
- ⚠️ HTTP only (no SSL)
- ⚠️ Auto-confirm signup (no email verification)
- ⚠️ Localhost only (not exposed to internet)

## 📝 Next Steps

1. **Start Docker Desktop** on Windows
2. **Run deployment** command: `docker compose up -d`
3. **Verify services** are running: `docker compose ps`
4. **Access web interface**: http://localhost:4000
5. **Login with admin** credentials
6. **Configure VidiFlow** frontend to connect
7. **Migrate your data** from AppFlowy Cloud
8. **Customize** your VidiFlow fork!

## 🆘 Support Resources

- AppFlowy Docs: https://docs.appflowy.io
- AppFlowy Cloud GitHub: https://github.com/AppFlowy-IO/AppFlowy-Cloud
- VidiFlow Fork: https://github.com/VidiBuzz/VidiFlow
- AppFlowy Discord: https://discord.gg/9Q2xaN37tV

---

**Last Updated**: November 15, 2025
**Configuration Location**: `/mnt/m/code/AppFlowy-Cloud/.env`
**VidiFlow Location**: `/mnt/m/code/VidiFlow/`
