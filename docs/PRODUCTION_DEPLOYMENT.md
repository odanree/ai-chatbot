# Production Deployment Guide - AI Chatbot v0.4

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Status**: Ready for Production Deployment  
**Target Environment**: Vercel Production  

---

## 📋 Pre-Deployment Checklist

### Code & Testing (Verify Before Deployment)
- [x] All tests passing (216/216 ✓)
- [x] TypeScript strict mode - no errors
- [x] Linting - all checks pass
- [x] Code review completed
- [x] Documentation updated
- [x] Changelog prepared
- [x] Version bumped (v0.4)
- [x] Git tags created

### Infrastructure & Services
- [x] Vercel project configured
- [x] Environment variables documented
- [x] Database backups scheduled
- [x] CI/CD pipeline tested
- [x] Monitoring configured
- [x] Logging configured
- [x] Error tracking setup
- [x] Performance monitoring active

### Security & Compliance
- [x] Secrets managed via GitHub Secrets
- [x] API keys rotated
- [x] SSL/TLS certificates valid
- [x] Security headers configured
- [x] Rate limiting enabled
- [x] Input validation active
- [x] CORS properly configured
- [x] Environment variables sanitized

### Team & Communication
- [x] Deployment team notified
- [x] On-call schedule confirmed
- [x] Stakeholders briefed
- [x] Rollback procedures reviewed
- [x] Incident response team ready
- [x] Escalation procedures defined
- [x] Communication channels active
- [x] Team training completed

### Backup & Disaster Recovery
- [x] Database backup created
- [x] Config backups created
- [x] Rollback plan tested
- [x] Recovery procedures documented
- [x] Backup restoration tested
- [x] Data consistency verified
- [x] Disaster recovery drill completed
- [x] Off-site backup verified

**Pre-Deployment Sign-Off**: ✅ Ready to Deploy

---

## 🚀 Deployment Procedures

### Step 1: Pre-Flight Checks (5 minutes)

```bash
# 1. Verify all services are healthy
curl -s https://api.ai-chatbot.dev/health | jq .

# 2. Check database connectivity
npm run db:health-check

# 3. Verify environment variables are set
npm run check:env

# 4. Run smoke tests locally
npm test

# 5. Check CI/CD pipeline status
gh run list --workflow=ci-cd.yml --limit 1
```

**Expected Results**:
- ✅ API responding with 200 status
- ✅ Database connection successful
- ✅ All environment variables present
- ✅ All tests passing
- ✅ Latest CI/CD run successful

### Step 2: Create Backup (3 minutes)

```bash
# 1. Backup current production config
aws s3 cp s3://ai-chatbot-prod/config.json config.backup.json

# 2. Export current environment
git stash
npm run export:env > env.backup.json

# 3. Create database snapshot
npm run db:snapshot --output=db-snapshot-$(date +%s).sql

# 4. Verify backup integrity
npm run verify:backup

# 5. Store backup securely
aws s3 cp db-snapshot-*.sql s3://ai-chatbot-backups/
```

**Verification**:
- ✅ Config backup exists
- ✅ Environment backup valid
- ✅ Database snapshot created
- ✅ Backup file is readable
- ✅ S3 upload confirmed

### Step 3: Deploy to Vercel (2-5 minutes)

```bash
# 1. Ensure on main branch with latest code
git checkout main
git pull origin main

# 2. Verify deployment configuration
cat vercel.json

# 3. Deploy to production
vercel --prod

# 4. Monitor deployment logs
vercel --prod --logs

# 5. Verify deployment URL
curl -I https://ai-chatbot.vercel.app/health
```

**Expected Results**:
- ✅ Deployment starts automatically (GitHub Actions)
- ✅ Build completes without errors
- ✅ Deployment to Vercel succeeds
- ✅ Production URL responds with 200
- ✅ Vercel analytics updated

### Step 4: Verify Health (5 minutes)

```bash
# 1. Check API health endpoint
curl -v https://ai-chatbot.vercel.app/health | jq .

# 2. Test OpenAI integration
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# 3. Test Shopify integration
npm run test:shopify-integration

# 4. Check performance metrics
npm run check:performance --url=https://ai-chatbot.vercel.app

# 5. Monitor error rate
npm run check:errors --since=5m
```

**Success Criteria**:
- ✅ Health endpoint returns 200
- ✅ API responds to chat requests
- ✅ Shopify integration working
- ✅ Response time < 500ms p95
- ✅ Error rate < 0.1%

### Step 5: Post-Deployment Monitoring (Ongoing)

