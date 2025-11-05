# 🚀 Vercel Deployment Guide

> Complete setup instructions for deploying AI Chatbot to Vercel production environment.

---

## ✅ Prerequisites

Before deploying, ensure you have:

- [ ] Vercel account (https://vercel.com)
- [ ] GitHub repository connected to Vercel
- [ ] Node.js 18+ installed locally
- [ ] All environment variables configured
- [ ] All tests passing locally (`npm test`)
- [ ] Build successful locally (`npm run build`)

---

## 📋 Step-by-Step Setup

### Step 1: Connect Repository to Vercel

```bash
# Option A: Via Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Click "Import Project"
# 3. Select "GitHub" as source
# 4. Authorize Vercel to access your GitHub
# 5. Select repository: odanree/ai-chatbot
# 6. Click "Import"

# Option B: Via Vercel CLI
npm install -g vercel
vercel link
# Follow prompts to connect repository
```

---

### Step 2: Configure Environment Variables

#### Production Environment (.env.production)

Create `.env.production` in project root:

```bash
# Vercel will prompt for these during setup, or add via dashboard

# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4

# Shopify Configuration
SHOPIFY_STORE_DOMAIN=odanree.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=...
SHOPIFY_ADMIN_API_TOKEN=...

# Server Configuration
PORT=3000
NODE_ENV=production

# Logging
LOG_LEVEL=info
```

#### Add via Vercel Dashboard

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add each variable:
   - Select "Production" environment
   - Enter variable name and value
   - Click "Save"

**Required Variables**:
- `OPENAI_API_KEY`
- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_TOKEN`

---

### Step 3: Configure Build Settings

Your `vercel.json` is pre-configured with:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "express"
}
```

**Build Process**:
1. Install dependencies: `npm install`
2. Run build: `npm run build` (compiles TypeScript to `dist/`)
3. Deploy `dist/` to Vercel

---

### Step 4: Deploy

#### Option A: Automatic Deployment (Recommended)

Once repository is connected, deployments happen automatically:

- **Main Branch**: Produces production deployment (automatic)
- **Other Branches**: Produce preview deployments
- **Pull Requests**: Get preview URLs for testing

```
main branch push → build → test → deploy to production
       ↓
    Vercel automatically deploys
```

#### Option B: Manual Deployment via CLI

```bash
# Deploy to production
vercel --prod

# Deploy to preview (for testing)
vercel

# View deployment logs
vercel logs
```

---

## 🔍 Verification Checklist

After deployment, verify everything is working:

- [ ] Health Check: `GET https://your-domain.com/api/chat` returns 200
- [ ] API Endpoint: `POST https://your-domain.com/api/chat` accepts requests
- [ ] Environment: Variables are loaded correctly
- [ ] Logs: No errors in Vercel dashboard logs
- [ ] Database: Shopify and OpenAI connections working
- [ ] Response Time: < 1 second for chat requests

### Health Check Command

```bash
# Test the deployment
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Expected response
{
  "response": "Hello! How can I help you today?"
}
```

---

## 🌍 Domain Configuration

### Custom Domain

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `chatbot.yourdomain.com`)
3. Update DNS records (Vercel will provide instructions)
4. Wait for DNS propagation (5-15 minutes)

### SSL/TLS Certificate

- **Automatic**: Vercel provides free SSL certificates
- **Status**: Check in Settings → Domains
- **Renewal**: Automatic (no action needed)

---

## 📊 Monitoring & Debugging

### View Logs

```bash
# Via CLI
vercel logs

# Via Dashboard
# 1. Go to Vercel Dashboard
# 2. Select your project
# 3. Click "Deployments"
# 4. Select deployment
# 5. Click "Logs"
```

### Check Deployment Status

```bash
# Via CLI
vercel status

# Via Dashboard
# 1. Go to Deployments tab
# 2. View status badge
# 3. Click for details
```

### Performance Monitoring

Vercel automatically tracks:
- Response times
- Error rates
- CPU usage
- Memory usage
- Cold start times

View in: Dashboard → Analytics

---

## 🔄 CI/CD Integration

Your deployment is now part of the CI/CD pipeline:

```
Push to main
     ↓
GitHub checks running
     ↓
npm run build (verify compilation)
npm test (run 215+ tests)
     ↓
Vercel preview deployment
     ↓
All checks pass ✅
     ↓
Auto-merge & production deploy
```

---

## 🐛 Troubleshooting

### Build Fails

