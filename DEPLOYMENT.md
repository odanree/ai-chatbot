# 🚀 AI Chatbot Deployment Guide

**Last Updated**: November 3, 2025  
**Version**: v0.2.1  
**Status**: Ready for Production

---

## 📋 Deployment Options

### Option 1: Vercel (Recommended - Easiest)
- Zero-config deployment
- Automatic CI/CD
- Free tier available
- Production URL assigned instantly

### Option 2: Docker + Self-Hosted
- Full control over environment
- Requires server infrastructure
- Higher operational overhead

### Option 3: GitHub Actions + Any Cloud
- Custom CI/CD pipeline
- Works with AWS, Azure, GCP, etc.

---

## 🎯 Quick Start: Vercel Deployment

### Prerequisites
```bash
npm install -g vercel  # Install Vercel CLI
```

### Step 1: Build Locally (Verification)
```bash
npm run build
```

Expected output:
```
✅ Compilation successful
✅ dist/ folder created with JS files
✅ Ready to deploy
```

### Step 2: Deploy to Vercel
```bash
vercel --prod
```

First time setup:
```
? Set up and deploy "~/ai-chatbot"? [Y/n] → Y
? Which scope should contain your project? → Your GitHub account
? Link to existing project? [y/N] → N (first deploy)
? What's your project's name? → ai-chatbot
? In which directory is your code located? → .
? Want to modify vercel.json? [y/N] → N
```

### Step 3: Verify Deployment
```bash
vercel --prod --inspect
```

Output will show:
- ✅ Deployment URL
- ✅ Environment variables status
- ✅ Build logs
- ✅ Function endpoints

---

## 🔑 Environment Variables Setup

Create `.env.production` in project root:

```bash
OPENAI_API_KEY=sk-... (from OpenAI dashboard)
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=... (from Shopify admin)
SHOPIFY_ADMIN_API_TOKEN=... (from Shopify admin)
PORT=3000 (Vercel default)
```

Then add to Vercel:
```bash
vercel env add OPENAI_API_KEY
vercel env add SHOPIFY_STORE_DOMAIN
vercel env add SHOPIFY_STOREFRONT_ACCESS_TOKEN
vercel env add SHOPIFY_ADMIN_API_TOKEN
```

---

## ✅ Pre-Deployment Checklist

- [ ] All tests passing locally: `npm test`
- [ ] Build succeeds locally: `npm run build`
- [ ] `.env.local` has all required variables
- [ ] No console errors on `npm run dev`
- [ ] Code committed and pushed to dev branch
- [ ] API endpoint tested: `curl http://localhost:4000/api/chat`

---

## 🐳 Docker Deployment (Alternative)

### Build Docker Image
```bash
docker build -t ai-chatbot:v0.2.1 .
```

### Run Locally
```bash
docker run -p 4000:4000 \
  -e OPENAI_API_KEY=sk-... \
  -e SHOPIFY_STORE_DOMAIN=your-store.myshopify.com \
  ai-chatbot:v0.2.1
```

### Push to Docker Hub
```bash
docker tag ai-chatbot:v0.2.1 yourusername/ai-chatbot:v0.2.1
docker push yourusername/ai-chatbot:v0.2.1
```

---

## 📊 Production Monitoring

After deployment, monitor:

1. **Error Logs**
   ```bash
   vercel logs [deployment-url]
   ```

2. **Performance**
   - Response times
   - Error rates
   - API rate limits

3. **Uptime**
   - Set up monitoring (Vercel dashboard shows this)
   - Alert on failures

---

## 🔄 Rollback (If Issues)

```bash
# View deployment history
vercel list

# Rollback to previous version
vercel rollback
```

---

## 📱 Test Production Deployment

### API Endpoint Test
```bash
curl -X POST https://[your-deployment].vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What products do you have?"}'
```

Expected response:
```json
{
  "response": "I found these products...",
  "metadata": {
    "intent": "PRODUCT_INQUIRY",
    "confidence": 0.85,
    "timestamp": "2025-11-03T..."
  }
}
```

---

## 🚨 Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
npm run build

# Verify all imports are correct
grep -r "require(" src/ 
# Should be none - all should be ES6 imports
```

### Environment Variables Missing
```bash
vercel env ls  # List all env vars
vercel env pull .env.local  # Pull from Vercel
```

### API Not Responding
1. Check logs: `vercel logs [url]`
2. Verify env vars are set
3. Test locally first: `npm run dev`
4. Check OpenAI/Shopify API keys are valid

---

## 🎉 Success Indicators

✅ Deployment shows green status on Vercel dashboard  
✅ API endpoint responds successfully  
✅ No errors in logs  
✅ Response time < 1 second  
✅ Can make requests from external sources  

---

## 📞 Next Steps

1. **Monitor** - Keep eye on logs for 24 hours
2. **Test** - Try the API from different sources
3. **Document** - Update deployment URL in docs
4. **Share** - Give team the production URL
5. **Phase 5** - Start comprehensive testing suite

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [ROADMAP.md](ROADMAP.md) - Full timeline
- `/docs/` - Additional guides

