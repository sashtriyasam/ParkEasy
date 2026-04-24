# Contributing to ParkEasy

Thank you for your interest in contributing to ParkEasy! This document 
provides guidelines to ensure smooth collaboration.

## 📋 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Message Convention](#commit-message-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

---

## Code of Conduct
By participating in this project, you agree to maintain a respectful, 
inclusive, and constructive environment for all contributors.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
```bash
   git clone https://github.com/sashtriyasam/parking.git
   cd parking
```
3. Add the upstream remote:
```bash
   git remote add upstream https://github.com/sashtriyasam/parking.git
```

---

## Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values (see ARCHITECTURE.md for reference)
npx prisma db push
npx prisma generate
npm run dev
```

### Mobile App
```bash
cd ParkEasyMobile
npm install
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your backend URL
npx expo start
```

### Web Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable production-ready code |
| `develop` | Integration branch for features |
| `feature/xxx` | New features |
| `fix/xxx` | Bug fixes |
| `docs/xxx` | Documentation changes |
| `hotfix/xxx` | Critical production fixes |

Always branch off `develop` for new work. PRs should target `develop`, 
not `main`.

---

## Commit Message Convention

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <short summary>

[optional body]
[optional footer]
```

| Type | Description |
|---|---|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `style` | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process, dependencies, tooling |
| `security` | Security fixes |

**Examples:**
- `feat(auth): add biometric login support`
- `fix(booking): resolve race condition in slot reservation`
- `docs(api): update payment endpoint documentation`
- `perf(socket): reduce slot update payload size`

---

## Pull Request Process

1. Ensure your branch is up to date with `develop`:
```bash
   git fetch upstream
   git rebase upstream/develop
```
2. Test your changes locally across all affected components
3. Fill out the PR template completely
4. Request a review from at least one maintainer
5. Address all review comments before merge
6. PRs are squash-merged to keep a clean history

---

## Code Style

- **Backend**: ESLint + Prettier (Node.js / JavaScript)
- **Mobile & Frontend**: ESLint + Prettier (TypeScript / React)
- No `console.log` in production code — use the Winston logger
- All async functions must use `asyncHandler` wrapper on the backend
- All new API endpoints must have Zod validation middleware
- TypeScript strict mode must remain enabled
- Never hardcode secrets, credentials, or URLs — use environment variables
