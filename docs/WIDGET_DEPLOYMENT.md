# Chat Widget Deployment Guide

## Overview

This guide explains how to deploy the AI Chatbot widget to production and embed it in customer websites.

## Deployment Steps

### 1. Deploy API Server

Deploy the AI Chatbot backend to Vercel, AWS, or your preferred hosting:

```bash
npm run build
vercel --prod  # or your deployment command
```

**Important**: Note your deployed API URL (e.g., `https://ai-chatbot.vercel.app`)

### 2. Host Widget Files

Host these static files on a CDN or web server:

- `public/chat-widget.js` - Main widget script (~15KB)
- `public/chat-widget.css` - Optional stylesheet (~8KB)

**Option A: CDN (Recommended)**
- Upload to CloudFlare, AWS CloudFront, or Vercel static hosting
- Example URLs:
  - `https://cdn.example.com/chat-widget.js`
  - `https://cdn.example.com/chat-widget.css`

**Option B: Same Server**
- Serve from your API domain
- Example URLs:
  - `https://api.example.com/chat-widget.js`
  - `https://api.example.com/chat-widget.css`

### 3. Configure CORS

Update your API server to allow requests from customer domains:

**In `src/api/index.ts`** (or your Express server):

```typescript
app.use(cors({
  origin: [
    'https://customer-store-1.com',
    'https://customer-store-2.com',
    'https://example-domain.com',
    // Add more customer domains here
  ],
  credentials: true,
}));
```

Or for development/testing:

```typescript
app.use(cors({ origin: '*' })); // NOT recommended for production
```

## Embedding the Widget

### For Shopify Stores

1. Log into Shopify Admin
2. Go to **Settings → Apps and integrations → App and sales channel settings**
3. Create custom app or use existing
4. Add to **Online Store → Theme**
5. In theme editor, add to `theme.liquid`:

```liquid
<link rel="stylesheet" href="https://your-domain.com/chat-widget.css">
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  AIChatbot.init({
    apiUrl: 'https://your-api-domain.com',
    title: 'Customer Support',
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

### For Custom Websites

Add to HTML template (before `</body>`):

```html
<link rel="stylesheet" href="https://your-domain.com/chat-widget.css">
<script src="https://your-domain.com/chat-widget.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    AIChatbot.init({
      apiUrl: 'https://your-api-domain.com',
      title: 'Help & Support',
      position: 'bottom-right',
      theme: 'light',
      width: '380px',
      height: '550px'
    });
  });
</script>
```

### For React/Next.js Applications

Create a custom hook:

```typescript
// hooks/useAIChatbot.ts
import { useEffect } from 'react';

export function useAIChatbot(config: any = {}) {
  useEffect(() => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://your-domain.com/chat-widget.css';
    document.head.appendChild(link);

    // Load widget script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/chat-widget.js';
    script.async = true;
    document.body.appendChild(script);

    // Initialize when script loads
    script.onload = () => {
      (window as any).AIChatbot?.init({
        apiUrl: 'https://your-api-domain.com',
        ...config
      });
    };
  }, [config]);
}

// Usage in component
export default function App() {
  useAIChatbot({ position: 'bottom-right', theme: 'dark' });
  return <div>...</div>;
}
```

## Configuration for Different Websites

### Example 1: E-commerce Store

```html
<script>
  AIChatbot.init({
    apiUrl: 'https://api.example.com',
    title: 'Product Assistant',
    placeholder: 'Ask about our products...',
    position: 'bottom-right',
    theme: 'light'
  });
</script>
```

### Example 2: Support Portal

```html
<script>
  AIChatbot.init({
    apiUrl: 'https://api.example.com',
    title: 'Support Team',
    placeholder: 'Describe your issue...',
    position: 'bottom-left',
    theme: 'dark'
  });
</script>
```

### Example 3: Documentation Site

```html
<script>
  AIChatbot.init({
    apiUrl: 'https://api.example.com',
    title: 'Docs Helper',
    placeholder: 'Ask documentation questions...',
    position: 'top-right',
    theme: 'light',
    width: '350px',
    height: '400px'
  });
</script>
```

## Monitoring & Analytics

### Track Widget Usage

After initializing the widget, you can monitor conversations:

```html
<script>
  // Initialize widget
  AIChatbot.init({ apiUrl: 'https://api.example.com' });

  // Monitor messages
  setInterval(() => {
    const history = AIChatbot.getHistory();
    if (history.length > 0) {
      // Send to your analytics service
      console.log('Chat messages:', history);
      fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ messages: history })
      });
    }
  }, 30000); // Check every 30 seconds
</script>
```

### Vercel Analytics Integration

If deployed on Vercel:

```bash
npm install @vercel/analytics
```

```typescript
// src/api/index.ts
import { analyticsHandler } from '@vercel/analytics/server';
app.use(analyticsHandler());
```

## Performance Optimization

### 1. Minify Widget Files

```bash
npm install -g terser
terser public/chat-widget.js -o public/chat-widget.min.js -c -m
```

Use `chat-widget.min.js` in production.

### 2. Enable Caching

**For Vercel:**

```json
{
  "headers": [
    {
      "source": "/chat-widget.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=86400"
        }
      ]
    }
  ]
}
```

### 3. Use CDN

Host widget files on CDN for faster delivery:
- CloudFlare
- AWS CloudFront
- Akamai
- Fastly

## Security Checklist

- [ ] API endpoint requires authentication (if needed)
- [ ] CORS is properly configured for allowed domains
- [ ] API key is not exposed in client-side code
- [ ] User input is validated and sanitized
- [ ] API responses are escaped to prevent XSS
- [ ] Rate limiting is enabled on `/api/chat`
- [ ] HTTPS is used for all requests

## Troubleshooting Deployment

### Issue: Widget not loading

**Solution**: Check browser console for CORS errors. Verify:
- Widget URL is accessible
- CSS file is loading
- No 404 errors in Network tab

### Issue: "Failed to fetch" errors

**Solution**: Verify CORS configuration:
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
```

### Issue: Widget appears but messages don't send

**Solution**: Check API endpoint configuration:
1. Verify `apiUrl` matches deployed API domain
2. Test endpoint manually: `curl -X POST https://your-api.com/api/chat`
3. Check API server logs for errors

### Issue: Styling conflicts

**Solution**: Add CSS namespace prefix:
```html
<style>
  #ai-chatbot-widget {
    z-index: 9999 !important;
  }
</style>
```

## Version Management

Track widget versions for caching:

```html
<!-- Production v1.0 (long cache) -->
<script src="https://cdn.example.com/chat-widget-v1.0.js"></script>

<!-- Or use query params for cache busting -->
<script src="https://cdn.example.com/chat-widget.js?v=1.0"></script>
```

Update `package.json` version and deploy:

```json
{
  "version": "1.0.1",
  "description": "AI Chatbot with widget v1.0.1"
}
```

## Support

For deployment issues, check:
- [Chat Widget Guide](CHAT_WIDGET.md)
- [Architecture Overview](architecture.md)
- GitHub Issues: https://github.com/odanree/ai-chatbot/issues
