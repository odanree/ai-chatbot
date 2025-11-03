# Git Branching Strategy

> Defines the git workflow and branching strategy for the AI Chatbot project.

---

## 🌿 Branch Types

### Main Branches

#### `main` (Production)
- **Purpose**: Production-ready code only
- **Protection**: Requires pull request reviews
- **Deployment**: Auto-deploy to Vercel production
- **Merge Strategy**: Squash and merge (clean history)
- **Commits**: Must follow conventional commit format

#### `dev` (Development/Staging)
- **Purpose**: Integration branch for features
- **Protection**: Requires pull request reviews
- **Deployment**: Auto-deploy to Vercel preview
- **Merge Strategy**: Squash and merge
- **Base Branch**: Create feature branches from here

### Feature Branches

#### Format: `feat/feature-name`
- **Purpose**: Implement new features
- **Base**: Create from `dev`
- **Example**: `feat/openai-integration`, `feat/shopify-api`

#### Format: `fix/bug-name`
- **Purpose**: Fix bugs
- **Base**: Create from `dev`
- **Example**: `fix/rate-limit-bug`, `fix/api-error-handling`

#### Format: `refactor/refactor-name`
- **Purpose**: Code refactoring (no feature changes)
- **Base**: Create from `dev`
- **Example**: `refactor/api-structure`, `refactor/error-handling`

#### Format: `docs/doc-name`
- **Purpose**: Documentation updates
- **Base**: Create from `dev`
- **Example**: `docs/api-guide`, `docs/setup-instructions`

#### Format: `chore/task-name`
- **Purpose**: Maintenance tasks
- **Base**: Create from `dev`
- **Example**: `chore/update-dependencies`, `chore/add-linting`

---

## 🔄 Git Workflow

### 1. Setup (One-time)

```bash
# Clone the repository
git clone https://github.com/odanree/ai-chatbot.git
cd ai-chatbot

# Create dev branch locally (if not already created)
git checkout -b dev origin/dev

# Or if origin/dev doesn't exist yet:
git checkout -b dev
git push -u origin dev
```

### 2. Start Work on a Feature

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

### 3. Push and Create Pull Request

```bash
# Push feature branch
git push -u origin feat/my-feature

# Create PR using GitHub CLI (recommended)
gh pr create --base dev --head feat/my-feature

# Or create manually on GitHub.com:
# 1. Go to https://github.com/odanree/ai-chatbot
# 2. Click "Compare & pull request"
# 3. Set base: dev, compare: feat/my-feature
# 4. Add description
# 5. Click "Create pull request"
```

### 4. Review and Merge to Dev

```bash
# After PR is approved and CI/CD passes:
gh pr merge <PR_NUMBER> --squash --delete-branch

# Sync dev locally
git checkout dev
git pull origin dev
```

### 5. Create Release PR (Dev → Main)

```bash
# When ready for production release:
gh pr create --base main --head dev --title "Release v1.0.0"

# Squash and merge after approval
gh pr merge <PR_NUMBER> --squash --delete-branch=false
```

### 6. Sync Dev with Main

```bash
# After merging dev to main:
git checkout dev
git pull origin main
git push origin dev
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

## Related Issue
Closes #5

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Testing
Steps to test:
1. ...
2. ...
3. ...

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Tests added/updated
- [ ] Documentation updated
```

### Merging a PR

1. **Approval**: At least 1 reviewer approval required
2. **CI/CD**: All checks must pass
3. **Merge Type**: Use "Squash and merge" for clean history
4. **Delete Branch**: Check "Delete branch after merging"

---

## 🚀 Release Process

### Creating a Release

1. **Create Release PR**:
   ```bash
   git checkout dev
   git pull origin dev
   gh pr create --base main --head dev --title "Release v1.0.0"
   ```

2. **Update Version** (optional):
   - Update `package.json` version
   - Update `CHANGELOG.md`
   - Commit: `chore: bump version to 1.0.0`

3. **Merge to Main**:
   ```bash
   gh pr merge <PR_NUMBER> --squash
   ```

4. **Sync Dev**:
   ```bash
   git checkout dev
   git pull origin main
   git push origin dev
   ```

5. **Tag Release** (optional):
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

---

## 📊 Branch Protection Rules

### Main Branch Rules
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require conversation resolution
- ✅ Dismiss stale reviews when new commits pushed
- ✅ Require code owner reviews (if applicable)

### Dev Branch Rules
- ✅ Require pull request reviews (minimum 1)
- ✅ Require status checks to pass
- ✅ Allow force pushes (for cleanup)

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

### Morning (Start of work)

```bash
# Update dev branch
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feat/task-name
```

### During Development

```bash
# Make changes and commit regularly
git add src/file.ts
git commit -m "feat(scope): add functionality"

# Push changes
git push origin feat/task-name
```

### End of Work (Ready for review)

```bash
# Ensure all changes are committed
git status

# Push final changes
git push origin feat/task-name

# Create PR
gh pr create --base dev --head feat/task-name
```

### After Merge

```bash
# Update dev locally
git checkout dev
git pull origin dev

# Start next feature
git checkout -b feat/next-feature
```

---

## 🎯 Best Practices

1. **Keep branches focused**: One feature per branch
2. **Commit often**: Small, logical commits
3. **Write clear messages**: Use conventional commits
4. **Keep updated**: Regularly pull from dev
5. **Review before pushing**: Test locally first
6. **Squash on merge**: Keeps main history clean
7. **Delete merged branches**: Keep repo clean
8. **Use meaningful names**: `feat/openai-integration` not `feat/work`

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
