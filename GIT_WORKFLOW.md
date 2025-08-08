# Git Workflow Guide

## 🎯 Branch Strategy

### Main Branches
- **`main`**: Production-ready code, always stable
- **`dev`**: Development branch for active work

### Feature Branches (Optional)
- **`feature/feature-name`**: For major features
- **`hotfix/bug-description`**: For urgent fixes

## 🚀 Daily Development Workflow

### 1. Start Your Day
```bash
# Switch to dev branch
git checkout dev

# Get latest changes
git pull origin dev

# Create feature branch (optional, for major features)
git checkout -b feature/your-feature-name
```

### 2. Make Changes
```bash
# Make your code changes
# Test your changes locally

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add user authentication"
git commit -m "fix: resolve login issue"
git commit -m "docs: update README"
```

### 3. Push Changes
```bash
# If working on dev directly
git push origin dev

# If working on feature branch
git push origin feature/your-feature-name
```

## 📋 Pull Request Process

### 1. Create Pull Request
- Go to GitHub: https://github.com/phatofiverr/trading-dashboard
- Click "Compare & pull request"
- Set base branch to `main`
- Set compare branch to `dev` (or your feature branch)

### 2. PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] All tests pass

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] No console errors
```

### 3. Review & Merge
- Review your own changes
- Merge to `main` when ready

## 🔒 Branch Protection Rules

### Recommended GitHub Settings:

1. **Go to Settings → Branches**
2. **Add rule for `main` branch:**
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Restrict pushes to matching branches

3. **Add rule for `dev` branch:**
   - ✅ Require branches to be up to date
   - ✅ Restrict pushes to matching branches

## 📝 Commit Message Convention

Use conventional commits:
```bash
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting changes
refactor: code refactoring
test: adding tests
chore: maintenance tasks
```

## 🚨 Important Rules

### ✅ Do's
- Always work on `dev` branch for new features
- Pull latest changes before starting work
- Write descriptive commit messages
- Test your changes before pushing
- Create PRs for merging to `main`

### ❌ Don'ts
- Never commit directly to `main`
- Never commit sensitive data (API keys, passwords)
- Never force push to shared branches
- Never commit broken code

## 🔧 Environment Variables

### Local Development
- Create `.env` file in project root
- Add to `.gitignore` (already done)
- Never commit `.env` file

### Production Deployment
- Set environment variables in deployment platform (Vercel, Netlify, etc.)

## 🆘 Troubleshooting

### If you accidentally commit to main:
```bash
# Create a new commit that reverts the changes
git revert HEAD
git push origin main
```

### If you need to update your local dev branch:
```bash
git checkout dev
git pull origin dev
```

### If you have conflicts:
```bash
# Resolve conflicts in your editor
git add .
git commit -m "resolve merge conflicts"
git push origin dev
```

## 📚 Useful Commands

```bash
# Check current branch
git branch

# Check status
git status

# View commit history
git log --oneline -10

# Stash changes temporarily
git stash
git stash pop

# Reset to last commit
git reset --hard HEAD

# View remote branches
git branch -r
```

## 🎉 Best Practices Summary

1. **Always work on `dev` branch**
2. **Pull before you push**
3. **Write good commit messages**
4. **Test before committing**
5. **Use PRs for merging to main**
6. **Keep sensitive data out of commits**
7. **Communicate with team about major changes**

---

**Repository**: https://github.com/phatofiverr/trading-dashboard
**Default Branch**: `dev`
**Production Branch**: `main`
