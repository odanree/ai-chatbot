# 🔄 CI/CD Pipeline Setup Guide

> Complete GitHub Actions CI/CD implementation for automated testing and deployment.

---

## 📋 Overview

The CI/CD pipeline automates testing, building, and deployment on every commit. This ensures code quality and fast feedback.

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────┐
│ Commit to GitHub (main or dev branch)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    ┌─────▼────────┐          ┌────▼──────────┐
    │ Lint & Types │          │  Unit Tests   │
    │ (tsc build)  │          │  (vitest)     │
    └─────┬────────┘          └────┬──────────┘
          │                         │
          └────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    ┌─────▼──────────┐        ┌────▼────────────┐
    │ Docker Build   │        │ Vercel Deploy   │
    │ (if main)      │        │ (Preview/Prod)  │
    └─────┬──────────┘        └────┬────────────┘
          │                         │
          └────────────┬────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    ┌─────▼──────────┐        ┌────▼────────────┐
    │ Health Check   │        │ Notify Results  │
    │ (if main)      │        │ (PR comments)   │
    └────────────────┘        └─────────────────┘
```

---

## ⚙️ Workflow Configuration

### File Location
`.github/workflows/ci-cd.yml`

### Trigger Events

```yaml
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]
```

**Triggered on**:
- ✅ Push to main or dev
- ✅ Pull requests to main or dev
- ✅ Every commit (runs in parallel)

---

## 📊 Pipeline Jobs

### Job 1: Lint & Type Check

**Purpose**: Verify code quality and TypeScript compatibility

```yaml
lint-and-types:
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Setup Node.js 18
    - Install dependencies
    - Run TypeScript build (npm run build)
    - Run linter (npm run lint)
```

**What it checks**:
- ✅ TypeScript strict mode compilation
- ✅ Code style and formatting
- ✅ Unused imports and variables
- ✅ Type safety

**Duration**: ~30 seconds

### Job 2: Test Suite

**Purpose**: Run all unit and integration tests

```yaml
test:
  needs: lint-and-types
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Setup Node.js 18
    - Install dependencies
    - Run tests with mocked services
    - Upload coverage reports
```

**What it tests**:
- ✅ Unit tests (functions, utilities)
- ✅ Integration tests (API endpoints)
- ✅ Error handling
- ✅ Mock services (OpenAI, Shopify)

**Duration**: ~45 seconds  
**Coverage Target**: 85%+

### Job 3: Docker Build

**Purpose**: Build and validate Docker image (main branch only)

```yaml
docker:
  needs: test
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - Checkout code
    - Setup Docker Buildx
    - Build Docker image
    - Cache layers for future builds
```

**What it does**:
- ✅ Multi-stage build (Builder + Runtime)
- ✅ Final image ~250MB
- ✅ Layer caching for speed
- ✅ Non-root user validation

**Duration**: ~2-3 minutes

### Job 4: Deploy to Vercel

**Purpose**: Deploy to Vercel preview or production

```yaml
deploy:
  needs: [lint-and-types, test]
  if: github.event_name == 'push'
  runs-on: ubuntu-latest
  steps:
    - Deploy to Vercel Preview (if dev branch)
    - Deploy to Vercel Production (if main branch)
```

**What it does**:
- ✅ Preview deployment for PRs/dev
- ✅ Production deployment for main
- ✅ Auto-generated preview URLs
- ✅ Environment variable injection

**Duration**: ~1-2 minutes (main), ~1 minute (preview)

### Job 5: Health Check

**Purpose**: Verify deployed application is healthy (main only)

```yaml
health-check:
  needs: deploy
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - Wait 30 seconds for deployment
    - Call /health endpoint
    - Verify 200 response
```

**What it checks**:
- ✅ Application starts
- ✅ Health endpoint responds
- ✅ Basic connectivity

**Duration**: ~30+ seconds

### Job 6: Notify Results

**Purpose**: Post results to GitHub PR

```yaml
notify:
  if: always()
  runs-on: ubuntu-latest
  steps:
    - Determine overall status
    - Post success/failure comment on PR
