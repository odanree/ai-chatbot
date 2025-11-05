# 🔧 Environment Configuration Guide

> Complete setup for development, testing, and production environments.

---

## 📋 Quick Start

### 1. Copy Example File

```bash
cp .env.example .env.local
```

### 2. Fill in Your Values

```bash
# Required - OpenAI
OPENAI_API_KEY=sk-...

# Required - Shopify
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_TOKEN=...

# Optional
PORT=3000
NODE_ENV=production
```

### 3. Verify Configuration

```bash
npm run build
npm test
npm start
```

---

## 🎯 Environment Variables by Role

### Development (.env.local)

```bash
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo  # Cheaper for testing

# Shopify
SHOPIFY_STORE_DOMAIN=odanree.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_TOKEN=...

# Server
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# Testing (optional)
MOCK_OPENAI=false
MOCK_SHOPIFY=false
```

### Testing (.env.test)

```bash
# Mock Services (no real API calls)
MOCK_OPENAI=true
MOCK_SHOPIFY=true

# OpenAI (for integration tests)
OPENAI_API_KEY=sk-test-key
OPENAI_MODEL=gpt-3.5-turbo

# Shopify (for integration tests)
SHOPIFY_STORE_DOMAIN=test-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=test-token
SHOPIFY_ADMIN_API_TOKEN=test-admin-token

# Server
PORT=3000
NODE_ENV=test
LOG_LEVEL=error  # Minimal logging during tests
```

### Production (.env.production)

```bash
# OpenAI
OPENAI_API_KEY=sk-prod-...
OPENAI_MODEL=gpt-4  # Best quality for production

# Shopify
SHOPIFY_STORE_DOMAIN=odanree.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=prod-...
SHOPIFY_ADMIN_API_TOKEN=prod-...

# Server
PORT=3000
NODE_ENV=production
LOG_LEVEL=info

# Security
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Monitoring
SENTRY_DSN=https://...@sentry.io/...

# NOT in production
MOCK_OPENAI=false
MOCK_SHOPIFY=false
```

---

## 🔑 Getting API Keys

### OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Click "Create new secret key"
3. Copy the key (shown only once!)
4. Add to .env.local:
   ```bash
   OPENAI_API_KEY=sk-...
   ```

**Safety Tips**:
- ✅ Never share your key
- ✅ Rotate keys regularly
- ✅ Use different keys for dev/prod
- ✅ Monitor usage in OpenAI dashboard

### Shopify Tokens

#### Storefront Access Token

1. Go to Shopify Admin → Settings
2. Click "Apps and integrations"
3. Click "Develop apps"
4. Create or select your app
5. Click "Configuration"
6. Scroll to "Storefront API"
7. Generate token (or copy existing)
8. Add to .env.local:
   ```bash
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
   ```

#### Admin API Token

1. Same path as above: Apps → Develop apps → Your app
2. Click "Configuration"
3. Scroll to "Admin API"
4. Generate token (or copy existing)
5. Add to .env.local:
   ```bash
   SHOPIFY_ADMIN_API_TOKEN=...
   ```

**Scopes Required**:
- `read_products` - Product information
- `read_orders` - Order status
- `read_inventory` - Inventory levels

---

## 📁 Environment File Locations

```
Project Root/
├── .env.example          # Template (committed to git)
├── .env.local            # Development (gitignored ✅)
├── .env.test             # Testing (gitignored ✅)
├── .env.production       # Production (gitignored ✅)
└── .gitignore            # Ensures .env* not committed
```

### .gitignore Configuration

Verify your `.gitignore` includes:

```bash
# Environment variables
.env
.env.local
.env.test
.env.production
.env.*.local
.env.local.backup
```

---

## 🔄 Loading Environment Variables

### Development

```bash
# Uses .env.local automatically
npm run dev
```

### Testing

```bash
# Uses .env.test if exists, otherwise .env.local
npm test
```

### Production

```bash
# Load from .env.production
NODE_ENV=production npm start

# Or via deployment platform (Vercel, Docker, etc.)
# Platform loads variables from dashboard/config
```

### Docker

```bash
# Method 1: Command-line
docker run -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=... \
  ai-chatbot:latest

# Method 2: .env file
docker run --env-file .env.local ai-chatbot:latest

# Method 3: docker-compose (reads .env automatically)
docker-compose up
```

### Vercel

1. Go to Vercel Dashboard → Project → Settings
2. Click "Environment Variables"
3. Add each variable:
   - Name: `OPENAI_API_KEY`
   - Value: `sk-...`
   - Environment: Select "Production"
4. Click "Save"
5. Redeploy for changes to take effect

---

## 🔐 Security Best Practices

### 1. Never Commit Secrets

```bash
# ✅ Good - .gitignore prevents this
.env.local
.env.production

# ❌ Bad - Never do this
OPENAI_API_KEY=sk-xxxx  # In .env or code
```

### 2. Use Different Keys for Each Environment

