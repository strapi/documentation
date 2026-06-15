<!-- GENERATED FILE — do not edit by hand.
     Source: each skills/<name>/SKILL.md frontmatter. Regenerate with scripts/gen-commands.sh. -->

# Inki command reference

Every Inki skill is invoked as `/inki:<skill>`. This page lists each command, what it does, and its argument signature. For the shared flags (`--auto-approve`, `--no-log`, `--short-log`, `--log-dir`), see the "Common flags" section of the [README](./README.md). Typing `/inki:<skill> --help` also prints a command's usage.

## Document — the full chain in one command

### `/inki:document`

End-to-end documentation orchestrator: chains all four inki phases (research, write, review, submit) for a single subject. Gates between each phase by default; --auto-approve chains without pauses and runs a review-fix loop. The simplest way to document a subject from scratch.

```
/inki:document [--auto-approve] [--fix-rounds <N>] <subject: keywords | Notion URL | Linear issue | PDF path | pasted text>
```

## Research — figure out where the doc goes

### `/inki:research`

Top-level research orchestrator: combines exists, route, and coverage to give a complete picture before writing.

```
/inki:research <topic, feature name, or strapi/strapi PR>
```

### `/inki:exists`

Check whether a documentation topic is already covered on strapi/documentation: searches llms.txt, doc files, sidebars, and open GitHub PRs.

```
/inki:exists <topic or keyword>
```

### `/inki:route`

Given a strapi/strapi PR, identify which documentation pages and sections must be updated to cover the change.

```
/inki:route <strapi/strapi PR number or URL>
```

### `/inki:coverage`

Audit the documentation coverage of a Strapi feature or module: list what is documented vs missing.

```
/inki:coverage <feature or module name>
```

## Write — produce new content

### `/inki:write`

Top-level write orchestrator: outline a new page, get user approval, then draft from the outline.

```
/inki:write [--auto-approve] <topic brief or path to a brief file>
```

### `/inki:outline`

Generate an outline for a new documentation page from a topic brief and the appropriate template.

```
/inki:outline [--auto-approve] <topic brief or path to a brief file>
```

### `/inki:draft`

Draft a documentation page from an approved outline, the matching template, and the relevant authoring guide.

```
/inki:draft <path to outline file>
```

## Review — check what you wrote

### `/inki:review`

Top-level review orchestrator: runs style-check, outline-check, outline-ux-analyzer, code-verify, coherence-check, and pitfalls-check on a file, directory, or PR.

```
/inki:review [--auto-approve] [--fix] [--no-log] <path | filename | PR# | PR URL | docs.strapi.io URL | pasted content>
```

### `/inki:style-check`

Run deterministic style checks on a documentation file or directory, then layer AI judgment on top using the migrated style-checker prompt.

```
/inki:style-check <file or directory path>
```

### `/inki:outline-check`

Check the structural outline of a documentation page: heading hierarchy, section order, completeness against the template.

```
/inki:outline-check <file path>
```

### `/inki:outline-ux-analyzer`

Analyze the pedagogical UX of a documentation outline: progression from beginner to advanced, signposting, and reading flow.

```
/inki:outline-ux-analyzer <file path>
```

### `/inki:code-verify`

Verify code blocks in a documentation file: check syntax, references, and consistency with the underlying Strapi APIs.

```
/inki:code-verify <file path>
```

### `/inki:coherence-check`

Check a documentation file for cross-page coherence: terminology, links, and consistency with related pages.

```
/inki:coherence-check <file path>
```

### `/inki:pitfalls-check`

Audit a documentation file against the known-pitfalls list: common mistakes, outdated patterns, deprecated APIs.

```
/inki:pitfalls-check <file path>
```

### `/inki:pitfalls-add`

Add a new entry to the known-pitfalls catalog that pitfalls-check audits against. Verifies the correct pattern against the Strapi source before adding, and confirms with the user. Use when you have found a documentation mistake worth catching automatically in future reviews.

```
/inki:pitfalls-add [--auto-approve] <description of the pitfall, or a pitfalls-check / code-verify finding to promote>
```

## Submit — get it to GitHub

### `/inki:submit`

Top-level orchestrator: branch (if needed), commit, push, then open a PR. Each step asks for confirmation before continuing, unless --auto-approve is passed.

```
/inki:submit [--auto-approve] [issue reference or topic hint, e.g. 'Fixes #2143']
```

### `/inki:branch`

Create a new branch in strapi/documentation with auto-detected prefix (cms/, cloud/, repo/) based on the files that will be touched.

```
/inki:branch [description of the work]
```

### `/inki:commit`

Stage and commit documentation changes in strapi/documentation. Enforces git-rules.md, protected paths, and branch prefix detection.

```
/inki:commit [optional commit message]
```

### `/inki:push`

Push the current branch in strapi/documentation to origin. Validates branch name against git-rules.md conventions.

```
/inki:push (no arguments)
```

### `/inki:pr`

Create a pull request on strapi/documentation following git-rules.md. Strict flat-text description, no headings, no test plan.

```
/inki:pr [optional issue reference, e.g. 'Fixes #2143']
```

### `/inki:pr-fix`

Rewrite the title or description/body of one or more open PRs on strapi/documentation to match git-rules.md. Strict one-by-one confirmation, or auto-edit with --auto-approve.

```
/inki:pr-fix <title|description|body> [--auto-approve] [--include-old] [PR# or URL] [PR# or URL] ...
```

