# ⚡ Vercel Deployment Quick Reference

> Quick setup card for Vercel deployment (5-minute setup).

---

## 🚀 5-Minute Setup

### 1. Connect Repository
```bash
npm install -g vercel
vercel link
# Select GitHub repo: odanree/ai-chatbot
```

### 2. Add Environment Variables
Via Vercel Dashboard:
- `OPENAI_API_KEY` → your-key
- `SHOPIFY_STORE_DOMAIN` → odanree.myshopify.com
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` → your-token
- `SHOPIFY_ADMIN_API_TOKEN` → your-token

### 3. Deploy
```bash
# Test locally first
npm run build && npm test

# Deploy to production
vercel --prod
```

### 4. Verify
```bash
# Health check
curl -X POST https://your-domain.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hi"}'
```

---

## 📊 Common Commands

| Task | Command |
|------|---------|
| Deploy to production | `vercel --prod` |
| Deploy preview | `vercel` |
| View logs | `vercel logs` |
| Check status | `vercel status` |
| Remove project | `vercel remove` |
| Inspect deployment | `vercel inspect` |

---

## 🔗 Key Links

- **Dashboard**: https://vercel.com/dashboard
- **Project Docs**: `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- **Config File**: `vercel.json`

---

**Status**: ✅ Ready to deploy
