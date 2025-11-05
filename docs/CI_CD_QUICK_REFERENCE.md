# ⚡ CI/CD Quick Reference

> Fast lookup for CI/CD pipeline commands and troubleshooting.

---

## 🚀 Quick Start

### Run Pipeline Locally

```bash
# Run all checks locally (before pushing)
npm run build      # TypeScript build
npm run lint       # Code linting
npm test           # Run all tests
docker build -t ai-chatbot .  # Build Docker image
```

### View Pipeline Status

```bash
# Check GitHub Actions
gh run list

# Watch a specific run
gh run watch <RUN_ID>

# View workflow file
cat .github/workflows/ci-cd.yml
```

---

## 📋 Workflow Stages

| Stage | Duration | Triggers | Status |
|-------|----------|----------|--------|
| **Lint & Types** | ~30s | Push, PR | ✅ |
| **Tests** | ~45s | Push, PR | ✅ |
| **Docker** | ~150s | Push main only | ✅ |
| **Vercel Deploy** | ~60-90s | Push, PR | ✅ |
| **Health Check** | ~30s | Push main only | ✅ |
| **Notify** | ~5s | Always | ✅ |

---

## 🔧 Setup (One-Time)

### Add GitHub Secrets

```bash
# 1. Get Vercel token
vercel link

# 2. Go to GitHub → Settings → Secrets → Actions
# 3. Add these secrets:
VERCEL_TOKEN=<from Vercel account>
VERCEL_ORG_ID=<from .vercel/project.json>
VERCEL_PROJECT_ID=<from .vercel/project.json>
```

---

## ✅ Checklist: Before Merge

- [ ] Local build passes: `npm run build`
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] GitHub Actions pipeline all green ✅
- [ ] Vercel deployment successful
- [ ] Health check passes

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| **Tests fail** | `npm test` locally, fix, push |
| **Type errors** | `npm run build`, fix types, push |
| **Lint errors** | `npm run lint --fix`, review, push |
| **Vercel fails** | Check Vercel dashboard, redeploy |
| **Docker fails** | `docker build .` locally, debug |
| **Secrets missing** | Add to GitHub Settings → Secrets |

---

## 📊 View Results

### GitHub Actions Dashboard
```
https://github.com/odanree/ai-chatbot/actions
```

### Vercel Deployments
```
https://vercel.com/dashboard/ai-chatbot
```

### Preview URLs
```
Generated in PR comments after deploy
Example: https://ai-chatbot-pr-11.vercel.app
```

---

## 📌 Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci-cd.yml` | Pipeline definition |
| `.env.local` | Local secrets (not committed) |
| `vitest.config.ts` | Test configuration |
| `tsconfig.json` | TypeScript configuration |
| `vercel.json` | Vercel configuration |
| `Dockerfile` | Docker configuration |

---

## 🎯 Common Commands

```bash
# Run pipeline locally
npm run build && npm run lint && npm test

# Build Docker image
docker build -t ai-chatbot:latest .

# Check Vercel status
vercel --list

# View GitHub Actions
gh run list

# Cancel a workflow
gh run cancel <RUN_ID>

# Retry failed job
gh run rerun <RUN_ID>

# Trigger workflow manually
gh workflow run ci-cd.yml
```

---

## ⏱️ Wait Times

```
Dev Branch → Main:
  1. CI checks:     2-3 minutes
  2. All green ✅
  3. Manual review: varies
  4. Merge → Main:  immediate
  5. Production:    live in ~1 minute
```

---

**Status**: ✅ Ready to use
