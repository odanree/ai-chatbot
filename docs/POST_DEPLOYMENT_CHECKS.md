# Post-Deployment Verification Checklist

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Purpose**: Verify successful production deployment  
**Timing**: Run immediately after deployment + every hour for 4 hours  

---

## ✅ Immediate Post-Deployment (0-5 minutes)

### Health Endpoint Check

```bash
# Test health endpoint
curl -v https://ai-chatbot.vercel.app/health

# Expected Response (200 OK):
{
  "status": "healthy",
  "version": "0.4.0",
  "environment": "production",
  "timestamp": "2025-11-05T10:00:00Z",
  "services": {
    "api": "healthy",
    "database": "healthy",
    "cache": "healthy"
  }
}
```

**Validation**:
- ✅ Status code 200
- ✅ Response time < 100ms
- ✅ All services healthy
- ✅ Version matches deployment

### API Endpoint Checks

```bash
# Test chat endpoint
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?"}' \
  -w "\nTime: %{time_total}s\n"

# Expected Response (200 OK):
{
  "response": "I'm doing well, thank you for asking! How can I help you today?",
  "model": "gpt-4",
  "tokensUsed": 45
}

# Test webhook endpoint
curl -X POST https://ai-chatbot.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 200 or appropriate status
```

**Validation**:
- ✅ Chat endpoint responds
- ✅ Response time < 500ms
- ✅ Proper JSON returned
- ✅ Token usage reported

### Error Rate Check

```bash
# Check error rate for last 5 minutes
npm run monitor:errors --since=5m

# Expected Output:
# Error Rate: 0.02% (target: < 0.1%)
# Total Requests: 5,000
# Failed Requests: 1
# Critical Errors: 0
```

**Validation**:
- ✅ Error rate < 0.1%
- ✅ No critical errors
- ✅ Failed requests < 1%
- ✅ Error trend stable

### Performance Check

```bash
# Test response time
npm run test:performance --url=https://ai-chatbot.vercel.app

# Expected Output:
# p50: 50ms
# p95: 200ms
# p99: 500ms
# Max: 1200ms
```

**Validation**:
- ✅ p95 < 500ms (target)
- ✅ p99 < 1000ms
- ✅ No timeouts
- ✅ Consistent performance

---

## 🧪 Smoke Test Suite (5-10 minutes)

### Basic Functionality Tests

```bash
# 1. Test API server startup
npm run test:smoke -- --group api

# 2. Test database connectivity
npm run test:smoke -- --group database

# 3. Test external service integration
npm run test:smoke -- --group integrations

# 4. Test authentication/security
npm run test:smoke -- --group security

# 5. Test critical user flows
npm run test:smoke -- --group flows
```

**Expected Results**: All tests passing (✅)

### Specific Feature Tests

```bash
# Chat functionality
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -d '{"message":"Test message","sessionId":"test-123"}'

# Shopify product search
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -d '{"message":"Show me your blue t-shirts"}'

# Order status check
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -d '{"message":"Check my order #12345"}'

# Price inquiry
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -d '{"message":"How much is the t-shirt?"}'
```

**Success Criteria**:
- ✅ Chat responds appropriately
- ✅ Product search returns results
- ✅ Order lookup works
- ✅ Pricing information accurate

---

## 📊 Performance Validation (10-15 minutes)

### Load Test

```bash
# Run light load test (100 requests)
npm run test:load --concurrent=10 --requests=100 \
  --url=https://ai-chatbot.vercel.app/api/chat

# Expected Results:
# Total: 100 requests
# Success Rate: 99%+
# Avg Time: < 300ms
# p95 Time: < 500ms
# Max Time: < 1000ms
```

**Pass Criteria**:
- ✅ Success rate > 99%
- ✅ p95 < 500ms
- ✅ No timeout errors
- ✅ Memory stable

### Database Performance

```bash
# Test database query performance
npm run test:db-performance

# Expected Results:
# Query Time P95: < 100ms
# Connection Pool: OK
# Idle Connections: < 5
# Active Connections: < 20
```

**Validation**:
- ✅ Query times acceptable
- ✅ Connection pool healthy
- ✅ No connection leaks
- ✅ Memory usage stable

### API Response Time Distribution

```bash
# Analyze response time distribution
npm run analyze:response-times

# Expected Output:
# 50% of requests: < 50ms
# 90% of requests: < 200ms
# 95% of requests: < 300ms
# 99% of requests: < 500ms
```

**Validation**:
- ✅ p99 < 500ms (target)
- ✅ Median < 100ms
- ✅ No excessive variance
- ✅ Consistent performance

---

## 🔒 Security Verification (5-10 minutes)

### Security Headers Check

```bash
# Verify security headers are set
curl -I https://ai-chatbot.vercel.app/ | grep -E "^X-|^Content-Security|^Strict"

# Expected Headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# Content-Security-Policy: default-src 'self'
# Strict-Transport-Security: max-age=31536000
# X-XSS-Protection: 1; mode=block
```

**Validation**:
- ✅ Security headers present
- ✅ CSP policy defined
- ✅ HSTS enabled
- ✅ No sensitive data in headers

