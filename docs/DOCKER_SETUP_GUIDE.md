# 🐳 Docker Setup Guide

> Complete Docker setup and deployment for AI Chatbot production environment.

---

## 📋 Prerequisites

Before building Docker images, ensure you have:

- [ ] Docker installed (https://www.docker.com/products/docker-desktop)
- [ ] Docker running and accessible (`docker --version`)
- [ ] All code committed to git
- [ ] All tests passing locally (`npm test`)
- [ ] Build successful locally (`npm run build`)

---

## 🏗️ Docker Architecture

This project uses **multi-stage Docker builds** for optimal production images:

```
Stage 1: Builder (node:18-alpine)
├─ Install dependencies (npm ci)
├─ Copy source code
└─ Compile TypeScript → JavaScript (npm run build)
         ↓
         ↓ (only dist/ + node_modules copied)
         ↓
Stage 2: Runtime (node:18-alpine)
├─ Minimal base image (~150MB)
├─ Non-root user (nodejs:1001)
├─ dumb-init for signal handling
├─ Health check configured
└─ Production-ready output (~250MB total)
```

**Benefits**:
- ✅ Smaller final image (~250MB vs ~500MB)
- ✅ No build tools in production
- ✅ Non-root user for security
- ✅ Proper signal handling
- ✅ Health check built-in

---

## 🔨 Build Docker Image

### Basic Build

```bash
# Build image with tag
docker build -t ai-chatbot:latest .

# Build with version tag
docker build -t ai-chatbot:0.3.0 .

# Build with multiple tags
docker build -t ai-chatbot:latest -t ai-chatbot:0.3.0 .
```

### Build Options

```bash
# Build with build context
docker build --build-arg NODE_ENV=production -t ai-chatbot:latest .

# Build with progress output
docker build --progress=plain -t ai-chatbot:latest .

# Build without cache (full rebuild)
docker build --no-cache -t ai-chatbot:latest .
```

### Verify Image

```bash
# List images
docker images | grep ai-chatbot

# Inspect image
docker inspect ai-chatbot:latest

# Check image size
docker images ai-chatbot:latest --format "{{.Size}}"
```

---

## ▶️ Run Container Locally

### Basic Run

```bash
# Run with environment variables
docker run \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  ai-chatbot:latest
```

### Interactive Run

```bash
# Run with interactive terminal
docker run -it \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  ai-chatbot:latest

# Exit: Ctrl+C
```

### Background Run

```bash
# Run in background (detached mode)
docker run -d \
  --name ai-chatbot-prod \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  ai-chatbot:latest

# View logs
docker logs ai-chatbot-prod

# Stop container
docker stop ai-chatbot-prod

# Remove container
docker rm ai-chatbot-prod
```

### With Volume Mounts

```bash
# Mount local directory for logs
docker run -d \
  --name ai-chatbot-prod \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  -v /var/log/chatbot:/app/logs \
  ai-chatbot:latest
```

---

## 🧪 Test Container

### Health Check

```bash
# Test health endpoint
curl -X GET http://localhost:3000/health

# Expected response: 200 OK
```

### API Test

```bash
# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# Expected response: {"response":"..."}
```

### Container Status

```bash
# Check if container is running
docker ps | grep ai-chatbot

# View container logs
docker logs ai-chatbot-prod

# View real-time logs
docker logs -f ai-chatbot-prod

# View last 100 lines
docker logs --tail=100 ai-chatbot-prod
```

---

## 🚀 Production Deployment

### Using docker-compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.9'

services:
  ai-chatbot:
    build: .
    image: ai-chatbot:0.3.0
    container_name: ai-chatbot-prod
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SHOPIFY_STORE_DOMAIN: ${SHOPIFY_STORE_DOMAIN}
      SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${SHOPIFY_STOREFRONT_ACCESS_TOKEN}
      SHOPIFY_ADMIN_API_TOKEN: ${SHOPIFY_ADMIN_API_TOKEN}
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

Deploy:

```bash
# Create .env file with variables
cat > .env << EOF
OPENAI_API_KEY=sk-...
SHOPIFY_STORE_DOMAIN=odanree.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_TOKEN=...
EOF

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Network

```bash
# Create network
docker network create app-network

# Run container on network
docker run -d \
  --name ai-chatbot-prod \
  --network app-network \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  ai-chatbot:latest
```

---

## 📦 Publishing to Registry

### Docker Hub

```bash
# Login to Docker Hub
docker login

# Tag image for Docker Hub
docker tag ai-chatbot:latest yourusername/ai-chatbot:latest
docker tag ai-chatbot:latest yourusername/ai-chatbot:0.3.0

# Push to Docker Hub
docker push yourusername/ai-chatbot:latest
docker push yourusername/ai-chatbot:0.3.0

# Verify
docker pull yourusername/ai-chatbot:latest
```

### GitHub Container Registry

```bash
# Login to GitHub Container Registry
echo $PAT | docker login ghcr.io -u USERNAME --password-stdin

# Tag image
docker tag ai-chatbot:latest ghcr.io/odanree/ai-chatbot:latest
docker tag ai-chatbot:latest ghcr.io/odanree/ai-chatbot:0.3.0

# Push
docker push ghcr.io/odanree/ai-chatbot:latest
docker push ghcr.io/odanree/ai-chatbot:0.3.0
```

---

## 🔍 Monitoring & Debugging

### View Container Status

```bash
# List all containers
docker ps -a

# List running containers
docker ps

# Detailed container info
docker inspect ai-chatbot-prod
```

### Container Logs

```bash
# All logs
docker logs ai-chatbot-prod

# Last N lines
docker logs --tail=50 ai-chatbot-prod

# Follow logs (real-time)
docker logs -f ai-chatbot-prod

# With timestamps
docker logs -t ai-chatbot-prod

# Since/until specific time
docker logs --since 2025-11-05T10:00:00 ai-chatbot-prod
```

### Performance Monitoring

```bash
# Container resource usage
docker stats ai-chatbot-prod

# Container processes
docker top ai-chatbot-prod

# Container file changes
docker diff ai-chatbot-prod
```

### Debug Container

```bash
# Execute command in running container
docker exec ai-chatbot-prod node -v

# Interactive shell
docker exec -it ai-chatbot-prod /bin/sh

# View environment variables
docker exec ai-chatbot-prod env
```

---

## 🐛 Troubleshooting

### Container Won't Start

**Error**: `container exited immediately`

**Solutions**:
1. Check logs: `docker logs ai-chatbot-prod`
2. Verify environment variables
3. Check file permissions
4. Rebuild image: `docker build --no-cache -t ai-chatbot:latest .`

### Port Already in Use

**Error**: `Error response from daemon: driver failed`

**Solutions**:
```bash
# Find process using port 3000
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Use different port
docker run -p 3001:3000 ai-chatbot:latest

# Stop conflicting container
docker stop <container-id>
```

### Out of Disk Space

**Error**: `write error - no space left on device`

**Solutions**:
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove all unused resources
docker system prune -a

# Check disk usage
docker system df
```

### Environment Variables Not Found

**Error**: `Error: OPENAI_API_KEY is not defined`

**Solutions**:
1. Verify variables in `docker run -e` or `.env`
2. Check `.dockerignore` doesn't exclude `.env`
3. View set variables: `docker exec container env`
4. Rebuild image after env changes

---

## 🔐 Security Best Practices

### Non-Root User
✅ Already configured in Dockerfile (nodejs:1001)

### Image Security

```bash
# Scan image for vulnerabilities
docker scan ai-chatbot:latest

# Use specific version of base image
# ✅ Already done: node:18-alpine (not :latest)
```

### Secret Management

**Never** store secrets in Dockerfile or image:

```dockerfile
# ❌ WRONG - Never do this
ENV OPENAI_API_KEY=sk-xxxx

# ✅ CORRECT - Use environment variables at runtime
# docker run -e OPENAI_API_KEY=sk-xxxx ...
```

### Network Security

```bash
# Run with specific network
docker run --network restricted -p 3000:3000 ai-chatbot:latest

# Don't expose unnecessary ports
# Only expose 3000 for API
```

---

## ✅ Docker Checklist

Before deploying:

- [ ] Dockerfile created with multi-stage build
- [ ] .dockerignore file created
- [ ] Build successful: `docker build -t ai-chatbot:latest .`
- [ ] Image size reasonable (~250MB)
- [ ] Container runs: `docker run -it -p 3000:3000 ai-chatbot:latest`
- [ ] Health check passes
- [ ] API responds to requests
- [ ] Logs visible: `docker logs container`
- [ ] Environment variables work
- [ ] Non-root user (nodejs) is used
- [ ] dumb-init properly handles signals

---

## 📚 Docker Commands Quick Reference

| Command | Purpose |
|---------|---------|
| `docker build -t name:tag .` | Build image |
| `docker run -d -p 3000:3000 image:tag` | Run container |
| `docker ps` | List running containers |
| `docker logs container` | View container logs |
| `docker exec -it container /bin/sh` | Shell into container |
| `docker stop container` | Stop container |
| `docker rm container` | Remove container |
| `docker images` | List images |
| `docker image rm image:tag` | Remove image |
| `docker system prune -a` | Clean up all |

---

## 🔄 CI/CD Integration

Your Docker setup integrates with CI/CD:

```yaml
# GitHub Actions example
- name: Build Docker Image
  run: docker build -t ghcr.io/odanree/ai-chatbot:latest .

- name: Run Tests in Container
  run: docker run ai-chatbot:latest npm test

- name: Push to Registry
  run: docker push ghcr.io/odanree/ai-chatbot:latest
```

---

## 📞 Resources

- **Docker Docs**: https://docs.docker.com/
- **Docker Hub**: https://hub.docker.com/
- **Node.js Docker**: https://hub.docker.com/_/node
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

## 🎉 Next Steps

1. **Build image**: `docker build -t ai-chatbot:latest .`
2. **Test locally**: `docker run -p 3000:3000 ai-chatbot:latest`
3. **Push to registry**: `docker push yourusername/ai-chatbot:latest`
4. **Deploy to production**: Use docker-compose or orchestration platform

---

**Last Updated**: November 5, 2025  
**Status**: Production-ready ✅
