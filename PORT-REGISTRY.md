# VidiSmart Port Registry

Master registry of all ports used across Docker containers and local services to avoid conflicts.

## Reserved Ports

### Docker Containers (Production)

| Port | Service | Container Name | Purpose | Link |
|------|---------|----------------|---------|------|
| 4000 | AppFlowy Nginx | appflowy-cloud-nginx-1 | AppFlowy Web Frontend | [localhost:4000](http://localhost:4000) → [cloud.0human.net](https://cloud.0human.net) → [cloud.0human.net](https://cloud.0human.net) |
| 5000 | Open WebUI | open-webui | AI Chat Interface | [localhost:5000](http://localhost:5000) |
| 5432 | PostgreSQL | vidismart-postgres | Main Database | [localhost:5432](http://localhost:5432) |
| 6379 | Redis | vidismart-redis | Cache/Queue | [localhost:6379](http://localhost:6379) |
| 8055 | Directus | vidismart-directus | Headless CMS | [localhost:8055](http://localhost:8055) |
| 8090 | Paperless | vidismart-paperless | Document Management | [localhost:8090](http://localhost:8090) |
| 8091 | Gotenberg | paperless-gotenberg | PDF Conversion | [localhost:8091](http://localhost:8091) |
| 9998 | Tika | paperless-tika | Document Parsing | [localhost:9998](http://localhost:9998) |
| 9000 | Portainer | portainer | Container Management | [localhost:9000](http://localhost:9000) |
| 9001 | Penpot Frontend | penpot-penpot-frontend-1 | Design Tool | [localhost:9001](http://localhost:9001) |
| 9002 | GrapesJS | grapesjs-grapesjs-1 | Web Builder | [localhost:9002](http://localhost:9002) |
| 6333 | Qdrant HTTP | vidismart-qdrant-vector-db | Vector Database | [localhost:6333](http://localhost:6333) |
| 6334 | Qdrant gRPC | vidismart-qdrant-vector-db | Vector Database | [localhost:6334](http://localhost:6334) |
| 8081 | Candid Dash | candid-dash | Dashboard | [localhost:8081](http://localhost:8081) |
| 1080 | Mailcatch | penpot-penpot-mailcatch-1 | Email Testing | [localhost:1080](http://localhost:1080) |
| 7474 | Neo4j HTTP | converge-neo4j | Graph Database | [localhost:7474](http://localhost:7474) |
| 7687 | Neo4j Bolt | converge-neo4j | Graph Database | [localhost:7687](http://localhost:7687) |
| 8089 | Vespa | converge-vespa | Search/Vector | [localhost:8089](http://localhost:8089) |
| 19071 | Vespa Admin | converge-vespa | Vespa Admin | [localhost:19071](http://localhost:19071) |
| 4443 | AppFlowy HTTPS | appflowy-cloud-nginx-1 | AppFlowy SSL | [localhost:4443](https://localhost:4443) |
| 9443 | Portainer HTTPS | portainer | Portainer SSL | [https://localhost:9443](https://localhost:9443) |

### Local Development Services

| Port | Service | Location | Notes | Link |
|------|---------|----------|-------|------|
| 4020 | Jekyll | m:\code\ghpages | GitHub Pages dev server | [localhost:4020](http://localhost:4020) |
| 3000 | AppFlowy Admin | appflowy-cloud | **Internal Only** - Access via cloud.0human.net | Internal |
| 3001 | Admin API | appflowy-cloud | **Internal Only** - API Adapter | Internal |
| 8000 | AppFlowy Cloud | appflowy-cloud-appflowy_cloud-1 | **Internal Only** - Backend API | Internal |
| 5001 | AppFlowy AI | appflowy-cloud-ai-1 | **Internal Only** - AI Service | Internal |

### External Access (Secure)

| URL | Service | Access Method |
|-----|---------|---------------|
| [https://cloud.0human.net](https://cloud.0human.net) | AppFlowy Web | Nginx proxy (port 4000/4443) |
| [https://cloud.0human.net/console](https://cloud.0human.net/console) | Admin Console | Via nginx auth |
| [https://cloud.0human.net/gotrue](https://cloud.0human.net/gotrue) | Auth Service | Via nginx |

## Available Ports (Safe for new services)

| Range | Status |
|-------|--------|
| 4021-4999 | Available |
| 5001-6332 | Available (check individual) |
| 7000-7473 | Available |
| 7688-8054 | Available |
| 8056-8080 | Available |
| 8082-8088 | Available |
| 8092-8999 | Available |
| 9003-9997 | Available |
| 10000+ | Available |

## Port Allocation Guidelines

1. **Always check this registry** before starting a new service
2. **Use high ports (10000+)** for temporary/experimental services
3. **Document new ports** in this file immediately
4. **Reserve ranges** for specific projects:
   - 4000-4999: AppFlowy ecosystem
   - 8000-8999: VidiSmart core services
   - 9000-9999: Infrastructure/Monitoring

## Checking Port Usage

```powershell
# Check if port is in use
netstat -ano | findstr "PORT_NUMBER"

# Check Docker port mappings
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Find process using port
Get-Process -Id (Get-NetTCPConnection -LocalPort PORT_NUMBER).OwningProcess
```
