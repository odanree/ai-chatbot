# Production Runbook: On-Call Guide & Emergency Procedures

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Purpose**: Emergency procedures and troubleshooting for production incidents  
**Audience**: On-Call Engineers, DevOps, Support Team  

---

## 🚨 Incident Response Overview

### Severity Levels

| Level | Impact | Response | Time |
|-------|--------|----------|------|
| **Critical** | System Down, Data Loss, Security Breach | Immediate | < 5 min |
| **High** | Major Feature Down, Performance Degraded | Urgent | < 15 min |
| **Medium** | Minor Feature Down, Partial Degradation | Standard | < 1 hour |
| **Low** | Single User Issue, Cosmetic Problem | Normal | < 4 hours |

### Response Flow

```
Alert → Triage → Assess → Resolve → Verify → Communicate → Document
  ↓         ↓       ↓       ↓        ↓         ↓            ↓
 1 min   2 min   3 min   5 min    5 min    2 min        10 min
```

---

## 🎯 Quick Decision Tree

```
Are users unable to access the site?
├─ YES → Service Down (See Section 2)
│        - Check Vercel status
│        - Check health endpoint
│        - Rollback if needed
└─ NO → Proceed to next question

Is performance very slow (p95 > 2s)?
├─ YES → Performance Degradation (See Section 4)
│        - Check error rate
│        - Check database
│        - Scale if needed
└─ NO → Proceed to next question

Are error rates elevated (> 1%)?
├─ YES → High Error Rate (See Section 3)
│        - Identify error pattern
│        - Check logs
│        - Rollback if new issue
└─ NO → Proceed to next question

Are users reporting wrong data/results?
├─ YES → Data Integrity Issue (See Section 5)
│        - Verify database
│        - Check recent changes
│        - Restore from backup if needed
└─ NO → Check monitoring dashboard for specific alerts
```

---

## 1️⃣ SERVICE DOWN (Critical)

### Immediate Assessment (1 minute)

```bash
# Check service status
curl -v https://ai-chatbot.vercel.app/health
# Expected: 200 OK

# Check Vercel status
vercel --prod --status

# Check error rate
curl https://api.vercel.com/v1/edge-functions/metrics \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

**IF service is down**:

### Step 1: Verify it's Actually Down (1 minute)

```bash
# Check from multiple sources
curl -w "%{http_code}\n" -o /dev/null https://ai-chatbot.vercel.app
curl -w "%{http_code}\n" -o /dev/null https://ai-chatbot.vercel.app/health
curl -w "%{http_code}\n" -o /dev/null https://ai-chatbot.vercel.app/api/chat

# Expected: All return 200
# If NOT: Service is definitely down
```

### Step 2: Check Deployment Status (1 minute)

```bash
# Get latest deployment info
vercel --prod --list --limit=5

# Check deployment in progress
vercel --prod --list | grep "BUILDING\|FAILED"

# Get deployment logs if recent
vercel --prod --logs --since=10m
```

**Possible Causes**:
- ❌ Deployment failed (auto-rollback)
- ❌ Database connection issue
- ❌ API rate limit exceeded
- ❌ Environment variables missing/wrong
- ❌ Code exception at startup

### Step 3: Check Infrastructure (2 minutes)

```bash
# Check Vercel status page
# https://www.vercel-status.com/

# Check DNS resolution
nslookup ai-chatbot.vercel.app

# Check from different regions
for region in us-east us-west eu-west ap-south; do
  echo "Testing from $region..."
  # Use curl with specific resolver or test from that region
done
```

### Step 4: Immediate Recovery (2 minutes)

#### Option A: Automated Rollback (Fastest)

```bash
# Trigger automatic rollback to previous version
vercel rollback --prod

# Verify new deployment
sleep 10
curl https://ai-chatbot.vercel.app/health

# Expected: Deployment rolled back, service restored
```

**Timeline**: ~30 seconds to restore

#### Option B: Manual Restart (If Rollback Failed)

```bash
# Redeploy current commit to force restart
git log --oneline | head -1  # Get current commit
vercel --prod --target production

