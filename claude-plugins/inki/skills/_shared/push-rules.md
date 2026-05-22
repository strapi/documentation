# Shared Push Rules

These rules apply to ALL pushes Pierre makes, in any repo.

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

**If on `main` (or `master`, `develop`):**

Check which repo you are in:
- **PAWS (`ai-work-system`):** Pushing to `main` is the default. Continue normally.
- **All other repos:** Refuse immediately.

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

Present to Pierre:

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

**Autonomy Tier: 2** -- wait for Pierre's approval before pushing.

**Exception:** If Pierre said "commit and push" (or similar) in the current session, the push is pre-approved. Skip the confirmation and execute directly.

## Execute push

```bash
git push -u origin <branch-name>
```

Always use `-u` to set upstream tracking. NEVER use `--force` or `--force-with-lease`.

Report success or failure.

## Do not

- Push to `main`/`master`/`develop` without double confirmation from Pierre
- Force-push under any circumstances
- Push without showing the plan first, unless explicitly instructed so by Pierre for the current session
- Delete any branches
