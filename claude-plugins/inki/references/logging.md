# Logging

Shared logic for writing inki run reports to the user's machine, so any run can be reviewed later by the user or a teammate. Skills that produce a report or modify files reference this file instead of duplicating the rules.

Logging is **on by default**, and **verbose by default** (full detail, including each reviewer agent's raw report). It never writes inside the repository being worked on. All log files are **Markdown** (`.md`) so they are easy to read and diff.

## Flags (parsed by the calling skill)

- `--no-log` → disable logging entirely for this run.
- `--log-dir <path>` → write logs under `<path>` instead of the default base.
- `--short-log` → write only the consolidated per-phase reports, omitting the verbose per-agent raw reports. (Logging is verbose by default; `--short-log` trims it to a shorter, consolidated form.)

## Base directory

Resolve the log base directory in this order (first that is set wins):

1. The `--log-dir <path>` flag, if passed.
2. The `INKI_LOG_DIR` environment variable, if set.
3. Default: `~/.inki/logs/`.

Never write logs inside the working repository. If the resolved base path is inside the current git repo, warn and fall back to the default `~/.inki/logs/` instead, so logs are never accidentally committed.

As a belt-and-suspenders measure, `.inki/` is listed in `strapi/documentation`'s `.gitignore`, so that even if a user deliberately points `--log-dir` at a local `.inki/` folder inside the repo, the logs are never staged. (In normal use the default `~/.inki/logs/` is in the home directory and outside any repo.)

Create the base directory if it does not exist.

## Run directory

Each run gets one directory named `YYYY-MM-DD-<slug>`:

- `YYYY-MM-DD` — today's date.
- `<slug>` — a short kebab-case label for what the run is about:
  - For `/inki:document`: derived from the subject (`SUBJECT_LABEL` → a few words, e.g. `mcp-server-config`).
  - For a standalone `/inki:review`: derived from the target (`SCOPE`) — the bare filename without extension (`strapi-mcp-server`), or `pr-<num>` for a PR, or `pasted` for pasted content.
  - For other standalone skills: the most descriptive token available (topic, filename, or PR).

If a run directory of the same name already exists (a second run on the same subject the same day), append a short numeric suffix: `-2`, `-3`, …

Under the run directory, create one subdirectory **per skill phase** that produced output:

```
~/.inki/logs/2026-06-15-mcp-server-config/
├── research/
│   └── report.md
├── write/
│   └── report.md            # notes the draft + outline paths produced
├── review/
│   ├── round-1.md           # consolidated review report for round 1
│   ├── round-2.md           # subsequent fix-loop rounds, if any
│   └── agents/              # default (verbose); omitted with --short-log: one file per agent per round
│       ├── round-1-code-verifier.md
│       └── ...
└── submit/
    └── report.md            # branch, commit SHA, PR URL
```

All files above are Markdown (`.md`). A standalone skill (run outside `/inki:document`) writes only its own subdirectory under the run directory.

## What each report contains

- **research/report.md** — the research summary: existing coverage found, gaps, routing, and the recommended next step.
- **write/report.md** — the brief used, the chosen template, and the paths of the outline and draft produced.
- **review/round-N.md** — the consolidated review table (per-check issue counts + severity), the issues by file, and, for fix-loop rounds, what was fixed in that round.
- **review/agents/round-N-<agent>.md** — (verbose default; omitted with `--short-log`) each reviewer agent's full raw report for that round.
- **submit/report.md** — branch name, commit SHA(s), and the PR URL.

Each report is plain Markdown with a short YAML frontmatter for later querying:

```yaml
---
inki_skill: document | research | write | review | submit | pr-fix
date: YYYY-MM-DD
subject: <SUBJECT_LABEL or SCOPE>
---
```

## Behaviour

- Write reports as the corresponding phase completes, not all at the end, so a run that stops early still leaves a partial log.
- Logging is best-effort: if a write fails (permissions, disk), warn once and continue the run — never abort the actual work because logging failed.
- When logging is disabled (`--no-log`), state it once at the start so the user knows nothing is being persisted.
- At the end of a run, print the run directory path so the user knows where to look.