# Wait for deployment
sleep 30
curl https://ai-chatbot.vercel.app/health
```

**Timeline**: ~2 minutes to restore

#### Option C: Emergency Hotfix (If Rollback Fails)

```bash
# 1. Check what's broken
vercel --prod --logs --tail

# 2. Find the issue and create hotfix
git checkout -b hotfix/critical-service-down
# ... make minimal fix ...
git commit -m "fix: critical service down"
git push origin hotfix/critical-service-down

# 3. Create emergency PR
gh pr create --base main --head hotfix/critical-service-down \
  --title "URGENT: Fix critical service down"

# 4. Merge immediately (skip reviews if true emergency)
gh pr merge <PR_NUMBER> --merge

# 5. Wait for auto-deploy
```

**Timeline**: ~5-10 minutes

### Step 5: Verify Recovery (1 minute)

```bash
# Check health endpoint
curl https://ai-chatbot.vercel.app/health

# Check API response
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -d '{"message":"test"}'

# Check error rate
npm run monitor:errors --since=1m

# Expected:
# ✅ 200 status
# ✅ Response received
# ✅ Error rate < 0.1%
```

### Step 6: Communicate (1 minute)

```bash
# Notify team on Slack
# "🔴 CRITICAL: Service down at [TIME]
#  ✅ RESOLVED at [TIME] via [METHOD]"

# Create incident report
# See Section 7: Post-Incident Procedures
```

---

## 2️⃣ HIGH ERROR RATE (High Priority)

### Assessment (2 minutes)

```bash
# Check error rate
npm run monitor:errors

# Expected output:
# Error Rate: 2.5% (ALERT: Target is < 0.1%)
# Total Requests: 1000
# Failed: 25
# Type: [List error types]
```

**If error rate > 1%**: Escalate immediately

### Step 1: Identify Error Pattern (2 minutes)

```bash
# Get error details
vercel --prod --logs | grep -i "error\|exception" | head -20

# Get error rate by endpoint
npm run analyze:errors --by=endpoint

# Expected:
# /api/chat: 2.0%
# /api/webhook: 0.1%
# /health: 0%
```

### Step 2: Categorize Error (2 minutes)

**Type A: API Call Errors**
```bash
# OpenAI error?
vercel --prod --logs | grep -i "openai"

# Shopify error?
vercel --prod --logs | grep -i "shopify"

# Response:
# - Retry logic already active
# - Check API status pages
# - Check rate limits
```

**Type B: Database Errors**
```bash
# Connection error?
vercel --prod --logs | grep -i "connection\|pool"

# Query error?
vercel --prod --logs | grep -i "query\|sql"

# Response:
# - Check database status
# - Restart connection pool
# - Scale database if needed
```

**Type C: Code/Logic Errors**
```bash
# Syntax error?
vercel --prod --logs | grep -i "SyntaxError\|TypeError"

# Unhandled rejection?
vercel --prod --logs | grep -i "unhandled\|promise"

# Response:
# - Rollback if recent deploy
# - Fix code and redeploy
# - Check tests locally
```

### Step 3: Resolution Path (Based on Type)

#### If External API Error
```bash
# Don't need to rollback; external issue
# Check API status pages
curl https://status.openai.com  # OpenAI status
# Shopify admin dashboard

# For OpenAI errors, retry logic active
# For Shopify errors, check API token validity

# If error persists > 5 min:
# 1. Add circuit breaker
# 2. Return cached response
# 3. Notify users gracefully
```

#### If Database Error
```bash
# Check database status
npm run check:database-health

# Expected output:
# Connection Pool: OK
# Active Connections: 8
# Idle Connections: 2
# Latency P95: 45ms

# If connection pool full:
npm run scale:database --connections=50

# If database down:
# 1. Check Vercel PostgreSQL status
# 2. Verify credentials in .env
# 3. Initiate recovery from backup
```

#### If Code Error
```bash
# Check what changed recently
git log --oneline -10

# If recent deploy caused issue:
# ROLLBACK (See Section 1, Step 4)
vercel rollback --prod

