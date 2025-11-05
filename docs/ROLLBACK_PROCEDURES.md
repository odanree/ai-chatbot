# Rollback Procedures - AI Chatbot

**Document Version**: 1.0  
**Last Updated**: November 5, 2025  
**Purpose**: Emergency procedures to revert failed deployments  
**Critical**: YES - Use only in emergencies  

---

## 🚨 Rollback Decision Framework

### When to Rollback

**IMMEDIATE ROLLBACK (No discussion)**:
- Critical service outage (API completely down)
- Data corruption detected
- Security breach identified
- Database connection lost
- User sessions failing
- Error rate > 5% for > 5 minutes

**ASSESS & DECIDE (30-60 seconds)**:
- Error rate 2-5% for > 2 minutes
- Performance degradation (p95 > 2s)
- Specific feature broken
- High error spike
- Memory/CPU spike

**MONITOR & DECIDE (2-5 minutes)**:
- Error rate 0.5-2%
- Minor feature issues
- Isolated errors
- Performance variation
- Low impact issues

**FIX FORWARD** (No rollback):
- Error rate < 0.5%
- Non-critical issues
- Single user issues
- UI/UX issues
- Minor feature bugs

### Rollback Decision Tree

```
Critical Issue Detected?
│
├─ YES, Critical (P1) → IMMEDIATE ROLLBACK
│   ├─ Service down
│   ├─ Data corruption
│   ├─ Security breach
│   └─ Database unreachable
│
├─ YES, High Impact (P2) → Assess & Decide
│   ├─ Error rate 2-5%
│   ├─ Performance degraded
│   ├─ Feature broken
│   └─ Decision: Rollback if unfixable quickly
│
├─ YES, Medium Impact (P3) → Monitor & Decide
│   ├─ Error rate 0.5-2%
│   ├─ Specific feature issue
│   ├─ Isolated errors
│   └─ Decision: Rollback if not stabilizing
│
└─ LOW IMPACT (P4) → Fix Forward
    ├─ Error rate < 0.5%
    ├─ Non-critical
    ├─ Single user
    └─ Action: Deploy fix
```

---

## 🔄 Automated Rollback (Recommended)

### Option 1: Vercel Automatic Rollback

Vercel provides automatic rollback on deployment failure.

**Configuration**: Already enabled in `vercel.json`

```json
{
  "rollback": {
    "enabled": true,
    "onBuildError": true,
    "onDeployError": true
  }
}
```

**How It Works**:
1. Deployment fails → Error detected
2. Previous production version activated
3. Team notified automatically
4. Logs available for investigation
5. Time to rollback: < 30 seconds

**Verification**:
```bash
# Check rollback status
vercel --prod --logs

# Verify previous version active
curl https://ai-chatbot.vercel.app/health

# Check deployment history
vercel list --production
```

### Option 2: GitHub Actions Rollback Job

We have a dedicated rollback job in CI/CD pipeline.

**Trigger Rollback**:
```bash
# Option A: Manually trigger GitHub Actions
gh workflow run rollback.yml

# Option B: Via GitHub CLI
gh run cancel <run-id>
gh workflow run rollback.yml --ref main

# Option C: Emergency script
npm run deploy:rollback
```

**Rollback Job Does**:
1. Identifies last successful deployment
2. Checks out that commit
3. Redeploys to Vercel
4. Runs health checks
5. Notifies team on Slack

**Expected Duration**: 2-3 minutes

---

## 🛠️ Manual Rollback Procedures

Use manual procedures if automatic rollback fails.

### Manual Rollback - Step by Step

**Step 1: Assess the Situation (1 minute)**

```bash
# 1. Get current deployment info
vercel --prod --inspect

# 2. Check recent deployments
vercel list --limit 10

# 3. Identify last working deployment
# Look for successful deployment before current one

# 4. Check deployment logs
vercel logs <deployment-id>

# 5. Get current git status
git log --oneline -5
```

**Step 2: Identify Rollback Target (1-2 minutes)**

```bash
# 1. Find last successful commit
git log --oneline | grep -E "✅|PROD|deployment"

# 2. Get commit hash
PREVIOUS_COMMIT=$(git log --format=%H -n 2 | tail -n 1)
echo "Rolling back to: $PREVIOUS_COMMIT"

# 3. Verify commit is safe
git show $PREVIOUS_COMMIT

# 4. Check tests passed for that commit
gh run list --filter branch:main | head -3
```

**Step 3: Execute Rollback (2-3 minutes)**

```bash
# 1. Checkout previous commit
git checkout $PREVIOUS_COMMIT

# 2. Create rollback tag
git tag -a rollback-$(date +%s) -m "Rollback from failed deployment"

# 3. Force push to trigger deployment
git push origin $PREVIOUS_COMMIT:main --force

# 4. Monitor deployment
vercel --prod --logs --follow

# 5. Wait for deployment to complete
# Expected: 1-3 minutes

# 6. Verify health
curl -v https://ai-chatbot.vercel.app/health
```

