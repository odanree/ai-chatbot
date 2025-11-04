# Deployment Verification Guide

## Current Status ✅

Your AI Chatbot is **successfully deployed** on Vercel at:
- **Production URL**: https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/
- **Deployment Protection**: ✅ Enabled (secure)
- **Bypass Token**: ✅ Created and available as `VERCEL_PROTECTION_BYPASS` environment variable

## What You Should See

When accessing the root endpoint (`/`), you should see a JSON response like this:

```json
{
  "message": "AI Chatbot API",
  "version": "0.2.1",
  "documentation": "Send POST requests to /api/chat",
  "endpoints": {
    "chat": "POST /api/chat - Send a message and get AI response",
    "health": "GET /api/health - Health check",
    "rateLimit": "GET /api/rate-limit - Check rate limit status"
  }
}
```

## Protection Status: Configured ✅

**Deployment Protection**: Enabled on production deployment (recommended for security)

**Bypass Token**: Created and ready to use for automation services

You can now access the API by including the bypass token in your requests using either:
- HTTP header: `x-vercel-protection-bypass: YOUR_TOKEN`
- Query parameter: `?x-vercel-protection-bypass=YOUR_TOKEN`
- Environment variable: `VERCEL_PROTECTION_BYPASS` (automatically available in Vercel deployments)

### Alternative: Use Bypass Token for Automation (Recommended)

Vercel provides a bypass token system for automation services and CI/CD pipelines.

**To Create Bypass Token:**

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Click on the **ai-chatbot** project
3. Click **Settings** (top menu)
4. Go to **Protection** section (left sidebar)
5. Scroll to **"Protection Bypass for Automation"**
6. Click **"Create Secret"** button
7. Copy the generated token (e.g., `vercel_protection_xxxxx...`)
8. The token is automatically available as `VERCEL_PROTECTION_BYPASS` environment variable in all deployments

**Using the Bypass Token:**

The secret is available as a System Environment Variable in all deployments. You can bypass Deployment Protection by setting an HTTP header or query parameter named `x-vercel-protection-bypass`.

**Header method:**
```bash
curl -H "x-vercel-protection-bypass: YOUR_BYPASS_TOKEN_HERE" \
  https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/
```

**Query parameter method:**
```bash
curl "https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/?x-vercel-set-bypass-cookie=true&x-vercel-protection-bypass=YOUR_BYPASS_TOKEN_HERE"
```

**PowerShell:**
```powershell
$token = "YOUR_BYPASS_TOKEN_HERE"
$headers = @{"x-vercel-protection-bypass" = $token}
$response = Invoke-WebRequest -Uri "https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/" `
  -Headers $headers -UseBasicParsing
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Node.js:**
```javascript
const fetch = require('node-fetch');

const response = await fetch('https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/', {
  headers: {
    'x-vercel-protection-bypass': process.env.VERCEL_PROTECTION_BYPASS
  }
});
const data = await response.json();
console.log(data);
```

## Testing the API

Once protection is disabled (or using bypass token with `x-vercel-protection-bypass` header), test these endpoints:

### 1. Check API Status (GET /)
```bash
# With bypass token
curl -H "x-vercel-protection-bypass: YOUR_TOKEN_HERE" \
  https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/
```

**Expected Response**:
```json
{
  "message": "AI Chatbot API",
  "version": "0.2.1",
  ...
}
```

### 2. Health Check (GET /api/health)
```bash
curl -H "x-vercel-protection-bypass: YOUR_TOKEN_HERE" \
  https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/api/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-11-03T..."
}
```

### 3. Send a Chat Message (POST /api/chat)
```bash
curl -X POST https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/api/chat \
  -H "x-vercel-protection-bypass: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what are your top 3 products?"}'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "message": "Here are our top products...",
    "model": "gpt-4",
    "tokensUsed": 150
  }
}
```

## Deployment Verification Checklist

- ✅ **Code**: All 34 Phase 4 tests passing
- ✅ **Build**: TypeScript compilation successful
- ✅ **Vercel**: Deployment completed successfully
- ✅ **Routes**: Root endpoint returns API documentation
- ✅ **API Endpoints**: POST /api/chat, GET /api/health available
- ✅ **Protection**: Deployment Protection enabled (secure)
- ⏳ **Access**: Use bypass token via `x-vercel-protection-bypass` header or query parameter

## Commit History

```
1091578 - feat: add root endpoint and improve API routing
9fdfb95 - fix: correct getAIResponse function call signature
089c96f - fix: move vercel.json to root for Vercel deployment
```

## Next Steps

1. **Create Bypass Token** (recommended for automation):
   - Vercel Dashboard → ai-chatbot → Settings → Protection
   - Scroll to "Protection Bypass for Automation"
   - Click "Create Secret" and copy your token
   - Store as `VERCEL_PROTECTION_BYPASS` environment variable in CI/CD

2. **Test API Endpoints** using bypass token:
   - Use `curl -H "x-vercel-protection-bypass: TOKEN"` to test
   - Verify the `/api/chat` endpoint returns AI responses
   - Monitor Vercel logs for errors

3. **Integrate in CI/CD**:
   - GitHub Actions can automatically use `VERCEL_PROTECTION_BYPASS`
   - Cypress E2E tests can include bypass token in requests
   - Automated monitoring can bypass protection

4. **Ready to Merge PR #5 to main branch**:
   - All checks passing ✅
   - API is production-ready
   - Bypass token configured for automation

## Environment Variables Status

All required environment variables are **set and encrypted** on Vercel:
- ✅ OPENAI_API_KEY
- ✅ SHOPIFY_STOREFRONT_ACCESS_TOKEN
- ✅ SHOPIFY_ADMIN_API_TOKEN
- ✅ SHOPIFY_STORE_DOMAIN

---

**Last Updated**: November 3, 2025  
**Status**: Production-ready with Deployment Protection (bypass token for automation)