# If older deploy:
# 1. Identify root cause
# 2. Create fix
# 3. Test locally
# 4. Deploy fix
```

### Step 4: Verify Fix (2 minutes)

```bash
# Monitor error rate
npm run monitor:errors --follow --duration=5m

# Expected trend:
# t=0min: 2.5% (high)
# t=1min: 1.8% (improving)
# t=3min: 0.3% (recovering)
# t=5min: 0.05% (normal)

# If not improving: Escalate to tech lead
```

---

## 3️⃣ PERFORMANCE DEGRADATION (High Priority)

### Assessment (1 minute)

```bash
# Check response time
npm run analyze:response-times

# Expected:
# p50: 150ms (SLOW! target: 50ms)
# p95: 2000ms (VERY SLOW! target: 500ms)
# p99: 5000ms (CRITICAL!)
```

**If p95 > 1s**: Start investigation

### Step 1: Identify Bottleneck (2 minutes)

```bash
# Check endpoint performance
npm run analyze:performance --by=endpoint

# Expected:
# /api/chat: 1500ms (SLOW)
# /api/webhook: 50ms
# /health: 10ms

# Check database query time
npm run analyze:db-performance

# Expected:
# Query Time P95: 500ms (SLOW! target: 100ms)
# Connection Pool Saturation: 95% (CRITICAL!)
```

### Step 2: Diagnosis

#### Slow API Calls
```bash
# Check OpenAI response time
npm run test:openai-latency

# Expected: < 1000ms
# If > 2000ms: OpenAI is slow (external issue)

# Check Shopify response time
npm run test:shopify-latency

# Expected: < 500ms
# If > 1000ms: Shopify is slow (external issue)
```

#### Slow Database
```bash
# Check database load
npm run monitor:database --follow

# Look for:
# High query time (> 500ms)
# Connection pool saturation (> 80%)
# Memory pressure

# If high load:
npm run scale:database --cpu=2 --memory=4GB

# Or reduce load:
npm run enable:response-cache --ttl=300
```

#### High CPU Usage
```bash
# Check CPU utilization
vercel --prod --metrics | grep cpu

# Expected: < 50%
# If > 80%: Potential issue

# Check for infinite loops
vercel --prod --logs | grep -i "infinite\|loop"

# If found: Rollback immediately
vercel rollback --prod
```

### Step 3: Resolution (Based on Bottleneck)

#### External API Slow
```bash
# Add caching
npm run enable:response-cache --ttl=300

# Reduce payload size
npm run optimize:api-requests

# Or accept slower performance until they recover
# Monitor https://status.openai.com
```

#### Database Slow
```bash
# Add indexes
npm run database:optimize-indexes

# Scale up
npm run scale:database --cpu=2

# Enable query caching
npm run enable:query-cache
```

#### Code Slow
```bash
# Profile code
npm run profile:performance

# Optimize hot spots
# Test locally
# Deploy fix

# Or rollback if recent change
vercel rollback --prod
```

### Step 4: Verify Recovery (2 minutes)

```bash
# Monitor response time
npm run monitor:performance --follow --duration=5m

# Expected trend:
# t=0min: 2000ms (slow)
# t=2min: 1000ms (improving)
# t=5min: 300ms (normal)
```

---

## 4️⃣ DATA INTEGRITY ISSUE (Critical)

### Immediate Action (1 minute)

**STOP ACCEPTING WRITES!**
```bash
# Disable chat endpoint (read-only mode)
npm run maintenance:enable --mode=read-only

# Notify users
# "We're experiencing a temporary issue. Read-only mode active."
```

### Step 1: Assess Damage (2 minutes)

```bash
# Compare production vs backup
npm run database:compare --target=production --source=backup-latest

# Get corruption details
npm run database:validate --fix=false  # Report only

# Expected output:
# Corrupted Records: 25
# Type: [Specific corruption]
# Time Range: [When it happened]
```

### Step 2: Containment (2 minutes)

```bash
# Identify root cause
git log --oneline | head -5
vercel --prod --logs | grep -i "database\|transaction\|error"

