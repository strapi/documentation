# Self-Healing Triage

Execute these steps NOW. Do not wait for further instructions.

## Step 1 — Read PRs

Run this command to get the PR list:
```bash
echo "$FILTERED_PRS"
```

## Step 2 — For each PR, read its body

For each PR number from Step 1, read `/tmp/pr-<NUMBER>-body.txt`.

## Step 3 — Decide and write results

For each PR, based ONLY on its title and body, decide:
- `"yes"` — changes user-facing behavior, APIs, configuration, features, or CLI commands
- `"no"` — clearly internal: refactors, race condition fixes, internal optimizations, test infrastructure, build tooling, admin UI polish with no behavior change, code style changes

When in doubt, say `"yes"`. False negatives are worse than false positives.

Then write the result using Bash (do NOT use the Write tool):
```bash
cat <<'EOF' > /tmp/triage-results.json
{
  "prs": [
    {"number": NUMBER, "title": "TITLE", "triage": "yes_or_no", "reason": "only if no"}
  ]
}
EOF
```

## Rules

- **Write files using Bash only.** The Write tool will be denied.
- **Do NOT read diffs, sidebars.js, llms.txt, or any agent prompts.**
- **Do NOT create branches, commits, or PRs.**
- **Do NOT explain what you're doing. Just do it.**
