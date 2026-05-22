# Shared Commit Rules

These rules apply to all commits made on strapi/documentation.

## Gather context

Run these in parallel:

```bash
git status
```

```bash
git diff --stat HEAD
```

```bash
git diff --cached --stat
```

```bash
git log --oneline -10
```

```bash
git diff --name-only HEAD
```

If there are no changes (nothing staged, nothing modified), stop:
> Nothing to commit. Working tree is clean.

## Granular commits: One change per commit

Each commit must contain exactly one logical change. If you have multiple unrelated changes staged (e.g., a section rename, a style fix, and a new paragraph), split them into separate commits. Ask yourself: "Can I describe this commit in one short sentence without 'and'?" If not, split it.

When applying multiple fixes from a review, stash all changes and re-apply them one at a time, committing each separately.

## Validate or generate commit message

**If a commit message was provided**, validate it:

1. **Imperative mood**: Must start with an action verb (Add, Update, Fix, Document, Improve, Remove, Refactor, Rename, Clarify, Rework, Introduce, Allow, or similar). Reject if it starts with "Adding", "Updated", "Fixed", "This PR", etc.
2. **No prefix**: Reject if it starts with `feat:`, `chore:`, `fix:`, or any `word:` pattern.
3. **Length**: Must be <= 80 characters. If over, suggest a trimmed version.
4. **Specificity**: Flag if it is 2 words or fewer, or uses vague terms like "update stuff", "small changes", "tweak things".
5. **Capitalization**: First word must be capitalized.

If validation fails, show the issue and suggest a corrected version. Do not proceed until the user approves.

Optionally, a short "body" (2-3 sentences) explaining **why** the changes were made can be added.

**If no message provided**, generate one:
- Read the diff to understand what changed.
- Draft a message following all rules above.
- Be specific: name the area, file, or feature affected.

## Execute commit

Commit directly, no approval needed. The validation rules above are the safety net.

```bash
git add <file1> <file2> ... && git commit -m "<validated-message>"
```

Stage files individually by name. NEVER use `git add -A` or `git add .`.

After commit, confirm with `git log --oneline -1`.

## Good examples

- Add transfer tokens documentation page
- Update Content Manager filtering section with new operators
- Fix broken links in REST API population examples
- Add new skills: doc-commit, doc-push, doc-pr, autodoc, lunch-break, style-lint
- Remove deprecated Upload plugin configuration
- Improve sidebar width stability to reduce layout shift

## Anti-examples (rejected)

- `fix: small changes` -- banned prefix, vague
- `Updated the docs` -- past tense, vague
- `This PR updates docs` -- PR phrasing
- `tweak stuff` -- vague, not imperative
- `feat(upload): add docs` -- banned prefix