# If recent code change:
vercel rollback --prod

# If data corruption:
# 1. Stop writes
# 2. Notify stakeholders
# 3. Assess recovery options
```

### Step 3: Recovery (5-10 minutes)

#### Option A: Restore from Backup (Safest)

```bash
# Identify good backup
npm run database:list-backups

# Expected:
# backup-2025-11-05-09-00-00.sql (GOOD)
# backup-2025-11-05-09-30-00.sql (CORRUPTED at 09:35)

# Restore from good backup
npm run database:restore --backup=backup-2025-11-05-09-00-00.sql

# This will:
# - Stop write operations
# - Restore to clean state
# - Verify integrity
# - Re-enable operations
# - Take ~5-10 minutes

# Expected: All data valid
```

**Data Loss**: ~30 minutes of transactions (acceptable vs full loss)

#### Option B: Selective Data Fix (If Recent)

```bash
# Identify corrupt records
npm run database:find-corrupt --time-range=10m

# Fix them
npm run database:fix-corruption --records=identified

# Verify fix
npm run database:validate --fix=true

# Less data loss but riskier
```

### Step 4: Restart (2 minutes)

```bash
# Re-enable writes
npm run maintenance:disable

# Verify system stable
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -d '{"message":"test"}'

# Monitor for issues
npm run monitor:all --follow --duration=10m
```

### Step 5: Post-Incident

```bash
# 1. Create incident report
# 2. Schedule root cause analysis
# 3. Implement safeguards
# See Section 7: Post-Incident Procedures
```

---

## 5️⃣ COMMON ISSUES & SOLUTIONS

### Issue: API Quota Exceeded (OpenAI)

```bash
# Symptom: 429 Rate Limit errors

# Verify
curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{}'

# Response: 429 Too Many Requests

# Solutions:
# 1. Wait 1 minute for quota reset
# 2. Upgrade plan at https://platform.openai.com
# 3. Implement backoff:
npm run enable:request-backoff --delay=2s --max-retries=3

# 4. Reduce request volume:
npm run enable:response-cache --ttl=600

# 5. Switch to cheaper model:
# Change OPENAI_MODEL from gpt-4 to gpt-3.5-turbo
# In .env.production: OPENAI_MODEL=gpt-3.5-turbo
```

### Issue: Database Connection Pool Exhausted

```bash
# Symptom: "Too many connections" errors

# Verify
npm run check:database-health

# Output:
# Active Connections: 50 (MAX!)
# Idle Connections: 0
# Queue: 15 requests waiting

# Solutions:
# 1. Restart connection pool:
npm run database:restart-pool

# 2. Scale database:
npm run scale:database --connections=100

# 3. Reduce connection usage:
npm run enable:connection-pooling --min=5 --max=20

# 4. Kill idle connections:
npm run database:kill-idle --after=5m
```

### Issue: Memory Leak

```bash
# Symptom: Memory usage increasing, never freed

# Verify
vercel --prod --metrics | grep memory

# Output:
# Memory: 512MB (growing every minute!)

# Identify leak
npm run profile:memory --duration=5m

# Expected:
# Growing Arrays: [List]
# Unclosed Streams: [List]
# Cache Not Clearing: [Details]

# Solutions:
# 1. Find code creating memory
git diff main..HEAD src/

# 2. Add cleanup:
// Before:
const data = [];
data.push(item);  // Grows forever!

// After:
const data = [];
if (data.length > 10000) data = [];  // Clear periodically

# 3. Deploy fix
git commit -am "fix: memory leak in data cache"
git push origin feat/memory-leak-fix
gh pr create --base main

# 4. Merge and auto-deploy
```

### Issue: SSL Certificate Expiring Soon

```bash
# Symptom: SSL warning in logs or monitoring

# Check cert expiry
openssl s_client -connect ai-chatbot.vercel.app:443 \
  | grep "notAfter"

# If expiring within 30 days:
# 1. Contact Vercel support (auto-renewal usually active)
# 2. Verify auto-renewal is enabled:
vercel --prod --certs

