---
name: document
description: "End-to-end documentation orchestrator: chains all four inki phases (research, write, review, submit) for a single subject. Gates between each phase by default; --non-interactive chains without pauses and runs a review-fix loop. The simplest way to document a subject from scratch."
argument-hint: "[--non-interactive] [--fix-rounds <N>] <subject: keywords | Strapi PR (url/number) | Notion URL | Linear issue | PDF path | pasted text>"
user-invocable: true
---

# /inki:document: document a subject end to end

`/inki:document` is the one-shot entry point to the whole inki workflow. Given a subject to document, it runs the four families in order (**research → write → review → submit**), pausing for your approval between each phase so you stay in control. Pass `--non-interactive` to chain all four without stopping; in that mode the review phase also runs a fix loop (review → fix → re-review) until the draft is clean or `--fix-rounds` is reached.

It is a thin orchestrator: each phase is delegated to its existing top-level skill (`/inki:research`, `/inki:write`, `/inki:review`, `/inki:submit`). This skill adds no review logic of its own; it resolves the subject, sequences the phases, runs the fix loop, and manages the gates.

## Step 0: Parse arguments

If `$ARGUMENTS` contains `--help` or `-h`, print usage and stop, per `../../references/help.md`. Do not run the workflow.

Otherwise, from `$ARGUMENTS`, detect these flags anywhere in the list, then remove them:

- `--non-interactive` (canonical), aliases `--auto-approve`, `--auto`, `--yes`, `-y`, `--no-questions-asked` (all equivalent) → set `AUTO=true`. Chains all phases without pausing AND approves the review-fix loop in Step 4 (see below).
- `--fix-rounds <N>` → set `MAX_FIX_ROUNDS=<N>`. Caps how many review→fix iterations Step 4 runs. Defaults to `3` if not given.
- `--no-log`, `--log-dir <path>`, `--short-log` → logging flags, handled per `../../references/logging.md`.

What remains is the **subject**. If no subject remains, ask the user what they want to document and stop.

## Step 0b: Set up logging

Unless `--no-log` was passed, set up the run log by following `../../references/logging.md`: resolve the base directory, create the run directory `YYYY-MM-DD-<slug>` from `SUBJECT_LABEL` (resolved in Step 1), and write each phase's report into its subdirectory as that phase completes. If `--no-log` was passed, state once that nothing will be persisted. Logging is best-effort and never aborts the run.

## Step 1: Resolve the subject to a brief

Resolve the subject by following `../../references/subject-resolver.md`. It accepts keywords, a Strapi PR (URL, `owner/repo number`, a bare number, or prose naming a PR and repo), a Notion page URL, a Linear issue, a PDF (path or URL), a local text/markdown file, or pasted content.

The resolver returns:

- `BRIEF`: a normalized brief (title + summary + key facts/links) for the research and write phases.
- `SUBJECT_LABEL`: a short label for headers.
- `SOURCE_KIND`: the detected source type.
- `CLEANUP`: a command to run when the workflow finishes (temp-file removal); may be empty.

The resolver may stop the workflow before returning a brief, in which case relay its message and end:

- A bare PR number with no repo: the resolver asks which repo the PR belongs to. Stop until the user answers, then re-run.
- A `strapi/documentation` PR: that is a documentation PR, not a subject to document. The resolver tells the user to run `/inki:review <PR>` instead. Stop; do not continue into research.
- A PR on a repo that is not documented on docs.strapi.io (only `strapi/strapi` and `strapi/cloud` are): the resolver reports there is nothing to document. Stop.

If resolution otherwise fails (e.g. a Notion/Linear MCP is unavailable and no fallback content is provided), report why and stop.

## Step 2: Phase 1, Research

