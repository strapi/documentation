# Shared PR Rules

These rules apply to all pull requests created on strapi/documentation.

## Gather context

Run in parallel:

```bash
git branch --show-current
```

```bash
git log main..HEAD --oneline 2>/dev/null || git log master..HEAD --oneline 2>/dev/null
```

```bash
git diff main...HEAD --stat 2>/dev/null || git diff master...HEAD --stat 2>/dev/null
```

```bash
git diff main...HEAD 2>/dev/null || git diff master...HEAD 2>/dev/null
```

```bash
git rev-parse --abbrev-ref @{upstream} 2>/dev/null || echo "NO_UPSTREAM"
```

**If on `main`/`master`:** Refuse. A PR requires a feature branch.

**If no upstream:** The branch has not been pushed yet. Push first, then continue.

## Analyze changes

Read the full diff and all commit messages to understand:
- What was added, changed, or removed
- Which files/areas are affected
- The purpose of the changes

## Generate PR title

Apply the rules in `_shared/pr-title-rules.md`. The same rules are used by `/inki:pr-title-fix` (rewrite mode), so a title produced here will pass the rewrite skill's check.

## Generate PR description

Apply the rules in `_shared/pr-description-rules.md`. The same rules are used by `/inki:pr-description-fix` (rewrite mode). Repos with stricter requirements (e.g., strapi/documentation) layer extra rules on top inside their own SKILL.md.

## Show PR plan for approval

Present to the user:

```
Repo: <repo-name>
Branch: <branch-name> --> main
Commits: <count>
Files changed: <count>

Title: <generated-title>

Description:
<generated-description>

Command: gh pr create --title "..." --body "..."
```

Wait for the user's approval. If the user edits title or description, re-validate.

## Create PR

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
<description>
EOF
)"
```

After creation, show the PR URL.

## Do not

- Create a PR from `main`
- Use feat:/chore:/fix: in the title
- Start the description with anything other than "This PR ..."
- Create a PR without showing the plan first
- Force-push or rewrite history
