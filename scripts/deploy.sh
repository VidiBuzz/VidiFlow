#!/bin/bash
# Deployment script for vidicrm.com SmartChannel system
# This script builds and starts all Docker containers with optimized resource limits

set -e

echo "=========================================="
echo "  Vidicrm.com SmartChannel Deployment"
echo "=========================================="

# Create necessary directories for volumes
echo "[1/6] Creating volume directories..."
mkdir -p converge/database
mkdir -p converge/cache
mkdir -p converge/rabbitmq
mkdir -p converge/uploads
mkdir -p converge/extensions
mkdir -p converge/vespa

# Initialize cache directory with Redis config
echo "[2/6] Initializing Redis cache configuration..."
cat > converge/cache/redis.conf << 'EOF'
maxmemory 128mb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
EOF

# Create .env file for API service
echo "[3/6] Creating environment variables..."
cat > api/.env << 'EOF'
NODE_ENV=production
DB_HOST=database
DB_PORT=5432
DB_DATABASE=converge
DB_USER=converge
DB_PASSWORD=converge_secret
REDIS_HOST=cache
REDIS_PORT=6379
RABBITMQ_HOST=rabbitmq
VESPA_URL=http://vespa:8080
RESEND_API_KEY=${RESEND_API_KEY:-}
EOF

# Build and start all services
echo "[4/6] Building Docker images..."
docker-compose -f converge/docker-compose.yml build --no-cache

echo "[5/6] Starting all services..."
docker-compose -f converge/docker-compose.yml up -d

echo "[6/6] Waiting for services to initialize..."
sleep 10

# Check service health
echo ""
echo "=========================================="
echo "  Service Health Check"
echo "=========================================="

docker-compose -f converge/docker-compose.yml ps

echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
echo "Service URLs:"
echo "  - API: http://localhost:3001"
echo "  - Directus Admin: https://localhost:8055"
echo "  - RabbitMQ Management: http://localhost:15672"
echo "  - PostgreSQL (external): localhost:5433"
echo ""
echo "To view logs:"
echo "  docker-compose -f converge/docker-compose.yml logs -f"
echo ""
