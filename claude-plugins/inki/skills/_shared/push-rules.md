# Shared Push Rules

These rules apply to all pushes made on strapi/documentation.

## Gather branch state

Run in parallel:

```bash
git branch --show-current
```

```bash
git rev-parse --show-toplevel
```

```bash
git status --short
```

```bash
git log --oneline -5
```

```bash
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "NO_UPSTREAM"
```

## Safety checks

**If on `main` (or `master`, `develop`, `next`):** refuse immediately.

> You are on `main`. Pushing directly to main is not allowed without explicit maintainer consent.

Stop here. Do not proceed.

**If on a feature branch:** Continue.

## Check upstream status

**If upstream exists:**

```bash
git log @{upstream}..HEAD --oneline
```

Show commits that will be pushed.

**If no upstream:**

Show all commits since divergence from the default branch:

```bash
git log main..HEAD --oneline 2>/dev/null || git log master..HEAD --oneline 2>/dev/null || git log --oneline -10
```

## Show push plan for approval

Present to the user:

```
Repo: <repo-name>
Branch: <branch-name>
Upstream: <upstream or "none (will create)">
Commits to push:
  - <commit1>
  - <commit2>
  ...

Command: git push -u origin <branch-name>
```

Wait for the user's approval before pushing.

**Exception:** If the user said "commit and push" (or similar) in the current session, the push is pre-approved. Skip the confirmation and execute directly.

## Execute push

```bash
git push -u origin <branch-name>
```

Always use `-u` to set upstream tracking. NEVER use `--force` or `--force-with-lease`.

Report success or failure.

## Do not

- Push to `main`/`master`/`develop` without double confirmation from the user
- Force-push under any circumstances
- Push without showing the plan first, unless explicitly instructed so by the user for the current session
- Delete any branches
