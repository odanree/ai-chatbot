# Git Branching Strategy

> Defines the git workflow and branching strategy for the AI Chatbot project.

---

## 🌿 Branch Structure

The branching strategy follows a simple, linear flow:

```
main (production)
  ↑
  └─── dev (staging)
         ↑
         └─── feat/*, fix/*, etc. (feature branches)
```

**Key Points**:
- ✅ **One-way flow**: feature → dev → main (no PR backwards)
- ✅ **All work in dev**: Feature branches always merge to dev first
- ✅ **Release to main**: Single PR from dev → main when ready for production
- ✅ **Clean history**: Squash merges keep main history minimal

---

## 🌿 Branch Types

### Main Branches

#### `main` (Production)
- **Purpose**: Production-ready code only
- **Protection**: Requires pull request reviews
- **Deployment**: Auto-deploy to Vercel production
- **Merge Source**: Only from `dev` branch
- **Merge Strategy**: Squash and merge (clean history)
- **Commits**: Must follow conventional commit format
- **Frequency**: Merged when ready for release (not on every change)

#### `dev` (Development/Staging)
- **Purpose**: Integration branch for all feature work
- **Protection**: Requires pull request reviews
- **Deployment**: Auto-deploy to Vercel preview
- **Merge Source**: From feature branches only
- **Merge Strategy**: Squash and merge
- **Base Branch**: Always create feature branches from `dev` (not main)

### Feature Branches

#### Format: `feat/feature-name`
- **Purpose**: Implement new features
- **Base**: Create from `dev`
- **Target**: Merge to `dev` (NOT main)
- **Example**: `feat/openai-integration`, `feat/shopify-api`

#### Format: `fix/bug-name`
- **Purpose**: Fix bugs
- **Base**: Create from `dev`
- **Target**: Merge to `dev` (NOT main)
- **Example**: `fix/rate-limit-bug`, `fix/api-error-handling`

#### Format: `refactor/refactor-name`
- **Purpose**: Code refactoring (no feature changes)
- **Base**: Create from `dev`
- **Target**: Merge to `dev` (NOT main)
- **Example**: `refactor/api-structure`, `refactor/error-handling`

#### Format: `docs/doc-name`
- **Purpose**: Documentation updates
- **Base**: Create from `dev`
- **Target**: Merge to `dev` (NOT main)
- **Example**: `docs/api-guide`, `docs/setup-instructions`

#### Format: `chore/task-name`
- **Purpose**: Maintenance tasks
- **Base**: Create from `dev`
- **Target**: Merge to `dev` (NOT main)
- **Example**: `chore/update-dependencies`, `chore/add-linting`

---

## 🔄 Git Workflow

### Simple Linear Flow

```
1. Work on feature branch (based on dev)
   ↓
2. Create PR: feature → dev
   ↓
3. Review & merge to dev (CI/CD runs)
   ↓
4. Test in dev/staging environment
   ↓
5. Create PR: dev → main (for release)
   ↓
6. Review & merge to main (CI/CD deploys to production)
```

---

### Step-by-Step Instructions

#### 1. Setup (One-time)

```bash
# Clone the repository
git clone https://github.com/odanree/ai-chatbot.git
cd ai-chatbot

# Create dev branch locally (if not already created)
git checkout -b dev origin/dev
```

#### 2. Start Work on a Feature

**Always base new work on `dev`, NOT main**

```bash
# Update dev branch with latest changes
git checkout dev
git pull origin dev

# Create feature branch from dev
git checkout -b feat/my-feature

# Make changes...
git add .
git commit -m "feat(scope): description

- Detailed change 1
- Detailed change 2

Refs #1"
```

#### 3. Push and Create PR (Feature → Dev)

```bash
# Push feature branch
git push -u origin feat/my-feature

# Create PR to dev (NOT main!)
gh pr create --base dev --head feat/my-feature

# Or create manually:
# 1. Go to https://github.com/odanree/ai-chatbot
# 2. Click "Compare & pull request"
# 3. Set base: dev, compare: feat/my-feature
# 4. Add description and submit
```

#### 4. Review and Merge to Dev

```bash
# After PR is approved and CI/CD passes:
gh pr merge <PR_NUMBER> --squash --delete-branch

# Sync dev locally
git checkout dev
git pull origin dev
```

#### 5. Test in Dev Environment

```bash
# The code is now in dev branch
# Test features in staging environment
# Test automated E2E tests
# Verify everything works
```

#### 6. Create Release PR (Dev → Main)

**Only when ready for production release**

```bash
# Update dev with latest
git checkout dev
git pull origin dev

# Create PR from dev to main
gh pr create --base main --head dev --title "Release v1.0.0"

# Add release notes describing what's included
```

#### 7. Review and Merge to Main

```bash
# After final review and CI/CD passes:
gh pr merge <PR_NUMBER> --squash --delete-branch=false

# This triggers production deployment to Vercel
```

---

### Important: Never Work on These Branches Directly

