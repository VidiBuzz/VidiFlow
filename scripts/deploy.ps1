# Deployment script for vidicrm.com SmartChannel system (PowerShell)
# This script builds and starts all Docker containers with optimized resource limits

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Vidicrm.com SmartChannel Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Create necessary directories for volumes
Write-Host "[1/6] Creating volume directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "converge/database" | Out-Null
New-Item -ItemType Directory -Force -Path "converge/cache" | Out-Null
New-Item -ItemType Directory -Force -Path "converge/rabbitmq" | Out-Null
New-Item -ItemType Directory -Force -Path "converge/uploads" | Out-Null
New-Item -ItemType Directory -Force -Path "converge/extensions" | Out-Null
New-Item -ItemType Directory -Force -Path "converge/vespa" | Out-Null

# Initialize cache directory with Redis config
Write-Host "[2/6] Initializing Redis cache configuration..." -ForegroundColor Yellow
$redisConfig = "maxmemory 128mb`nmaxmemory-policy allkeys-lru`nappendonly yes`nappendfsync everysec"
Set-Content -Path "converge/cache/redis.conf" -Value $redisConfig

# Create .env file for API service
Write-Host "[3/6] Creating environment variables..." -ForegroundColor Yellow
$envContent = "NODE_ENV=production`nDB_HOST=database`nDB_PORT=5432`nDB_DATABASE=converge`nDB_USER=converge`nDB_PASSWORD=converge_secret`nREDIS_HOST=cache`nREDIS_PORT=6379`nRABBITMQ_HOST=rabbitmq`nVESPA_URL=http://vespa:8080`nRESEND_API_KEY="
Set-Content -Path "api/.env" -Value $envContent

# Build and start all services
Write-Host "[4/6] Building Docker images..." -ForegroundColor Yellow
docker-compose -f converge/docker-compose.yml build --no-cache

Write-Host "[5/6] Starting all services..." -ForegroundColor Yellow
docker-compose -f converge/docker-compose.yml up -d

Write-Host "[6/6] Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check service health
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Service Health Check" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
docker-compose -f converge/docker-compose.yml ps

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  - API: http://localhost:3001"
Write-Host "  - Directus Admin: https://localhost:8055"
Write-Host "  - RabbitMQ Management: http://localhost:15672"
Write-Host "  - PostgreSQL (external): localhost:5433"
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  docker-compose -f converge/docker-compose.yml logs -f"
Write-Host ""