### SSL/TLS Certificate Check

```bash
# Verify SSL certificate
openssl s_client -connect ai-chatbot.vercel.app:443 \
  -servername ai-chatbot.vercel.app

# Or use
npm run test:ssl --domain=ai-chatbot.vercel.app

# Expected Results:
# Certificate Valid: YES
# Expiration: > 30 days
# Protocol: TLSv1.3
# Cipher: Strong
```

**Validation**:
- ✅ Valid SSL certificate
- ✅ Not expiring soon
- ✅ Strong cipher suite
- ✅ HTTPS enforced

### Rate Limiting Check

```bash
# Test rate limiting is working
for i in {1..150}; do
  curl -s https://ai-chatbot.vercel.app/api/chat \
    -H "X-Forwarded-For: 192.168.1.100" \
    -d '{"message":"test"}' > /dev/null
  echo "Request $i"
done

# Expected: Request 100+ returns 429 (Too Many Requests)
```

**Validation**:
- ✅ Rate limit enforced
- ✅ Returns 429 status
- ✅ Reset headers present
- ✅ No bypass possible

---

## 📈 Monitoring Dashboards (Ongoing)

### Error Tracking

```bash
# Monitor error rate
npm run monitor:errors --follow

# Expected: 
# Error Rate: < 0.1%
# No critical errors
# Trending: Stable or down
```

### Performance Monitoring

```bash
# Monitor performance metrics
npm run monitor:performance --follow

# Expected:
# p95: < 500ms
# p99: < 1000ms
# Uptime: > 99%
```

### Resource Utilization

```bash
# Check Vercel function metrics
vercel --prod --metrics

# Expected:
# CPU: < 50%
# Memory: < 70%
# Duration: < 5s
```

---

## 👥 User Acceptance Testing (UAT)

### Test Case 1: Simple Query

```
User: "Hello, can you help me?"
Expected: Bot responds with greeting
Status: ✅ Pass / ❌ Fail
```

### Test Case 2: Product Search

```
User: "Show me blue t-shirts"
Expected: Bot searches products and lists options
Status: ✅ Pass / ❌ Fail
```

### Test Case 3: Order Inquiry

```
User: "Check my order status"
Expected: Bot asks for order number and provides status
Status: ✅ Pass / ❌ Fail
```

### Test Case 4: Pricing Question

```
User: "How much do your products cost?"
Expected: Bot provides pricing information
Status: ✅ Pass / ❌ Fail
```

### Test Case 5: Error Recovery

```
User: "Invalid request with special characters: %%^&^"
Expected: Bot handles gracefully without crashing
Status: ✅ Pass / ❌ Fail
```

---

## 📋 Deployment Sign-Off Checklist

**Immediate (0-5 min)**:
- [ ] API responding (200 status)
- [ ] Health endpoint healthy
- [ ] No critical errors
- [ ] Error rate < 0.1%
- [ ] Response time good

**Smoke Tests (5-10 min)**:
- [ ] All smoke tests passing
- [ ] Chat functionality working
- [ ] Integration tests passing
- [ ] Database responsive
- [ ] External services connected

**Performance (10-15 min)**:
- [ ] Load test successful
- [ ] p95 < 500ms
- [ ] Database performance good
- [ ] Memory usage stable
- [ ] CPU usage acceptable

**Security (5-10 min)**:
- [ ] Security headers set
- [ ] SSL certificate valid
- [ ] Rate limiting working
- [ ] No exposed secrets
- [ ] Logging sanitized

**User Tests (5 min)**:
- [ ] Basic queries work
- [ ] Product search works
- [ ] Error handling works
- [ ] Performance acceptable
- [ ] User feedback positive

**Final**:
- [ ] All checks passing
- [ ] Team notified
- [ ] Monitoring active
- [ ] Rollback ready
- [ ] ✅ DEPLOYMENT SUCCESSFUL

---

## 🔄 Hourly Checks (First 4 Hours)

### Hour 1 (00:00 - 01:00)

**Checks**:
- Error rate < 0.1%
- p95 response time < 500ms
- Memory usage stable
- Database connections normal
- User sessions increasing

**Action if Issue**: Escalate immediately

### Hour 2-4 (01:00 - 04:00)

**Checks** (every 30 min):
- Error rate stable
- Performance consistent
- No memory leaks
- Database healthy
- User engagement normal

**Action if Issue**: Assess and potentially rollback

---

## 📞 Support Contacts

**Issues During Verification**:
1. Check error logs: `vercel --prod --logs`
2. Review deployment guide: `PRODUCTION_DEPLOYMENT.md`
3. Contact on-call engineer
4. If critical: Initiate rollback

---

## ✅ Sign-Off

**Verified By**: [Engineer Name]  
**Date**: [Date]  
**Time**: [Time]  
**Status**: ✅ Deployment Successful  

**Next Steps**:
- Continue hourly monitoring
- Prepare post-mortem if issues
- Update team Slack
- Archive deployment logs

---

Created: November 5, 2025  
Last Updated: November 5, 2025  
Status: Ready for Production Deployment