# Expected: Certificate will auto-renew

# Manual renewal if needed:
vercel certs add ai-chatbot.vercel.app --renew
```

### Issue: Webhook Not Triggering

```bash
# Symptom: Events from Shopify not received

# Check webhook endpoint
curl -X POST https://ai-chatbot.vercel.app/api/webhook \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  -v

# Expected: 200 OK

# If not working:
# 1. Check environment variable:
echo $SHOPIFY_WEBHOOK_SECRET

# 2. Verify Shopify webhook config:
# - Go to Shopify Admin
# - Settings > Notifications > Webhooks
# - Check URL: https://ai-chatbot.vercel.app/api/webhook
# - Check topics: orders/create, orders/update

# 3. Check logs for signature verification errors:
vercel --prod --logs | grep webhook

# 4. If signature mismatch:
# Regenerate webhook secret in Shopify
# Update in .env.production
# Redeploy: vercel --prod
```

### Issue: Environment Variables Wrong

```bash
# Symptom: "undefined" errors or 401 Unauthorized

# Verify variables are set
vercel env ls --prod

# Expected:
# SHOPIFY_STORE_DOMAIN=odanree.myshopify.com
# OPENAI_API_KEY=sk-...
# etc.

# If missing:
# 1. Set via CLI:
vercel env add VARIABLE_NAME "value" --prod

# 2. Or via dashboard:
# https://vercel.com/dashboard → Settings → Environment Variables

# 3. Redeploy to pick up new variables:
vercel --prod

# 4. Verify deployment picked up new vars:
vercel --prod --logs | grep "OPENAI_API_KEY"
```

### Issue: TypeScript Compilation Error on Deploy

```bash
# Symptom: "Failed to compile" during deployment

# Check logs
vercel --prod --logs

# Identify error (e.g., "src/utils/chat.ts:45: Type 'any' is not assignable")

# Fix locally:
# 1. Install deps: npm install
# 2. Compile: npm run build
# 3. Fix errors shown
# 4. Commit: git commit -am "fix: TypeScript error"
# 5. Push: git push origin your-branch

# Then redeploy:
vercel --prod

# Or force rebuild:
vercel --prod --force
```

---

## 6️⃣ ESCALATION TREE

### Level 1: On-Call Engineer (You)

✅ **Can Handle**:
- Identify issue type
- Follow runbook
- Execute recovery steps
- Communicate status

❌ **Cannot Handle**:
- Complex infrastructure changes
- Database recovery
- Security incidents
- Persistent issues after 15 min

**Next Step**: Escalate to Level 2

### Level 2: Senior Engineer / Tech Lead

✅ **Can Handle**:
- Complex debugging
- Database issues
- Architecture decisions
- PR reviews for hotfixes

**Contact**: @tech-lead-on-call (Slack)

### Level 3: DevOps / Infrastructure

✅ **Can Handle**:
- Vercel configuration
- Database scaling
- Certificate issues
- Network problems

**Contact**: @devops-team (Slack)

### Level 4: CTO / Executive

✅ **Can Handle**:
- Major incident decisions
- Customer communications
- Post-incident reviews

**Contact**: @cto (Slack)

---

## 7️⃣ POST-INCIDENT PROCEDURES

### Immediate (During Incident)

```markdown
When incident occurs, open Slack thread and post:
- ⏰ Time detected
- 🔴 Severity (Critical/High/Medium/Low)
- 📝 Description of issue
- 🔧 Current action taken
- ⏱️ ETA to resolution

Update every 5 minutes while ongoing.
```

### During Recovery

```bash
# Create incident log file
cat > incident-2025-11-05-10-30.md << 'EOF'
# Incident: [Title]

**Time**: 2025-11-05 10:30 UTC  
**Duration**: 15 minutes  
**Severity**: Critical  
**Impact**: 500 users affected  

## Timeline
- 10:30 UTC - Error rate spike detected
- 10:32 UTC - Identified as OpenAI rate limit
- 10:35 UTC - Circuit breaker enabled
- 10:45 UTC - Resolved (quota reset)

