# Inki command reference

Every Inki skill is invoked as `/inki:<skill>`. This page lists each command, what it does, its argument signature, and every flag it accepts. Typing `/inki:<skill> --help` prints a single command's usage. The shared flags are also summarized in the "Common flags" section of the [README](./README.md).

> This file is not auto-generated; it is curated. Whoever adds or changes a command (or its flags) — a human editor or an AI agent — should update its entry here so the description, argument signature, and flag table stay in sync with the skill's frontmatter and its argument-parsing step. The command set changes rarely once stable.

## Document — the full chain in one command

### `/inki:document`

End-to-end documentation orchestrator: chains all four inki phases (research, write, review, submit) for a single subject. Gates between each phase by default; --auto-approve chains without pauses and runs a review-fix loop. The simplest way to document a subject from scratch.

```
/inki:document [--auto-approve] [--fix-rounds <N>] <subject: keywords | Notion URL | Linear issue | PDF path | pasted text>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Chain all phases without pausing, and approve the review-fix loop. Aliases: `--auto`, `--yes`, `-y`. |
| `--fix-rounds <N>` | Cap the review→fix→re-review iterations. Default 3. |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |

## Research — figure out where the doc goes

### `/inki:research`

Top-level research orchestrator: combines exists, route, and coverage to give a complete picture before writing.

```
/inki:research [--no-log] <topic, feature name, or strapi/strapi PR>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:exists`

Check whether a documentation topic is already covered on strapi/documentation: searches llms.txt, doc files, sidebars, and open GitHub PRs.

```
/inki:exists [--no-log] <topic or keyword>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:route`

Given a strapi/strapi PR, identify which documentation pages and sections must be updated to cover the change.

```
/inki:route [--no-log] <strapi/strapi PR number or URL>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:coverage`

Audit the documentation coverage of a Strapi feature or module: list what is documented vs missing.

```
/inki:coverage [--no-log] <feature or module name>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

## Write — produce new content

### `/inki:write`

Top-level write orchestrator: outline a new page, get user approval, then draft from the outline.

```
/inki:write [--auto-approve] [--no-log] <topic brief or path to a brief file>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Generate the outline and draft without pausing at the outline approval gate. Aliases: `--auto`, `--yes`, `-y`. |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |

### `/inki:outline`

Generate an outline for a new documentation page from a topic brief and the appropriate template.

```
/inki:outline [--auto-approve] [--no-log] <topic brief or path to a brief file>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Skip the approval gate and save the outline to the default path. Aliases: `--auto`, `--yes`, `-y`. |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |

### `/inki:draft`

Draft a documentation page from an approved outline, the matching template, and the relevant authoring guide.

```
/inki:draft [--no-log] <path to outline file>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

## Review — check what you wrote

### `/inki:review`

Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on a file, directory, or PR.

```
/inki:review [--auto-approve] [--fix] [--no-log] <path | filename | PR# | PR URL | docs.strapi.io URL | pasted content>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Non-interactive: skip confirmation gates inside the sub-skills. Aliases: `--auto`, `--yes`, `-y`. |
| `--fix` | Apply the auto-fixable findings from `style-check` (others stay suggestions). |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |

### `/inki:style-check`

Run deterministic style checks on a documentation file or directory, then layer AI judgment on top using the migrated style-checker prompt.

```
/inki:style-check [--fix] [--no-log] <file or directory path>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--fix` | Apply non-controversial fixes (typos, formatting); leave the rest as suggestions. |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:outline-check`

Check the structural outline of a documentation page: heading hierarchy, section order, completeness against the template.

```
/inki:outline-check [--no-log] <file path>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:outline-ux-analyzer`

Analyze the pedagogical UX of a documentation outline: progression from beginner to advanced, signposting, and reading flow.

```
/inki:outline-ux-analyzer [--no-log] <file path>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:code-verify`

Verify code blocks in a documentation file: check syntax, references, and consistency with the underlying Strapi APIs.

```
/inki:code-verify [--no-log] <file path>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:coherence-check`

Check a documentation file for cross-page coherence: terminology, links, and consistency with related pages.

```
/inki:coherence-check [--no-log] <file path>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:pitfalls-check`

Audit a documentation file against the known-pitfalls list: common mistakes, outdated patterns, deprecated APIs.

```
/inki:pitfalls-check [--no-log] <file path>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |

### `/inki:pitfalls-add`

Add a new entry to the known-pitfalls catalog that pitfalls-check audits against. Verifies the correct pattern against the Strapi source before adding, and confirms with the user. Use when you have found a documentation mistake worth catching automatically in future reviews.

```
/inki:pitfalls-add [--auto-approve] [--no-log] <description of the pitfall, or a pitfalls-check / code-verify finding to promote>
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Skip the confirmation prompt (the source verification still runs as the safety gate). Aliases: `--auto`, `--yes`, `-y`. |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |

## Submit — get it to GitHub

### `/inki:submit`

Top-level orchestrator: branch (if needed), commit, push, then open a PR. Each step asks for confirmation before continuing, unless --auto-approve is passed.

```
/inki:submit [--auto-approve] [--no-log] [issue reference or topic hint, e.g. 'Fixes #2143']
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Run branch + commit + push + PR without per-step prompts (informed decisions are still surfaced). Aliases: `--auto`, `--yes`, `-y`. |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |

### `/inki:branch`

Create a new branch in strapi/documentation with auto-detected prefix (cms/, cloud/, repo/) based on the files that will be touched.

```
/inki:branch [description of the work]
```

### `/inki:commit`

Stage and commit documentation changes in strapi/documentation. Enforces [git-rules.md](./references/git-rules.md), protected paths, and branch prefix detection.

```
/inki:commit [optional commit message]
```

### `/inki:push`

Push the current branch in strapi/documentation to origin. Validates branch name against [git-rules.md](./references/git-rules.md) conventions.

```
/inki:push
```

### `/inki:pr`

Create a pull request on strapi/documentation following [git-rules.md](./references/git-rules.md). Strict flat-text description, no headings, no test plan.

```
/inki:pr [optional issue reference, e.g. 'Fixes #2143']
```

### `/inki:pr-fix`

Rewrite the title or description/body of one or more open PRs on strapi/documentation to match [git-rules.md](./references/git-rules.md). Strict one-by-one confirmation, or auto-edit with --auto-approve.

```
/inki:pr-fix <title|description|body> [--auto-approve] [--include-old] [--no-log] [PR# or URL] [PR# or URL] ...
```

The command accepts the following flags:

| Flag | Description |
|------|-------------|
| `--auto-approve` | Edit without per-PR confirmation (a batch-review gate still applies when no PR IDs are given). Aliases: `--auto`, `--yes`, `-y`. |
| `--include-old` | When no PR IDs are given, include open PRs older than 30 days (excluded by default). |
| `--no-log` | Disable run logging for this run. |
| `--log-dir <path>` | Write logs under `<path>` instead of the default `~/.inki/logs/`. |
| `--short-log` | Trim logs to the consolidated per-phase reports (omit per-agent raw reports). |
| `--help`, `-h` | Print usage and stop. |
