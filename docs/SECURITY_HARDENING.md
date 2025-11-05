# 🔐 Security Hardening Guide

> Environment security best practices, secret management, and deployment hardening procedures.

---

## 🎯 Security Layers

```
┌─────────────────────────────────────┐
│   Application Security              │  Authentication, input validation, logging
├─────────────────────────────────────┤
│   Environment Security              │  Secret management, variable protection
├─────────────────────────────────────┤
│   Deployment Security               │  Container hardening, network isolation
├─────────────────────────────────────┤
│   Infrastructure Security           │  HTTPS, firewalls, access control
└─────────────────────────────────────┘
```

---

## 🔑 Secret Management

### 1. Environment Variable Protection

#### Development (.env.local)

```bash
# ✅ DO: Use .env.local for development
OPENAI_API_KEY=sk-dev-...
SHOPIFY_ADMIN_API_TOKEN=...

# ✅ DO: Add to .gitignore
echo ".env.local" >> .gitignore

# ✅ DO: Use different keys than production
# Development keys are cheap, use liberally for testing

# ❌ DON'T: Commit .env files
git commit .env.local  # NO - will fail if gitignore working

# ❌ DON'T: Store in code
const API_KEY = "sk-...";  // NO - visible in github
```

#### Production (.env.production)

```bash
# ✅ DO: Store in platform secrets
# Vercel Dashboard → Settings → Environment Variables
# Docker: use --env-file or container registry secrets
# Kubernetes: use Secrets object

# ❌ DON'T: Commit to git
git add .env.production  # NO - dangerous

# ❌ DON'T: Share in chat, email, or Slack
# If shared, rotate the key immediately
```

### 2. Secret Rotation

#### Quarterly Rotation

**Schedule**: First Monday of Q1, Q2, Q3, Q4

**Procedure**:

1. **Generate New Keys**
   - OpenAI: https://platform.openai.com/account/api-keys → Create new secret key
   - Shopify: Apps → Develop Apps → Your App → Configuration → Regenerate

2. **Test New Keys Locally**
   ```bash
   # Update .env.local with new key
   OPENAI_API_KEY=sk-new-...
   
   # Test
   npm test
   npm run dev
   
   # Verify API calls work
   ```

3. **Deploy to Staging**
   ```bash
   # Update staging environment in Vercel
   # Run smoke tests
   ```

4. **Deploy to Production**
   ```bash
   # Update production environment
   # Monitor logs for errors
   # If issues, rollback to old key
   ```

5. **Deactivate Old Keys**
   - Wait 24 hours (in case rollback needed)
   - Delete old keys from provider dashboard
   - Update team documentation

#### Emergency Rotation

**When to rotate immediately**:
- Key accidentally committed to git
- Key shared in public channel
- Unauthorized API activity detected
- Team member leaves company

**Procedure**:
1. Immediately disable old key in provider
2. Generate new key
3. Deploy new key to all environments
4. Verify no service outages
5. Audit logs for unauthorized usage

### 3. API Key Validation

```bash
# Never trust user-provided keys
# Always validate before using

# ✅ OpenAI Key Format
# - Starts with: sk-
# - Length: ~48 characters
# - Characters: alphanumeric + hyphens

# ✅ Shopify Token Format  
# - Storefront: shopify_[a-z0-9]+
# - Admin: shpat_[a-z0-9]+

# Validation function (TypeScript example)
function isValidOpenAIKey(key: string): boolean {
  if (!key.startsWith('sk-')) return false;
  if (key.length < 40) return false;
  return /^sk-[a-zA-Z0-9]+$/.test(key);
}
```

---

## 🛡️ Application Security

### 1. Rate Limiting

```bash
# Prevent abuse - in .env.production
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # 100 requests per window
```

**Implementation**:
```typescript
// src/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
});

export default limiter;
```