```bash
# ❌ DON'T do this:
git checkout main
git commit -m "..."    # Don't commit directly to main

git checkout dev
git commit -m "..."    # Don't commit directly to dev

# ✅ DO this instead:
git checkout -b feat/feature-name   # Create feature branch
git commit -m "..."                  # Work on feature branch
# Then create PR to dev
```

---

## 📋 Conventional Commits

### Format
```
type(scope): description

body (optional)

footer (optional)
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (formatting, no logic change)
- `refactor:` - Code refactoring
- `test:` - Tests
- `chore:` - Maintenance, dependencies

### Examples

**Simple commit:**
```bash
git commit -m "feat(openai): add error handling"
```

**Detailed commit:**
```bash
git commit -m "feat(openai): implement rate limiting

- Add rate limit tracking (30 req/min)
- Implement rate limit status endpoint
- Add 429 error response

Closes #5"
```

**Fix commit:**
```bash
git commit -m "fix(api): handle empty messages

- Validate message before sending to OpenAI
- Return 400 status for empty input
- Add error message to response"
```

---

## 🔀 Pull Request Process

### Two Types of PRs

#### Type 1: Feature → Dev (Most Common)
- **When**: After completing work on a feature
- **Base**: `dev`
- **Compare**: `feat/feature-name` or similar
- **Purpose**: Integrate feature into development
- **Review**: Require 1 approval
- **Merge**: Squash and merge

#### Type 2: Dev → Main (Release Only)
- **When**: Ready to release to production
- **Base**: `main`
- **Compare**: `dev`
- **Purpose**: Deploy tested code to production
- **Review**: Require 1 approval + all tests pass
- **Merge**: Squash and merge
- **Frequency**: As needed (daily, weekly, or per-release)

### Creating a PR

1. **Branch**: Create from `dev`
2. **Title**: Use conventional commit format: `feat: description` or `fix: description`
3. **Description**: Include:
   - What changed and why
   - Related issue number (e.g., `Closes #5`)
   - Testing steps
   - Screenshots (if UI changes)

### PR Template

```markdown
## Description
Brief description of changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring
- [ ] Release (dev → main only)

## Testing
Steps to test:
1. ...
2. ...
3. ...

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Documentation updated
```

### Merging a PR

1. **Approval**: At least 1 reviewer approval required
2. **CI/CD**: All automated checks must pass
   - TypeScript compilation
   - Unit tests
   - Linting
   - Vercel preview deployment
3. **Merge Type**: Always use "Squash and merge"
4. **Delete Branch**: Check "Delete branch after merging" (except for dev)

---

### PR Merge Strategies Explained

#### Squash and Merge (RECOMMENDED)
```bash
gh pr merge <PR_NUMBER> --squash
```
**Result**: Combines all commits into one clean commit on target branch
**Good For**: Keeping main and dev history clean
**Example**:
- Feature has 10 commits
- Merges as 1 commit to dev/main
- Result: `feat: add openai integration (#42)`

#### Regular Merge (NOT RECOMMENDED)
```bash
gh pr merge <PR_NUMBER>
```
**Result**: Creates merge commit, keeps all feature commits
**Problem**: Clutters main branch history with every small commit
**When to use**: Never (we use squash)

---

## 🚀 Release Process

### When to Release

- Code is tested and working in dev
- All CI/CD checks passing
- Ready for production deployment

### Simple Release Workflow

```bash
# 1. Make sure dev is up to date
git checkout dev
git pull origin dev

# 2. Create PR from dev to main
gh pr create --base main --head dev --title "Release v1.0.0: description"

# 3. Review and test
# - Wait for all CI/CD checks to pass
# - Get approval from reviewer
# - Review release notes

# 4. Merge to main (squash)
gh pr merge <PR_NUMBER> --squash --delete-branch=false

# ✅ Vercel automatically deploys to production!
# ✅ dev branch remains intact for next development cycle
```

### Optional: Version Bumping

Before creating release PR, optionally update version:

```bash
# Update package.json version
# Update CHANGELOG.md with release notes
git checkout dev
git commit -m "chore: bump version to 1.0.1"
git push origin dev

# Then create PR to main as above
```

### After Release

```bash
# No need to sync anything - just keep working on dev
# Next feature branches still base on dev
git checkout dev
git pull origin dev
git checkout -b feat/next-feature
```

### Rollback (If Needed)

```bash
# If released code has critical bug:
# Option 1: Fix in new branch and re-release
git checkout -b fix/critical-bug
# ... fix the issue ...
git commit -m "fix: critical bug in production"
git push origin fix/critical-bug
gh pr create --base dev --head fix/critical-bug

# Option 2: Revert main if needed
git checkout main
git revert HEAD  # Reverts last commit
git push origin main
```

---

## 📊 Branch Protection Rules

### Main Branch Protection
These rules prevent accidents and ensure code quality:

```
✅ Require pull request reviews before merging
   - Minimum 1 approval
   - Dismiss stale reviews when new commits pushed

✅ Require status checks to pass before merging
   - TypeScript compilation
   - Unit tests
   - Linting
   - Vercel preview deployment

✅ Require branches to be up to date before merging

✅ Require conversation resolution (if comments exist)

✅ Restrict who can push to main (admins only)

✅ Enforce squash merging only (no regular merge/rebase)
```

