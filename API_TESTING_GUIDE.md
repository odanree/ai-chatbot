# API Testing Guide

## Quick Start

### Step 1: Get Your Bypass Token

1. Go to: https://vercel.com/dashboard
2. Click **ai-chatbot** project
3. Click **Settings** → **Protection** (left sidebar)
4. Find **"Protection Bypass for Automation"** section
5. Copy the token (looks like: `vercel_protection_xxxxx...`)

### Step 2: Add Token to Environment

Add your bypass token to `.env.local`:

```bash
VERCEL_PROTECTION_BYPASS=your_token_here
```

### Step 3: Run Tests

**Using PowerShell (Recommended on Windows):**
```powershell
cd C:\Users\Danh\Desktop\ai-chatbot
.\test-api.ps1
```

**Using Node.js:**
```bash
cd C:\Users\Danh\Desktop\ai-chatbot
node test-api.js
```

## What the Tests Check

1. **GET /** - API info and documentation
2. **GET /api/health** - Server health status
3. **GET /api/rate-limit** - Rate limit status
4. **POST /api/chat** - Chat endpoint with sample message

## Expected Results

✅ All 4 tests should pass with 2xx status codes:

```
🚀 Testing AI Chatbot API Deployment

📍 API URL: https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app
🔐 Using bypass token: vercel_protection_xxxxx...

📡 GET /
   https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/
✅ Success (200)
   Response: {
     "message": "AI Chatbot API",
     "version": "0.2.1",
     "documentation": "Send POST requests to /api/chat",
     ...
   }

[... more tests ...]

📊 TEST SUMMARY
✅ Passed: 4/4

🎉 All tests passed! API is working correctly.
```

## Testing Manually with curl

If you prefer testing individual endpoints:

```bash
# Test root endpoint
curl -H "x-vercel-protection-bypass: YOUR_TOKEN_HERE" \
  https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/

# Test health endpoint
curl -H "x-vercel-protection-bypass: YOUR_TOKEN_HERE" \
  https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/api/health

# Test chat endpoint
curl -X POST \
  -H "x-vercel-protection-bypass: YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!"}' \
  https://ai-chatbot-5hcr004k7-danh-les-projects.vercel.app/api/chat
```

## Troubleshooting

### "VERCEL_PROTECTION_BYPASS not set"
- Make sure you've added the token to `.env.local`
- Token should be the full value from Vercel dashboard (starts with `vercel_protection_`)
- Don't forget to save the file

### "Authentication Required" error
- Your bypass token might be incorrect or expired
- Try creating a new token in Vercel dashboard
- Copy the entire token value (don't include quotes)

### "Cannot find module 'dotenv'"
- Run: `npm install dotenv`
- Or just manually set the environment variable before running

## Files

- `test-api.ps1` - PowerShell test script (recommended for Windows)
- `test-api.js` - Node.js test script
- `.env.local` - Environment variables (add your token here)

---

**Status**: All API endpoints tested and verified ✅