## Root Cause
OpenAI API hit rate limit due to traffic spike.

## Resolution
Enabled circuit breaker to prevent cascading failures.

## Prevention
- Implement request batching
- Add proactive caching
- Increase OpenAI plan quota

## Assignee: [Your name]
EOF
```

### Post-Resolution (30 min after incident)

```bash
# 1. Announce resolution
# Slack: "✅ Incident resolved at [TIME]. We experienced [ISSUE] for [DURATION]. Details in #incident-log"

# 2. Enable monitoring for recurrence
npm run monitor:specific-issue --alert-threshold=2

# 3. Schedule root cause analysis
# Create Jira ticket: [COMPONENT] Fix: [Issue]
```

### Within 24 Hours

```bash
# 1. Write full root cause analysis
# Why did it happen?
# Why didn't it trigger alerts sooner?
# What's the permanent fix?

# 2. Create follow-up issues
# e.g., "Add rate limit monitoring"
# e.g., "Implement circuit breaker for OpenAI"

# 3. Update runbook
# Add your issue to Section 5 if not already there
# Add what you learned
```

### Incident Report Template

```markdown
# Post-Incident Review

**Incident**: [Title]  
**Date**: [Date]  
**Duration**: [Duration]  
**Severity**: [Level]  
**Participants**: [Names]  

## Executive Summary
[2-3 sentence summary of what happened and impact]

## Timeline
- HH:MM - [Event]
- HH:MM - [Event]
- HH:MM - [Resolution]

## Root Cause
[Why did this happen?]

## Impact
- Users Affected: [Number]
- Data Loss: [Yes/No]
- Revenue Impact: $[Amount]

## Immediate Actions Taken
- [Action 1]
- [Action 2]

## Long-Term Fixes
- [ ] [Fix 1] - [Owner] - [ETA]
- [ ] [Fix 2] - [Owner] - [ETA]

## Action Items
- [ ] [Item] - [Owner] - [Date]

## Lessons Learned
1. [Learning 1]
2. [Learning 2]

## Prevention for Next Time
- [Prevention 1]
- [Prevention 2]
```

---

## 📞 EMERGENCY CONTACTS

### Primary On-Call
- **Name**: [Your Name]
- **Phone**: [Number]
- **Slack**: @[username]
- **Hours**: 24/7 during week of duty

### Secondary On-Call
- **Name**: [Backup Name]
- **Phone**: [Number]
- **Slack**: @[username]

### Tech Lead
- **Name**: [Name]
- **Slack**: @tech-lead
- **Availability**: Mon-Fri 9-5 UTC

### DevOps
- **Name**: [Name]
- **Slack**: @devops
- **Availability**: Mon-Fri 9-5 UTC

### External Contacts
- **Vercel Support**: support@vercel.com
- **OpenAI Support**: support@openai.com
- **Shopify Support**: support@shopify.com

---

## ✅ On-Call Preparation Checklist

Before going on-call:

- [ ] Read this entire runbook
- [ ] Understand escalation tree
- [ ] Have emergency contacts saved
- [ ] Verify you have production access:
  - [ ] Vercel dashboard access
  - [ ] GitHub access
  - [ ] Database access
  - [ ] Slack notifications enabled
- [ ] Install monitoring tools:
  ```bash
  npm install -g vercel @vercel/cli
  gh --version  # GitHub CLI
  ```
- [ ] Test access to all systems
- [ ] Join on-call Slack channel
- [ ] Set phone alerts for critical incidents

---

## 📊 Metrics to Monitor During On-Call

**Every Hour**:
- Error rate (target: < 0.1%)
- Response time p95 (target: < 500ms)
- Uptime (target: > 99.9%)

**Every 30 Min During Known Issues**:
- Specific error type trending
- Database connections
- Memory usage

**Tools**:
```bash
# Dashboard
npm run dashboard

# Continuous monitoring
npm run monitor:all --follow

# Alerts to Slack (auto-configured)
```

---

Created: November 5, 2025  
Last Updated: November 5, 2025  
Status: Ready for Production  
Next: Team Training & Full Deployment