### Dev Branch Protection

```
✅ Require pull request reviews before merging
   - Minimum 1 approval

✅ Require status checks to pass before merging
   - Same as main

✅ Allow force pushes (for cleanup if needed)

✅ Enforce squash merging only
```

### Why These Rules?

- **Prevent accidents**: No direct commits to main/dev
- **Ensure quality**: All tests must pass
- **Code review**: Get another perspective
- **Clean history**: Squash merge keeps logs readable
- **Clear timeline**: Only PR merges show in history

---

## 🐛 Troubleshooting

### Issue: "Your branch is behind by N commits"

**Solution**: Update your branch:
```bash
git checkout dev
git pull origin dev
```

### Issue: "Merge conflict"

**Solution**: Resolve conflicts:
```bash
# Update from dev
git fetch origin
git rebase origin/dev

# Manually resolve conflicts in your editor
# Then:
git add .
git rebase --continue
git push --force-with-lease origin feat/my-feature
```

### Issue: "Can't merge - branch is not up to date"

**Solution**: Update branch before merging:
```bash
git checkout feat/my-feature
git pull origin dev
git push origin feat/my-feature
```

### Issue: "Need to undo last commit"

**Solution**: Soft reset:
```bash
git reset --soft HEAD~1
# Make changes
git commit -m "new commit message"
```

### Issue: "Accidentally committed to main"

**Solution**: Create a new branch:
```bash
git checkout -b feat/my-feature
git reset origin/main --hard

git checkout main
git reset origin/main --hard
```

---

## 📝 Daily Workflow

### Typical Development Day

**Morning (Start of work)**
```bash
# Update dev to get latest changes
git checkout dev
git pull origin dev

# Create feature branch from dev
git checkout -b feat/my-task-name
```

**During Development**
```bash
# Make changes, commit regularly
git add src/file.ts
git commit -m "feat(scope): add functionality"
git commit -m "feat(scope): implement error handling"

# Push to GitHub periodically
git push origin feat/my-task-name
```

**When Work is Ready for Review**
```bash
# Make sure all changes are committed
git status  # Should show "working tree clean"

# Create PR to dev (NOT main)
gh pr create --base dev --head feat/my-task-name

# Add detailed description of changes
```

**After Merge to Dev**
```bash
# PR is merged, feature is in dev
# Local repo still on feature branch

# Switch to dev and get latest
git checkout dev
git pull origin dev

# Start next feature
git checkout -b feat/next-task-name
```

**When Releasing to Production**
```bash
# Create release PR from dev to main
git checkout dev
git pull origin dev
gh pr create --base main --head dev --title "Release: description"

# After merge, code is live in production
# Continue normal dev work
```

---

## 🎯 Best Practices

### ✅ DO

- ✅ **Always branch from `dev`**: Feature branches base on `dev`, never on `main`
- ✅ **Create PR to `dev` first**: Merge feature → dev, then dev → main when ready
- ✅ **Keep focused branches**: One feature/fix per branch
- ✅ **Commit often**: Small, logical commits with good messages
- ✅ **Write clear messages**: Follow conventional commit format
- ✅ **Keep updated**: Regularly pull from dev to avoid conflicts
- ✅ **Use squash merge**: Keeps history clean
- ✅ **Delete merged branches**: Keep repo clean
- ✅ **Test before PR**: Test locally first, then rely on CI/CD
- ✅ **One-way flow**: feature → dev → main (never backwards)

### ❌ DON'T

- ❌ **Don't create feature PRs to `main`**: Always PR to `dev` first
- ❌ **Don't commit directly to main or dev**: Always use feature branches
- ❌ **Don't forget to update from dev**: Can lead to merge conflicts
- ❌ **Don't use regular merge**: Use squash merge only
- ❌ **Don't use cryptic branch names**: Be descriptive
- ❌ **Don't leave branches hanging**: Delete after merge
- ❌ **Don't merge without tests passing**: Wait for CI/CD green checkmarks
- ❌ **Don't skip PR reviews**: Get another set of eyes

### Quick Reference

```bash
# ✅ CORRECT WORKFLOW:
git checkout dev               # Start from dev
git pull origin dev            # Get latest
git checkout -b feat/task      # Create feature branch
# ... make changes ...
git commit -m "feat: description"
git push origin feat/task
gh pr create --base dev        # PR to dev, not main!

# ❌ WRONG WORKFLOWS:
git checkout main              # DON'T start here
git checkout feat/task         # DON'T create from main

gh pr create --base main       # DON'T PR directly to main
git checkout main              # DON'T work here directly
git commit -m "..."            # DON'T commit directly to main
```

---

## 📚 Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub CLI](https://cli.github.com/)

---

## 🔗 Related Files

- `.github/BRANCHING_STRATEGY.md` - This file
- `CONTRIBUTING.md` - Contribution guidelines
- `README.md` - Project overview

---

**Last Updated**: November 3, 2025  
**Status**: Active  
**Maintainer**: odanree