**HTTP Headers Returned**:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1234567890
```

### 2. Request Timeout

```bash
# Prevent hanging requests - in .env.production
REQUEST_TIMEOUT_MS=30000  # 30 seconds
```

**Implementation**:
```typescript
// src/middleware/timeout.ts
import { Request, Response } from 'express';

export function requestTimeout(ms: number) {
  return (req: Request, res: Response, next: Function) => {
    req.setTimeout(ms, () => {
      res.status(408).json({ error: 'Request timeout' });
    });
    next();
  };
}
```

### 3. Input Validation

```typescript
// ✅ Always validate user input
function validateChatMessage(message: unknown): string {
  if (typeof message !== 'string') {
    throw new Error('Message must be string');
  }
  if (message.length === 0) {
    throw new Error('Message cannot be empty');
  }
  if (message.length > 10000) {
    throw new Error('Message too long (max 10000 chars)');
  }
  return message.trim();
}

// ✅ Sanitize before logging
function sanitizeMessage(msg: string): string {
  return msg
    .replace(/sk-\w+/g, 'sk-***')  // Hide API keys
    .replace(/shpat_\w+/g, 'shpat_***')  // Hide tokens
    .substring(0, 100);  // Truncate for logs
}
```

### 4. Error Handling

```typescript
// ✅ DO: Generic error messages to users
res.status(500).json({ error: 'Internal server error' });

// ❌ DON'T: Expose sensitive details
res.status(500).json({ 
  error: 'Database connection failed at 192.168.1.1:5432',
  stack: 'Error: ECONNREFUSED...'
});

// ✅ DO: Log detailed errors internally
logger.error('Database error', {
  error: err.message,
  stack: err.stack,
  userId: req.user?.id,
  timestamp: new Date().toISOString(),
});
```

---

## 🐳 Docker Security

### 1. Non-Root User

```dockerfile
# Dockerfile should use non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

USER nodejs
```

**Verification**:
```bash
docker run ai-chatbot:latest id
# uid=1001(nodejs) gid=1001(nodejs) groups=1001(nodejs)
```

### 2. Read-Only Filesystem

```dockerfile
# Make most of filesystem read-only
RUN chmod -R 555 /app/node_modules

# Only /tmp and /app/logs are writable
```

### 3. Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"
```

### 4. No Secrets in Image

```dockerfile
# ❌ DON'T: Build secrets into image
ARG API_KEY
RUN echo "API_KEY=$API_KEY" >> .env

# ✅ DO: Pass at runtime
docker run -e OPENAI_API_KEY=sk-... ai-chatbot:latest
```

### 5. Image Scanning

```bash
# Scan for vulnerabilities
docker scan ai-chatbot:latest

# Use slim base image to reduce attack surface
FROM node:18-alpine  # 150MB
# vs
FROM node:18         # 900MB+
```

---

## 🌐 Network Security

### 1. HTTPS Only

```bash
# In .env.production
NODE_ENV=production

# Vercel automatically handles HTTPS
# Docker: use reverse proxy with SSL
```

**Nginx Reverse Proxy**:
```nginx
server {
    listen 443 ssl;
    server_name api.example.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

### 2. CORS Policy

```typescript
// Only allow trusted origins
const cors = require('cors');

app.use(cors({
  origin: [
    'https://your-domain.com',
    'https://app.your-domain.com',
  ],
  credentials: true,
  methods: ['POST', 'GET'],
}));
```

### 3. Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet());  // Sets multiple security headers

// Includes:
// X-Content-Type-Options: nosniff
// X-Frame-Options: DENY
// X-XSS-Protection: 1; mode=block
// Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 📋 Deployment Checklist

### Before Production

- [ ] All secrets in environment variables (not in code)
- [ ] API keys differ from development
- [ ] Rate limiting enabled
- [ ] Request timeouts configured
- [ ] Health checks working
- [ ] Logging configured (but not logging secrets)
- [ ] Error messages are generic (no stack traces to users)
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Docker image scanned for vulnerabilities
- [ ] Non-root user in Docker container
- [ ] Environment variables validated at startup

### Pre-Merge Checklist

```bash
# 1. Check for secrets in code
grep -r "sk-\|shpat_" src/ --include="*.ts" --exclude-dir=node_modules
# Should return: (nothing)

