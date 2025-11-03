# Updated Branching Strategy

**Updated**: November 3, 2025  
**Status**: ✅ Active

---

## 🎯 New Simplified Workflow

The branching strategy has been updated to a **simple linear flow** that eliminates unnecessary PR complexity.

### Old Workflow ❌
```
feature → dev → feature review
            ↓
        dev branch merged
            ↓
        feature → main → release
```
**Problem**: Confusing path with multiple branch merges and PR types

### New Workflow ✅
```
feature → dev → main
(clean, linear, one-way flow)
```

**Benefits**:
- ✅ Simpler to understand and follow
- ✅ Fewer PR types (only 2: feature→dev, dev→main)
- ✅ No backtracking or syncing needed
- ✅ Clear production deployment path
- ✅ Reduced merge conflicts

---

## 📋 Quick Reference

### Branch Structure
```
main (production)
  ↑
  └─ dev (staging)
       ↑
       └─ feature/* (work happens here)
```

### Two Types of PRs

| PR Type | From | To | When | Frequency |
|---------|------|----|----|-----------|
| **Development PR** | `feat/task-name` | `dev` | After completing a feature | Daily |
| **Release PR** | `dev` | `main` | When ready for production | As needed |

---

## 🚀 Day-to-Day Workflow

### Start Work
```bash
git checkout dev
git pull origin dev
git checkout -b feat/my-task
```

### Complete Work
```bash
git add .
git commit -m "feat(scope): description"
git push origin feat/my-task

# Create PR to dev (NOT main)
gh pr create --base dev
```

### After Approval
```bash
# PR gets merged to dev
# Your code is now in staging environment
# No additional action needed
```

### Release to Production
```bash
# When ready (daily, weekly, or per-feature):
git checkout dev
git pull origin dev
gh pr create --base main --title "Release v1.0.0"

# After approval and merge:
# Code is deployed to production automatically
```

---

## Key Changes

### ✅ Always Do
1. **Branch from dev**: `git checkout -b feat/task-name` (from dev)
2. **PR to dev first**: Feature work merges to dev
3. **PR to main last**: Only dev merges to main (for releases)
4. **Test in dev**: Verify changes work in staging
5. **Squash merge**: Keep history clean

### ❌ Never Do
1. ❌ Don't create feature branches from main
2. ❌ Don't PR feature directly to main
3. ❌ Don't commit directly to main or dev
4. ❌ Don't use regular merge (always squash)
5. ❌ Don't forget to update from dev before starting work

---

## Visual Flow Diagram

```
Developer A          Developer B          Developer C
    │                    │                    │
    ├─ dev (latest)      │                    │
    │   ↓                │                    │
    ├─ feat/feature-a    ├─ dev               │
    │   │                │   ↓                │
    │   ├─ commit 1      │   ├─ feat/feature-b├─ dev
    │   ├─ commit 2      │   │   │            │   ↓
    │   └─ PR to dev ✓   │   │   ├─ commit    │   ├─ feat/feature-c
    │       ↓            │   │   └─ PR ✓      │   │   │
    └─→ [dev updated]    └─→ [dev updated]    └─→ [dev updated]
           ↓                     ↓                    ↓
    [Both features in dev staging]          ← All work flows here
           ↓
    [When ready]
           ↓
    [PR: dev → main for release]
           ↓
    [Deployed to production]
```

---

## Important Files

- **`.github/BRANCHING_STRATEGY.md`** - Full branching strategy documentation
- **`CONTRIBUTING.md`** - Contribution guidelines
- **`README.md`** - Project overview

---

## FAQ

### Q: Can I create a feature branch from main?
**A**: No. Always create feature branches from `dev`. The main branch should only receive PRs from `dev`.

### Q: Where do I create my PR?
**A**: Feature branches PR to `dev`. Only the `dev` branch PRs to `main`.

### Q: Why don't we PR directly to main?
**A**: Because `dev` is the staging environment. We test changes there first, then release `dev` to `main` as a single release PR.

### Q: When do I PR to main?
**A**: Only when you have tested code in `dev` and are ready for production release. This is typically handled by the release manager or project lead.

### Q: What if I accidentally created a PR to main?
**A**: Close it and create a new PR to `dev` instead. GitHub will help you redirect.

### Q: Do I need to sync dev with main after releasing?
**A**: No. Dev is already on main (since we merged dev to main). Just pull latest dev and continue working.

### Q: Can multiple features be in dev at once?
**A**: Yes! That's the point of `dev`. Multiple feature branches merge to `dev`, then when ready, all of them release to main together as one release.

### Q: What if dev has bugs after merging?
**A**: Create a `fix/bug-name` branch from dev, fix the bug, and PR back to dev. Test before releasing to main.

---

## Examples

### Example 1: Simple Feature

```bash
# Developer: Start work on new feature
git checkout dev && git pull origin dev
git checkout -b feat/add-logging

# Make changes...
git commit -m "feat(logging): add request logging"
git push origin feat/add-logging

# Create PR (notice: base is dev, not main)
gh pr create --base dev --head feat/add-logging

# After approval: PR is merged to dev
# ✅ Feature is now in staging

# When releasing (manager does this):
gh pr create --base main --head dev --title "Release v1.0.1"
# After approval: deployed to production
```

### Example 2: Bug Fix

```bash
# Developer: Fix bug in dev
git checkout dev && git pull origin dev
git checkout -b fix/api-timeout

# Fix the issue...
git commit -m "fix(api): handle timeout gracefully"
git push origin fix/api-timeout

# PR to dev (notice: base is dev)
gh pr create --base dev

# After approval: merged to dev
# Test in staging environment
# Include in next release to main
```

### Example 3: Release

```bash
# Manager: Release what's in dev to production
git checkout dev && git pull origin dev

# Create release PR
gh pr create --base main --head dev \
  --title "Release v1.1.0: new logging and timeout fix"

# After tests pass and approval:
gh pr merge <PR_NUMBER> --squash

# ✅ Vercel auto-deploys to production
# ✅ All features in dev are now in production
```

---

## Commit History Comparison

### Old Strategy (Messy)
```
* a1b2c3d Merge pull request #42 from dev to main
* b2c3d4e Merge pull request #41 from feat/logging to dev
* c3d4e5f Merge pull request #40 from feat/api to dev
* d4e5f6g fix: handle error
* e5f6g7h feat: add logging
* f6g7h8i feat: add api
```

### New Strategy (Clean)
```
* a1b2c3d Merge PR #10 from dev to main (Release v1.1.0)
* b2c3d4e Merge PR #9 from feat/logging to dev
* c3d4e5f Merge PR #8 from feat/api to dev
* d4e5f6g Merge PR #7 from fix/timeout to dev
```

Each merge shows a clear feature or release, not internal complexity.

---

## Migration Notes

- ✅ **Existing dev branch**: Continue using as-is
- ✅ **New feature branches**: Always branch from dev
- ✅ **Future PRs**: Dev→main only for releases
- ✅ **Backward compatible**: Old commits stay in history

---

**For detailed instructions**: See `.github/BRANCHING_STRATEGY.md`

