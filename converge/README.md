# Vidicrm.com SmartChannel - Docker Deployment Guide

## Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 1GB Fiber connection (optimized for this bandwidth)

### Deploy All Services

```bash
./scripts/deploy.sh
```

This script will:

1. Create all necessary volume directories
2. Initialize Redis cache configuration
3. Set up environment variables
4. Build Docker images
5. Start all services

## Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Vidicrm.com Stack                         │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   API (3001) │──│ Directus     │  │    RabbitMQ      │  │
│  │              │  │  (8055)      │  │   (Message Broker)│  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                │                    │             │
│         ▼                ▼                    ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Worker     │  │    Vespa     │  │      Redis       │  │
│  │              │  │  (Vector DB) │  │      (Cache)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                │                    │             │
│         └────────────────┴────────────────────┘             │
│                        ▼                                    │
│              ┌──────────────────┐                           │
│              │   PostgreSQL     │                           │
│              │   (Primary DB)   │                           │
│              └──────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Service Ports

| Service               | Port  | Description       |
| --------------------- | ----- | ----------------- |
| API                   | 3001  | Main REST API     |
| Directus Admin        | 8055  | Admin UI          |
| RabbitMQ Management   | 15672 | Message broker UI |
| PostgreSQL (External) | 5433  | Database access   |
| Redis                 | 6389  | Cache access      |

## Resource Allocation (Optimized for 1GB Fiber)

| Service    | CPU | Memory | Purpose          |
| ---------- | --- | ------ | ---------------- |
| API        | 1.0 | 512M   | Request handling |
| Worker     | 1.0 | 512M   | Async processing |
| Directus   | 1.0 | 512M   | Admin interface  |
| PostgreSQL | 1.0 | 512M   | Primary database |
| RabbitMQ   | 0.5 | 256M   | Message broker   |
| Redis      | -   | 128M   | Cache layer      |
| Vespa      | 2.0 | 1G     | Vector search    |

## Environment Variables

### API Service (.env)

```bash
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
RESEND_API_KEY=<your-resend-api-key>
```

### RabbitMQ Management

- Username: `vidicrm`
- Password: `vidicrm_secret`

## Monitoring

### View Logs

```bash
docker-compose -f converge/docker-compose.yml logs -f
```

### Check Service Health

```bash
docker-compose -f converge/docker-compose.yml ps
```

## Access Points

| URL                    | Service        | Credentials                          |
| ---------------------- | -------------- | ------------------------------------ |
| https://localhost:3001 | API            | N/A (API only)                       |
| https://localhost:8055 | Directus Admin | admin@vidismart.com / VidiSmart2026! |
| http://localhost:15672 | RabbitMQ UI    | vidicrm / vidicrm_secret             |

## Next Steps

1. Set your `RESEND_API_KEY` in the `.env` file
2. Configure Cloudflare R2 storage credentials if needed
3. Run migrations via Directus admin panel
4. Deploy your application code to the API service