**Step 4: Verify Rollback Success (3-5 minutes)**

```bash
# 1. Check API health
curl https://ai-chatbot.vercel.app/health | jq .

# 2. Test core functionality
curl -X POST https://ai-chatbot.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'

# 3. Check error rate
npm run check:errors --since=5m

# 4. Verify database connectivity
npm run db:health-check

# 5. Monitor for 5 minutes
vercel --prod --logs | head -50
```

**Step 5: Post-Rollback Actions (5-10 minutes)**

```bash
# 1. Notify team
echo "✅ Rollback complete. Service restored."
# Send to Slack: #deployments channel

# 2. Create incident report
npm run incident:report --reason="Failed deployment"

# 3. Preserve logs for analysis
aws s3 cp error-logs.json s3://ai-chatbot-backups/

# 4. Schedule post-mortem
# Team meeting in 1 hour to discuss failure

# 5. Reset dev branch
git checkout dev
git pull origin main
git push origin dev --force-with-lease
```

---

## 📊 Rollback Success Criteria

### Immediate Success (0-5 minutes)
- [x] Deployment rolled back
- [x] API responding to requests
- [x] Health check passing
- [x] Error rate returning to normal
- [x] Team notified

### Short-Term Success (5-30 minutes)
- [ ] Error rate stable < 0.1%
- [ ] Performance metrics normal
- [ ] Database responsive
- [ ] User sessions stable
- [ ] No new errors appearing

### Long-Term Success (30+ minutes)
- [ ] User feedback positive
- [ ] No regression detected
- [ ] System stable
- [ ] Monitoring shows green
- [ ] Incident resolved

---

## 🔍 Data Recovery Procedures

If rollback required due to data corruption:

### Database Rollback

```bash
# 1. Stop all services
npm run services:stop

# 2. Identify corrupted data
npm run db:audit

# 3. Create current backup (for analysis)
npm run db:snapshot --output=corrupted-backup.sql

# 4. Restore from clean backup
npm run db:restore --from=db-snapshot-<timestamp>.sql

# 5. Verify data integrity
npm run db:verify

# 6. Restart services
npm run services:start

# 7. Run smoke tests
npm test -- --grep="smoke"
```

**Expected Results**:
- ✅ Data restored to point before corruption
- ✅ All tests passing
- ✅ Service operational
- ✅ Users can access data

---

## 🚨 Emergency Contacts

**On-Call Team**:
- Primary: [Team Lead Phone]
- Secondary: [DevOps Phone]
- Manager: [Manager Phone]

**Escalation Procedure**:
1. Attempt automatic rollback (30 sec)
2. Call primary on-call (1 min)
3. If no response, call secondary (1 min)
4. If critical, call manager (1 min)

---

## ✅ Rollback Verification Checklist

- [ ] Rollback completed successfully
- [ ] Health checks passing
- [ ] Error rate acceptable
- [ ] Performance normal
- [ ] User sessions stable
- [ ] Database responsive
- [ ] Team notified
- [ ] Incident report created
- [ ] Backup verified safe
- [ ] Post-mortem scheduled

---

## 📝 Rollback Log Template

Keep a record of every rollback:

```
Rollback #1
Date: 2025-11-05
Time: 15:30 UTC
Duration: 3 minutes
Previous Deployment: abc123def456
Rollback Target: def456abc123
Reason: High error rate (5%)
Status: ✅ Successful
Actions Taken: Automatic Vercel rollback
Post-Mortem: Nov 5 16:00 UTC
Owner: [Team Lead Name]
```

---

## 🎓 Team Training Scenarios

### Scenario 1: Service Outage
**Situation**: API completely down  
**Action**: Immediate automatic rollback  
**Expected time**: < 30 seconds  
**Notification**: Auto-sent to Slack  

### Scenario 2: High Error Rate
**Situation**: 5% of requests returning 500 errors  
**Action**: Assess for 30 seconds, then rollback  
**Expected time**: 3-5 minutes  
**Decision**: Automatic if error rate stays high

### Scenario 3: Data Corruption
**Situation**: User data showing inconsistencies  
**Action**: Stop services, restore from backup  
**Expected time**: 10-15 minutes  
**Verification**: Run data integrity checks

### Scenario 4: Performance Degradation
**Situation**: Response time p95 > 2 seconds  
**Action**: Monitor for 2 minutes, assess root cause  
**Decision**: Rollback if caused by new deployment  
**Expected time**: 5-10 minutes

---

## 📞 Support Resources

- **Rollback Guide**: This document
- **Deployment Guide**: `PRODUCTION_DEPLOYMENT.md`
- **Incident Response**: `INCIDENT_RESPONSE.md`
- **Team Procedures**: `TEAM_PROCEDURES.md`
- **On-Call Runbook**: `PRODUCTION_RUNBOOK.md`

---

**Created**: November 5, 2025  
**Last Updated**: November 5, 2025  
**Status**: Ready for Production  
**Review Frequency**: Quarterly or after incident