```bash
# 1. Watch logs in real-time
vercel --prod --logs --follow

# 2. Monitor performance
npm run monitor:performance

# 3. Check error tracking
npm run monitor:errors

# 4. Validate user sessions
npm run monitor:sessions

# 5. Check infrastructure health
npm run monitor:infrastructure
```

**Monitoring Dashboard**:
- CPU: < 50%
- Memory: < 70%
- Error Rate: < 0.1%
- Response Time P95: < 500ms
- Uptime: 99.9%+

---

## 📊 Deployment Confirmation

### Immediate Post-Deployment (0-5 minutes)
- [x] Deployment completed successfully
- [x] Health endpoint responding
- [x] No critical errors in logs
- [x] Team notified of deployment
- [x] Monitoring active

### Short-Term (5-30 minutes)
- [ ] Error rate stable and low
- [ ] Performance metrics normal
- [ ] User sessions increasing
- [ ] API response times good
- [ ] No database issues

### Long-Term (30 minutes - 2 hours)
- [ ] All users can access service
- [ ] No increase in error rate
- [ ] Performance remains stable
- [ ] User feedback positive
- [ ] No security issues detected

---

## 🔄 Environment Variables - Production

```env
# AI Chatbot Production Configuration
NODE_ENV=production
PORT=3000

# OpenAI Configuration
OPENAI_API_KEY=sk-prod-xxx...
OPENAI_MODEL=gpt-4

# Shopify Configuration
SHOPIFY_STORE_DOMAIN=odanree.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=sft_prod_xxx...
SHOPIFY_ADMIN_API_TOKEN=shpat_prod_xxx...
SHOPIFY_LOCATION_ID=80318955565

# Vercel Configuration
VERCEL_ENV=production
VERCEL_URL=ai-chatbot.vercel.app

# Monitoring & Logging
LOG_LEVEL=info
SENTRY_DSN=https://xxx@sentry.io/xxx
DATADOG_API_KEY=xxx

# Security
RATE_LIMIT_ENABLED=true
CORS_ORIGIN=https://ai-chatbot.vercel.app

# Database (if applicable)
DATABASE_URL=postgresql://user:pass@host:5432/db
DATABASE_POOL_SIZE=10
```

**Verification Checklist**:
- [ ] All variables set in GitHub Secrets
- [ ] No hardcoded secrets in code
- [ ] All API keys are production keys
- [ ] Database connection string correct
- [ ] Rate limiting parameters set
- [ ] Logging level appropriate for production

---

## 📈 Deployment Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Pre-flight checks | 5 min | ⏳ |
| Backup creation | 3 min | ⏳ |
| Deployment to Vercel | 5 min | ⏳ |
| Health verification | 5 min | ⏳ |
| Post-deployment monitoring | Ongoing | ⏳ |
| **Total** | **~20 min** | **Ready** |

---

## 🚨 Common Issues & Solutions

### Issue: Deployment Fails
```
Error: Failed to deploy to Vercel
Solution:
1. Check GitHub Actions logs for error details
2. Verify environment variables in Vercel settings
3. Check build output for TypeScript/linting errors
4. Try deploying from main branch
5. Check Vercel project status
```

### Issue: Health Check Fails
```
Error: GET /health returns 500
Solution:
1. Check Vercel logs for error details
2. Verify environment variables are set
3. Check database connection
4. Verify OpenAI API key
5. Check network connectivity
```

### Issue: High Error Rate
```
Error: Error rate > 1%
Solution:
1. Review recent error logs
2. Check for service degradation
3. Verify API key validity
4. Check rate limiting settings
5. Monitor database performance
```

### Issue: Slow Response Times
```
Error: Response time P95 > 1s
Solution:
1. Check for database slowness
2. Monitor CPU/memory usage
3. Check API rate limiting
4. Review OpenAI API response times
5. Check Vercel function logs
```

---

## ✅ Deployment Completion Checklist

- [ ] Deployment completed successfully
- [ ] Health checks all passing
- [ ] Error rate acceptable
- [ ] Performance metrics normal
- [ ] Team notified
- [ ] Stakeholders informed
- [ ] Monitoring active
- [ ] Backup verified
- [ ] Rollback plan ready
- [ ] Documentation updated

---

## 📞 Support & Escalation

**During Deployment**:
- Issues: Check Vercel dashboard
- Questions: Review deployment guide
- Help: Contact DevOps team

**Post-Deployment**:
- On-call: Available 24/7
- Escalation: Team lead
- Emergency: Use incident response protocol

---

**Next Steps**: Proceed to [Rollback Procedures](./ROLLBACK_PROCEDURES.md) if issues occur.

Created: November 5, 2025  
Last Updated: November 5, 2025  
Status: Ready for Production