```bash
# Development uses cheaper API tier
OPENAI_MODEL=gpt-3.5-turbo

# Production uses better model
OPENAI_MODEL=gpt-4
```

### 3. Rotate Keys Regularly

- **Frequency**: Every 3-6 months
- **Process**:
  1. Generate new key in provider dashboard
  2. Test with new key locally
  3. Update production environment
  4. Delete old key from provider

### 4. Monitor API Usage

- **OpenAI**: https://platform.openai.com/account/billing/overview
- **Shopify**: Shopify Admin → Analytics

### 5. Use Rate Limiting

```bash
# Prevent abuse
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
```

---

## ✅ Validation Checklist

Before deploying, verify:

- [ ] `.env.local` created from `.env.example`
- [ ] All required variables filled in
- [ ] `OPENAI_API_KEY` is valid (starts with `sk-`)
- [ ] `SHOPIFY_STORE_DOMAIN` is correct format
- [ ] `.env.local` is in `.gitignore`
- [ ] Build succeeds: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] App starts: `npm start`
- [ ] Health check responds: `curl http://localhost:3000/health`
- [ ] No secrets in code (grep -r "sk-")
- [ ] Production env variables set in Vercel/Docker

---

## 🧪 Testing Configuration

### Local Testing

```bash
# Development environment (mocks disabled)
npm test

# With real API calls
MOCK_OPENAI=false MOCK_SHOPIFY=false npm test

# Coverage report
npm test -- --coverage
```

### CI/CD Testing

GitHub Actions will use environment secrets:

```yaml
# In .github/workflows/test.yml
- name: Run Tests
  env:
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
    SHOPIFY_STORE_DOMAIN: ${{ secrets.SHOPIFY_STORE_DOMAIN }}
    # ... etc
  run: npm test
```

---

## 🌍 Deployment Configuration

### Vercel Environment Variables

Set in Vercel Dashboard → Settings → Environment Variables:

```
OPENAI_API_KEY         [Production]
SHOPIFY_STORE_DOMAIN   [Production]
SHOPIFY_STOREFRONT_ACCESS_TOKEN [Production]
SHOPIFY_ADMIN_API_TOKEN [Production]
NODE_ENV=production
LOG_LEVEL=info
```

### Docker Environment Variables

Option 1: Command-line
```bash
docker run -e OPENAI_API_KEY=sk-... \
           -e SHOPIFY_STORE_DOMAIN=... \
           ai-chatbot:latest
```

Option 2: Environment file
```bash
docker run --env-file .env.production ai-chatbot:latest
```

Option 3: docker-compose
```yaml
services:
  ai-chatbot:
    environment:
      OPENAI_API_KEY: ${OPENAI_API_KEY}
      SHOPIFY_STORE_DOMAIN: ${SHOPIFY_STORE_DOMAIN}
      # ... etc
```

---

## 🆘 Troubleshooting

### Error: "OPENAI_API_KEY is not defined"

**Cause**: Environment variable not loaded

**Solutions**:
1. Check file exists: `ls -la .env.local`
2. Verify variable is set: `echo $OPENAI_API_KEY`
3. Reload shell: `source .env.local`
4. Check for typos in variable name

### Error: "Invalid API Key"

**Cause**: Incorrect or expired key

**Solutions**:
1. Verify key format: `echo $OPENAI_API_KEY | head -c 10`
   - Should start with `sk-`
2. Check key is active in provider dashboard
3. Generate new key if expired

### Error: "Invalid store domain"

**Cause**: Wrong Shopify domain format

**Solutions**:
1. Verify format: `your-store.myshopify.com`
2. Check for typos
3. Confirm store exists in Shopify

### Docker: "Environment variable not found"

**Cause**: Variables not passed to container

**Solutions**:
1. Use `--env-file`: `docker run --env-file .env.production`
2. Use `-e` flag: `docker run -e VAR=value`
3. Check docker-compose.yml has environment section

---

## 📚 Related Documentation

- **Vercel Deployment**: [docs/VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)
- **Docker Setup**: [docs/DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
- **Project Setup**: [README.md](../README.md)
- **Security**: [.github/BRANCHING_STRATEGY.md](../.github/BRANCHING_STRATEGY.md)

---

## 🎯 Environment Variables Summary

| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| OPENAI_API_KEY | ✅ | - | sk-... |
| OPENAI_MODEL | ❌ | gpt-4 | gpt-3.5-turbo |
| SHOPIFY_STORE_DOMAIN | ✅ | - | store.myshopify.com |
| SHOPIFY_STOREFRONT_ACCESS_TOKEN | ✅ | - | shopify_... |
| SHOPIFY_ADMIN_API_TOKEN | ✅ | - | shpat_... |
| PORT | ❌ | 3000 | 3000 |
| NODE_ENV | ❌ | development | production |
| LOG_LEVEL | ❌ | debug | info |

---

**Last Updated**: November 5, 2025  
**Status**: Production-ready ✅