**Error**: `npm run build` fails

**Solution**:
1. Check `npm run build` works locally
2. Verify all dependencies are in `package.json`
3. Check for TypeScript errors: `npx tsc --noEmit`
4. View build logs in Vercel dashboard

### Environment Variables Not Found

**Error**: `Error: OPENAI_API_KEY is not set`

**Solution**:
1. Verify variables in Vercel dashboard (Settings → Environment Variables)
2. Ensure variables are set for "Production" environment
3. Redeploy after adding variables
4. Check `.env.production` file exists locally

### Deployment Timeout

**Error**: Build takes > 10 minutes

**Solution**:
1. Check for large dependencies
2. Optimize build process
3. Contact Vercel support if persistent
4. Increase timeout in `vercel.json` (maxDuration)

### API Errors in Production

**Error**: 500 errors from `/api/chat`

**Solution**:
1. Check logs: `vercel logs`
2. Verify environment variables are correct
3. Check OpenAI/Shopify API status
4. Test with simple message first
5. Check error handling in `src/api/index.ts`

---

## 🔐 Security Best Practices

### Protect Secrets

- ✅ **Never** commit `.env.local` or `.env.production`
- ✅ Use Vercel's environment variable interface
- ✅ Rotate API keys regularly
- ✅ Use separate keys for development/production

### Rate Limiting

Already configured in Express middleware:

```typescript
// Prevents abuse
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
}));
```

### CORS Configuration

Configure in `src/api/index.ts`:

```typescript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

---

## 📈 Scaling & Performance

### Auto-Scaling

Vercel automatically scales based on demand:
- Adds more serverless functions during high traffic
- Reduces functions during low traffic
- **Cost**: Pay only for what you use

### Performance Optimization

Already implemented:
- ✅ TypeScript compilation optimizations
- ✅ Tree-shaking unused code
- ✅ Bundle optimization
- ✅ Cold start < 500ms

### CDN Caching

Configure in `vercel.json` headers:

```json
"headers": [
  {
    "source": "/api/(.*)",
    "headers": [
      {
        "key": "Cache-Control",
        "value": "no-cache"
      }
    ]
  }
]
```

---

## 🚀 First Deployment

### Initial Deploy Steps

1. **Prepare locally**
   ```bash
   npm install
   npm run build
   npm test
   # Ensure all tests pass ✅
   ```

2. **Connect to Vercel**
   ```bash
   vercel link
   ```

3. **Add environment variables**
   - Via Vercel dashboard or CLI
   - Set all required variables

4. **Deploy**
   ```bash
   vercel --prod
   ```

5. **Verify**
   - Check deployment status
   - Test API endpoint
   - Monitor logs

### Timeline

| Step | Time |
|------|------|
| Build | 1-2 min |
| Deploy | 1-2 min |
| DNS Propagation | 5-15 min |
| Total | 10-20 min |

---

## 📞 Support & Resources

### Vercel Documentation
- Main Docs: https://vercel.com/docs
- Node.js Guide: https://vercel.com/docs/frameworks/express
- Troubleshooting: https://vercel.com/support

### AI Chatbot Documentation
- Project README: [README.md](../README.md)
- Architecture: [docs/architecture.md](architecture.md)
- API Reference: [docs/api/](./api/)

### GitHub Workflow
- See: [.github/BRANCHING_STRATEGY.md](../.github/BRANCHING_STRATEGY.md)
- PR Template: [.github/pull_request_template.md](../.github/pull_request_template.md)

---

## ✅ Deployment Checklist

Before going live:

- [ ] All 215+ tests passing locally
- [ ] Build successful: `npm run build`
- [ ] Environment variables configured
- [ ] vercel.json configured and reviewed
- [ ] Custom domain set up (if applicable)
- [ ] SSL certificate verified
- [ ] Health check successful
- [ ] Logs reviewed (no errors)
- [ ] Performance acceptable (< 1s response time)
- [ ] Team notified of deployment
- [ ] Monitoring set up in Vercel dashboard

---

## 🎉 You're Live!

Your AI Chatbot is now deployed to production on Vercel!

**Production URL**: https://your-domain.vercel.app
**API Endpoint**: https://your-domain.vercel.app/api/chat

Next steps:
- Monitor performance in Vercel dashboard
- Set up error alerts
- Collect user feedback
- Plan Phase 7 enhancements

---

**Last Updated**: November 5, 2025  
**Status**: Ready for deployment ✅
