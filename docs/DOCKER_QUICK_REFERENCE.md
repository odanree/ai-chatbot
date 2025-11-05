# 🐳 Docker Quick Reference

> Quick commands for Docker setup and deployment.

---

## ⚡ 2-Minute Setup

### 1. Build Image

```bash
docker build -t ai-chatbot:latest .
```

### 2. Run Container

```bash
docker run -d \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=odanree.myshopify.com \
  -e SHOPIFY_STOREFRONT_ACCESS_TOKEN=... \
  -e SHOPIFY_ADMIN_API_TOKEN=... \
  -p 3000:3000 \
  --name ai-chatbot-prod \
  ai-chatbot:latest
```

### 3. Verify

```bash
# Check logs
docker logs ai-chatbot-prod

# Test health
curl http://localhost:3000/health

# Test API
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

## 📚 Common Commands

| Task | Command |
|------|---------|
| **Build** | `docker build -t ai-chatbot:latest .` |
| **Run** | `docker run -d -p 3000:3000 ai-chatbot:latest` |
| **Logs** | `docker logs ai-chatbot-prod` |
| **Stop** | `docker stop ai-chatbot-prod` |
| **Remove** | `docker rm ai-chatbot-prod` |
| **List** | `docker ps` |
| **Shell** | `docker exec -it ai-chatbot-prod /bin/sh` |

---

## 🐳 Using docker-compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild
docker-compose build --no-cache
```

---

## 🔍 Debugging

```bash
# View image size
docker images ai-chatbot

# Inspect container
docker inspect ai-chatbot-prod

# View stats
docker stats ai-chatbot-prod

# Check environment
docker exec ai-chatbot-prod env
```

---

## 📦 Image Size

- Base image (node:18-alpine): ~150MB
- Compiled code: ~50MB
- node_modules: ~50MB
- **Total**: ~250MB

---

**Status**: ✅ Ready to use