Invoke `/inki:research` on the subject (pass the brief's topic/keywords, or the original subject for PR/feature inputs).

**Gate on the result before continuing:**

- **If research concludes the subject is already documented** (an existing page covers it): **STOP.** Report the existing page path(s) from the research output and end the workflow. Do not chain into write. The user decides what to do next (they can run `/inki:review <path>` themselves to update the existing page). This stop happens even in `--non-interactive` mode: documenting a duplicate is never the intended outcome.
- **Otherwise:** the research output enriches the brief (gaps, related pages, routing). Carry the enriched brief forward.

**Phase gate (skipped when `AUTO=true`):** show the research summary and ask whether to proceed to writing. On no, stop.

## Step 3: Phase 2, Write

Invoke `/inki:write` with the enriched brief. In interactive mode `/inki:write` already gates on outline approval before drafting; let it. In `AUTO=true` mode, pass `--non-interactive` through so outline and draft are produced without an inner pause.

The output is a drafted page (and its outline file).

**Phase gate (skipped when `AUTO=true`):** show the draft path and ask whether to proceed to review. On no, stop (the draft is kept on disk for the user).

## Step 4: Phase 3, Review (with a fix loop)

This phase reviews the fresh draft and iteratively fixes it until it is clean or a round cap is hit. Because the draft was just generated by this same workflow (not pre-existing content a human is protecting), `/inki:document` is allowed to apply fixes here: that is the point of an end-to-end run.

**Behaviour depends on `AUTO`:**

- **`AUTO=true` (`--non-interactive`):** run the fix loop below without prompting. `--non-interactive` means "approve everything", which explicitly *includes* applying the review fixes.
- **`AUTO=false` (default):** first run a single read-only `/inki:review` and show the report. Then ask whether to (a) run the fix loop, (b) proceed to submit as-is, or (c) stop. Only run the loop on (a).

**The fix loop:**

```
round = 1
loop:
  run /inki:review --non-interactive --fix <draft>   # applies every fix it safely can this round
  re-read the resulting findings
  if no actionable findings remain  → break (clean)
  if round >= MAX_FIX_ROUNDS        → break (cap reached)
  round = round + 1
```

Each round applies **every actionable fix the reviewers can make**: not only style auto-fixes, but also code, coherence, and pitfalls findings that have a clear, unambiguous correction. Findings that are genuinely judgment calls (no single correct fix) are left as suggestions, never force-applied. After each round, re-review so a fix that introduced a new issue is caught.

`MAX_FIX_ROUNDS` defaults to `3` (override with `--fix-rounds <N>`). If the cap is reached with findings still open, do NOT loop further. Carry the remaining findings into the summary and (in interactive mode) tell the user; they decide whether to submit anyway or iterate manually.

Record `ROUNDS_RUN` and the final open-findings count for the summary.

**Phase gate (skipped when `AUTO=true`):** after the loop, show the final review state and ask whether to proceed to submit. On no, stop (the draft and the review report are kept).

## Step 5: Phase 4, Submit

Invoke `/inki:submit` to branch (if on `main`), commit, push, and open the PR. In `AUTO=true` mode, pass `--non-interactive` through.

`/inki:submit` retains its own safety behavior, which `--non-interactive` does NOT override. Concretely, even in auto mode:

- **Deployment-infrastructure paths are never touched in auto mode.** `.github/workflows/` and `docusaurus.config.js` always require explicit human confirmation; `/inki:document` never writes them and never auto-approves a commit that includes them. (`sidebars.js` is NOT in this set: adding a new page legitimately requires a navigation entry, so `--non-interactive` may edit it. It stays visible in the diff and in the draft PR for human review.)
- **Branch discipline holds.** Commits land on a properly prefixed feature branch (`cms/`, `cloud/`, `repo/`), never directly on `main` or `next`.
- **git-rules.md governs the PR.** The commit message and PR title/description follow `git-rules.md` (imperative title, flat "This PR…" description, no headings, no test plan).
- **The PR opens as a draft** for human review; auto mode does not merge it.

If the original subject was a Linear issue, mention the issue ID in the PR body via the brief, but do NOT write `Fixes <ID>`: Linear issues are not GitHub issues and that syntax would not close anything.

## Step 6: Cleanup

Run the `CLEANUP` command returned by the subject resolver, even if the workflow stopped early at a gate. If `CLEANUP` is empty, there is nothing to do.

## Step 7: Summary

End with a one-block summary:

```
Documented: <SUBJECT_LABEL>
- Research:  <already-documented at <path> | gaps found, proceeded>
- Write:     <draft path>
- Review:    <ROUNDS_RUN round(s); N issues fixed, M still open by severity>
- Submit:    <branch> · <commit SHA> · <PR URL>
- Log:       <run directory path, or "disabled (--no-log)">
```

If the fix loop hit `MAX_FIX_ROUNDS` with findings still open, say so explicitly here.

In a workflow stopped at a gate, show the summary up to the phase reached and state where it stopped.

## Rules

- This skill never duplicates phase logic. It only resolves the subject, sequences phases, runs the fix loop, gates, and summarizes. Each phase is run by **invoking its top-level skill** (`/inki:research`, `/inki:write`, `/inki:review`, `/inki:submit`), never by re-implementing that phase's steps inline. In particular, the submit phase MUST go through `/inki:submit` (which itself invokes `/inki:branch` / `/inki:commit` / `/inki:push` / `/inki:pr`); do NOT branch, commit, push, or open the PR with raw `git` / `gh` commands here, as that drops behavior the sub-skills own (e.g. the `/inki:pr` Vercel preview link). Read-only git/gh inspection is fine; mutating git/gh by hand in place of a phase skill is a defect.
- Default is **gated**: pause between every phase (research→write, write→review, review→submit). `--non-interactive` (canonical), aliases `--auto-approve`, `--auto`, `--yes`, `-y`, `--no-questions-asked` (all equivalent) removes the pauses but never the "already documented → stop" guard, the protected-path guard, or the branch discipline.
- `--non-interactive` approves the review fix loop too: it applies fixes, it does not just surface them. This is safe here only because the draft was generated within this same run. Outside `/inki:document` (e.g. a bare `/inki:review` on an existing human-authored page), fixes still require explicit `--fix`.
- The fix loop runs at most `MAX_FIX_ROUNDS` times (default 3, `--fix-rounds <N>` to change). It never loops unbounded; remaining findings are reported, not forced.
- If any phase fails, stop. Do not skip a phase.
- The submit phase's safety guards are not optional and `--non-interactive` does not lift them: protected paths stay untouched, commits stay on a prefixed feature branch (never `main`/`next`), the PR follows `git-rules.md` and opens as a draft. See Step 5 for the explicit list.

## Examples

Document a topic from keywords, gating between each phase:
```
/inki:document "MCP server configuration"
```

Document from a Notion spec, fully automatic up to the draft PR (review-fix loop runs up to 3 rounds):
```
/inki:document --non-interactive https://www.notion.so/strapi/Realtime-API-spec-abc123
```

Fully automatic, allowing up to 5 review-fix rounds for a tricky page:
```
/inki:document --non-interactive --fix-rounds 5 "Document Service API filters"
```

Document from a Linear issue:
```
/inki:document DOC-412
```

Document a code PR from strapi/strapi (CMS) or strapi/cloud (Cloud), any of these forms work:
```
/inki:document https://github.com/strapi/strapi/pull/26597
/inki:document strapi/cloud 1234
/inki:document PR 26597 from strapi/strapi
```

A bare PR number prompts for the repo first:
```
/inki:document 26597
```

A strapi/documentation PR is redirected to review (it is not a subject to document):
```
/inki:document https://github.com/strapi/documentation/pull/3234
→ "That is a documentation PR. Run /inki:review https://github.com/strapi/documentation/pull/3234 instead."
```

A PR on a repo not published to docs.strapi.io (e.g. strapi/design-system) stops with an explanation:
```
/inki:document https://github.com/strapi/design-system/pull/500
→ "strapi/design-system is not documented on docs.strapi.io (only strapi/strapi and strapi/cloud are), so there is no doc to write from this PR."
```

Document from a PDF RFC:
```
/inki:document ./specs/webhooks-rfc.pdf
```

Document from pasted notes (paste after the command):
```
/inki:document We need to document the new `transfer` CLI command:
it moves data between two Strapi instances over a token-authenticated
HTTP channel. Flags: --from, --to, --force...
```