# 2. Verify .env files not committed
git ls-files | grep "^\.env"
# Should return: (nothing - only .env.example)

# 3. Run linter
npm run lint

# 4. Run tests
npm test

# 5. Test locally
npm run build
npm start
# Verify at http://localhost:3000
```

### Post-Deployment

- [ ] Monitor error logs for issues
- [ ] Check rate limiting is working (verify headers)
- [ ] Verify health checks passing
- [ ] Test with real API calls
- [ ] Monitor for unusual activity
- [ ] Set up alerts for errors

---

## 🔍 Monitoring & Auditing

### 1. Logging Configuration

```bash
# In .env.production
LOG_LEVEL=info

# Logs captured in:
# - Console (stdout)
# - File: /var/log/ai-chatbot/app.log
# - Sentry: https://sentry.io (if configured)
```

**What to log**:
```typescript
// ✅ DO: Log important events
logger.info('Chat message received', { userId, messageLength });
logger.info('API call to OpenAI', { model, tokens });

// ❌ DON'T: Log sensitive data
logger.debug('Full message content', message);  // Might contain PII
logger.debug('API response', response);  // Might contain secrets
```

### 2. Audit Trail

```typescript
// Track important actions
interface AuditLog {
  timestamp: Date;
  userId: string;
  action: string;  // 'api_call', 'auth_success', 'rate_limit_exceeded'
  resource: string;  // 'openai', 'shopify'
  status: 'success' | 'failure';
  details?: Record<string, unknown>;
}

async function logAudit(log: AuditLog): Promise<void> {
  // Save to database or logging service
  await db.auditLogs.create(log);
}
```

### 3. Error Alerts

Set up Sentry or similar:

```bash
# In .env.production
SENTRY_DSN=https://xxxxx@o12345.ingest.sentry.io/67890

# Errors automatically reported to Sentry dashboard
```

---

## 🚨 Incident Response

### Potential Security Issues

**Issue**: API Key Compromised
- **Detection**: Unusual API activity, multiple errors, high costs
- **Response**: 
  1. Immediately disable key in provider dashboard
  2. Generate new key
  3. Deploy new key to production (5-min outage)
  4. Review logs for unauthorized access
  5. Post-incident: rotate all related keys

**Issue**: Configuration Error Exposes Secrets
- **Detection**: Logs show secrets, error messages include tokens
- **Response**:
  1. Remove secrets from logs immediately
  2. Fix configuration
  3. Rotate all exposed keys
  4. Audit who accessed the logs

**Issue**: DDoS Attack via Rate Limiting
- **Detection**: Service slow, rate limits constantly exceeded
- **Response**:
  1. Increase rate limit temporarily
  2. Enable IP-based blocking for obvious attackers
  3. Scale infrastructure
  4. Contact hosting provider

---

## 📚 Related Documentation

- **Vercel Deployment**: [docs/VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md)
- **Docker Setup**: [docs/DOCKER_SETUP_GUIDE.md](DOCKER_SETUP_GUIDE.md)
- **Environment Configuration**: [docs/ENVIRONMENT_CONFIGURATION.md](ENVIRONMENT_CONFIGURATION.md)
- **Branching Strategy**: [.github/BRANCHING_STRATEGY.md](../.github/BRANCHING_STRATEGY.md)

---

## 🔗 External Resources

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **NPM Security**: https://docs.npmjs.com/policies/security
- **Node.js Security**: https://nodejs.org/en/docs/guides/security/

---

**Last Updated**: November 5, 2025  
**Status**: Production-ready ✅  
**Review Date**: November 5, 2026 (annual review)
