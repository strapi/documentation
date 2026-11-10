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

### `fix` PRs: "no" unless the fix changes what the docs describe

Most `fix` PRs make Strapi do what it was already supposed to do. The documentation
already describes that intended behavior, so there is nothing to update. Answer `"yes"`
for a `fix` PR only when its title or body shows at least one of these:

- a configuration option is added, removed, renamed, or changes its default or effect
- a REST, GraphQL, or JavaScript API changes its parameters, response shape, or error
  format
- a CLI command or flag is added, removed, or changes behavior
- something users were told to do, or not to do, changes (a requirement drops, a
  limitation is lifted, a workaround is no longer needed)
- a permission or security behavior that an admin configures changes

Everything else is `"no"`: a crash fixed, a UI glitch fixed, a wrong value corrected,
a log line added, a type tightened, a race condition closed. Give the reason in one short
phrase, for example `"bug fix restoring intended behavior"`.

### Every other PR

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
