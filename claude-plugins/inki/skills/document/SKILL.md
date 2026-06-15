---
name: document
description: "End-to-end documentation orchestrator: chains all four inki phases (research, write, review, submit) for a single subject. Gates between each phase by default; --auto-approve chains without pauses. The simplest way to document a subject from scratch."
argument-hint: "[--auto-approve] <subject: keywords | Notion URL | Linear issue | PDF path | pasted text>"
user-invocable: true
---

# /inki:document — document a subject end to end

`/inki:document` is the one-shot entry point to the whole inki workflow. Given a subject to document, it runs the four families in order — **research → write → review → submit** — pausing for your approval between each phase so you stay in control. Pass `--auto-approve` to chain all four without stopping.

It is a thin orchestrator: each phase is delegated to its existing top-level skill (`/inki:research`, `/inki:write`, `/inki:review`, `/inki:submit`). This skill adds no review logic of its own; it resolves the subject, sequences the phases, and manages the gates.

## Step 0: Parse arguments

From `$ARGUMENTS`, detect the auto-approve flag anywhere in the list: `--auto-approve` (canonical), or its aliases `--auto`, `--yes`, `-y` (all equivalent). If present, set `AUTO=true` and remove the flag. What remains is the **subject**.

If no subject remains, ask the user what they want to document and stop.

## Step 1: Resolve the subject to a brief

Resolve the subject by following `../../references/subject-resolver.md`. It accepts keywords, a Notion page URL, a Linear issue, a PDF (path or URL), a local text/markdown file, or pasted content.

The resolver returns:

- `BRIEF` — a normalized brief (title + summary + key facts/links) for the research and write phases.
- `SUBJECT_LABEL` — a short label for headers.
- `SOURCE_KIND` — the detected source type.
- `CLEANUP` — a command to run when the workflow finishes (temp-file removal); may be empty.

If resolution fails (e.g. a Notion/Linear MCP is unavailable and no fallback content is provided), report why and stop.

## Step 2: Phase 1 — Research

Invoke `/inki:research` on the subject (pass the brief's topic/keywords, or the original subject for PR/feature inputs).

**Gate on the result before continuing:**

- **If research concludes the subject is already documented** (an existing page covers it): **STOP.** Report the existing page path(s) from the research output and end the workflow. Do not chain into write. The user decides what to do next (they can run `/inki:review <path>` themselves to update the existing page). This stop happens even in `--auto-approve` mode — documenting a duplicate is never the intended outcome.
- **Otherwise:** the research output enriches the brief (gaps, related pages, routing). Carry the enriched brief forward.

**Phase gate (skipped when `AUTO=true`):** show the research summary and ask whether to proceed to writing. On no, stop.

## Step 3: Phase 2 — Write

Invoke `/inki:write` with the enriched brief. In interactive mode `/inki:write` already gates on outline approval before drafting; let it. In `AUTO=true` mode, pass `--auto-approve` through so outline and draft are produced without an inner pause.

The output is a drafted page (and its outline file).

**Phase gate (skipped when `AUTO=true`):** show the draft path and ask whether to proceed to review. On no, stop (the draft is kept on disk for the user).

## Step 4: Phase 3 — Review

Invoke `/inki:review` on the drafted page (the local path produced by Step 3). In `AUTO=true` mode, pass `--auto-approve` so the review runs non-interactively.

Surface the review report. Fixes are NOT applied automatically unless the user (or `--auto-approve` plus an explicit `--fix` intent) asks for it — `/inki:document` does not pass `--fix` on its own, to avoid silently rewriting a fresh draft.

**Phase gate (skipped when `AUTO=true`):** show the review summary and ask whether to proceed to submit. On no, stop (the draft and the review report are kept).

## Step 5: Phase 4 — Submit

Invoke `/inki:submit` to branch (if on `main`), commit, push, and open the PR. In `AUTO=true` mode, pass `--auto-approve` through.

`/inki:submit` retains its own safety behavior (branch prefix detection, push confirmation logic). If the original subject was a Linear issue, mention the issue ID in the PR body via the brief, but do NOT write `Fixes <ID>` — Linear issues are not GitHub issues and that syntax would not close anything.

## Step 6: Cleanup

Run the `CLEANUP` command returned by the subject resolver, even if the workflow stopped early at a gate. If `CLEANUP` is empty, there is nothing to do.

## Step 7: Summary

End with a one-block summary:

```
Documented: <SUBJECT_LABEL>
- Research:  <already-documented at <path> | gaps found, proceeded>
- Write:     <draft path>
- Review:    <N issues, by severity>
- Submit:    <branch> · <commit SHA> · <PR URL>
```

In a workflow stopped at a gate, show the summary up to the phase reached and state where it stopped.

## Rules

- This skill never duplicates phase logic. It only resolves the subject, sequences phases, gates, and summarizes.
- Default is **gated**: pause between every phase (research→write, write→review, review→submit). `--auto-approve` (aliases `--auto`, `--yes`, `-y`) removes the pauses but never the "already documented → stop" guard.
- If any phase fails, stop. Do not skip a phase.
- Never pass `--fix` to `/inki:review` automatically. Reviewing a fresh draft should surface issues, not silently rewrite it.
- Respect every downstream safety rule: `/inki:submit`'s push/PR behavior is unchanged; protected paths and git-rules.md still apply.

## Examples

Document a topic from keywords, gating between each phase:
```
/inki:document "MCP server configuration"
```

Document from a Notion spec, fully automatic up to the draft PR:
```
/inki:document --auto-approve https://www.notion.so/strapi/Realtime-API-spec-abc123
```

Document from a Linear issue:
```
/inki:document DOC-412
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