```

**What it does**:
- ✅ Success message if all checks pass
- ✅ Failure message if any check fails
- ✅ Visible in PR comments section

---

## 🔑 Required Secrets

Add these to GitHub repository settings (Settings → Secrets):

### Vercel Secrets

```
VERCEL_TOKEN          - Personal access token from Vercel
VERCEL_ORG_ID        - Organization ID from Vercel dashboard
VERCEL_PROJECT_ID    - Project ID from Vercel dashboard
```

**Get VERCEL_TOKEN**:
1. Go to https://vercel.com/account/tokens
2. Create new token (Scope: Full Account)
3. Copy token to GitHub secret

**Get VERCEL_ORG_ID & VERCEL_PROJECT_ID**:
1. Run: `vercel link` (links to project)
2. Check `.vercel/project.json` file
3. Copy `orgId` and `projectId`

### GitHub Secrets

```
GITHUB_TOKEN          - Auto-created, no action needed
```

---

## 📈 Pipeline Execution Time

### By Branch

**Main Branch** (Full pipeline):
```
Lint & Types:    ~30 seconds
Tests:           ~45 seconds  ┐ (parallel)
Docker Build:    ~150 seconds │
Vercel Deploy:   ~90 seconds  ┘
Health Check:    ~30 seconds
─────────────────────────────────────
Total: ~3-4 minutes
```

**Dev Branch** (Reduced pipeline):
```
Lint & Types:    ~30 seconds
Tests:           ~45 seconds ┐ (parallel)
Vercel Preview:  ~60 seconds ┘
─────────────────────────────────────
Total: ~1-2 minutes
```

### Optimization Tips

1. **Cache Node Modules**: Uses `cache: 'npm'` to cache dependencies
2. **Parallel Jobs**: Lint & Types runs in parallel with other jobs
3. **Conditional Steps**: Docker only builds on main branch
4. **Early Exit**: Failures stop subsequent steps

---

## ✅ Pre-Deployment Checklist

### Before Merging PR to Main

The pipeline verifies:

- [x] TypeScript compilation succeeds (strict mode)
- [x] Linter passes (no code style issues)
- [x] All tests pass (215+ tests)
- [x] No unused imports or variables
- [x] Code coverage meets target (85%+)
- [x] Docker image builds successfully
- [x] Vercel deployment succeeds
- [x] Health check passes

### What to Do If Pipeline Fails

**TypeScript/Lint Failure**:
1. Check error message in GitHub
2. Fix type errors or lint issues locally
3. Push fixes to same branch
4. Pipeline re-runs automatically

**Test Failure**:
1. Run locally: `npm test`
2. Fix failing tests
3. Push to GitHub
4. Pipeline re-runs

**Vercel Deployment Failure**:
1. Check Vercel logs: https://vercel.com/dashboard
2. Verify environment variables are set
3. Check build command: `npm run build`
4. Redeploy manually if needed

---

## 🔄 Workflow Scenarios

### Scenario 1: Feature Branch to Dev

```
1. Push to feature/my-feature
2. Create PR to dev
3. Pipeline runs (no Docker/Prod):
   ✅ Lint & Types (30s)
   ✅ Tests (45s)
   ✅ Vercel Preview (60s)
   Total: ~2 minutes
4. Preview URL in PR comments
5. Merge after approval
```

### Scenario 2: Dev to Main (Production)

```
1. Create PR from dev → main
2. Pipeline runs (full):
   ✅ Lint & Types (30s)
   ✅ Tests (45s)
   ✅ Docker Build (150s)
   ✅ Vercel Production (90s)
   ✅ Health Check (30s)
   Total: ~4 minutes
3. Wait for all checks ✅
4. Merge with squash merge
5. Live on production
6. Health checks pass
```

### Scenario 3: Hotfix to Main

```
1. Create hotfix branch from main
2. Fix critical bug
3. Create PR to main
4. Pipeline runs (full):
   ✅ All checks pass
5. Merge immediately
6. Hotfix deployed to production
7. Notify team
```

---

## 📊 Monitoring & Observability

### GitHub Actions Dashboard

View runs at: https://github.com/odanree/ai-chatbot/actions

Shows:
- ✅ All workflow runs
- ✅ Individual job status
- ✅ Execution times
- ✅ Failure reasons
- ✅ Log details

### Vercel Deployment

View deployments at: https://vercel.com/dashboard

Shows:
- ✅ Preview URLs
- ✅ Production status
- ✅ Build logs
- ✅ Environment variables
- ✅ Performance metrics

### Codecov Coverage

View coverage at: https://codecov.io (if connected)

Shows:
- ✅ Code coverage by file
- ✅ Coverage trends
- ✅ Coverage reports
- ✅ Pull request coverage changes

---

## 🆘 Troubleshooting

### Error: "Secret VERCEL_TOKEN not found"

**Solution**:
1. Go to GitHub → Settings → Secrets → Actions
2. Click "New repository secret"
3. Name: `VERCEL_TOKEN`
4. Value: (token from Vercel)
5. Save

### Error: "Vercel deployment failed"

**Solution**:
1. Check Vercel dashboard for error details
2. Verify all environment variables are set
3. Check build command: `npm run build`
4. Verify output directory: `dist`
5. Redeploy manually: `vercel --prod`

### Error: "Tests failed"

**Solution**:
1. Run locally: `npm test`
2. Fix failing tests
3. Run again to verify
4. Push fixed code
5. Pipeline re-runs automatically

### Error: "Docker build failed"

**Solution**:
1. Build locally: `docker build -t ai-chatbot .`
2. Check Dockerfile syntax
3. Verify all dependencies in package.json
4. Check for missing files
5. Test locally before pushing

---

## 📝 Pipeline Maintenance

### Weekly Review

- [ ] Check GitHub Actions run times (should be consistent)
- [ ] Review test results (watch for flaky tests)
- [ ] Check Vercel deployment status
- [ ] Verify no secrets are exposed

### Monthly Review

- [ ] Update Node.js version if new LTS released
- [ ] Review and update dependencies
- [ ] Analyze code coverage trends
- [ ] Update documentation

---

## 🔗 Related Documentation

- **Vercel Deployment**: [docs/VERCEL_DEPLOYMENT_GUIDE.md](docs/VERCEL_DEPLOYMENT_GUIDE.md)
- **Docker Setup**: [docs/DOCKER_SETUP_GUIDE.md](docs/DOCKER_SETUP_GUIDE.md)
- **Environment Configuration**: [docs/ENVIRONMENT_CONFIGURATION.md](docs/ENVIRONMENT_CONFIGURATION.md)
- **Testing Guide**: [docs/TEST_ARCHITECTURE.md](docs/TEST_ARCHITECTURE.md)
- **Git Workflow**: [.github/BRANCHING_STRATEGY.md](.github/BRANCHING_STRATEGY.md)

---

## 📚 External Resources

- **GitHub Actions Docs**: https://docs.github.com/en/actions
- **Vercel GitHub Integration**: https://vercel.com/docs/concepts/git
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Node.js CI/CD**: https://nodejs.org/en/docs/guides/nodejs-docker-webapp/

---

**Last Updated**: November 5, 2025  
**Status**: Production-ready ✅  
**Version**: 1.0
