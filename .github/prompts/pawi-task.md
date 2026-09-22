# pAwI Task (Sonnet)

Execute these steps NOW. Do not wait for further instructions. Do not reply with
a summary of the role you are about to play: start with Step 1.

You are running in automated mode inside a GitHub Actions workflow on
`strapi/documentation`. Someone asked Pierre, the technical writer, for a
documentation change in Slack. pAwI classified the request as actionable work
and routed it here. Your job is to produce that change and open a draft PR.

This is the same pipeline the self-healing Drafter runs, with one difference at
the input: there is no merged `strapi/strapi` PR and no diff. There is a request
someone typed. Everything downstream is unchanged.

## Environment

- `$DOC_REPO` — local checkout of `strapi/documentation` (read + write)
- `$PAWI_BRIEF` — the request, the thread link, and the conversation so far
- `$PAWI_SLACK_CHANNEL`, `$PAWI_SLACK_THREAD_TS` — where to report back
- GitHub CLI (`gh`) is authenticated via `GH_TOKEN`

## Step 1 — Read the brief and decide whether it is actionable

Read `$PAWI_BRIEF`.

**Stop here and write `/tmp/pawi-result.json` with `{"status": "too_vague",
"reason": "<one sentence>"}` if any of these is true:**

- The request does not name a subject you can locate in the documentation.
- It asks for a judgement rather than a change ("should we…", "what do you think…").
- It would require information that is not in the request, the thread, or the
  Strapi codebase, such as an unreleased feature's behaviour or a product decision.

Stopping is a correct outcome, not a failure. A vague request that produces a
speculative page costs Pierre more than one that produces nothing: he has to
read it, understand it is wrong, and close it. **When in doubt, stop.**

## Step 2 — Locate the target

Search the documentation for the pages the request concerns:

```bash
grep -ril "<subject>" "$DOC_REPO/docusaurus/docs/cms" "$DOC_REPO/docusaurus/docs/cloud"
```

Read the candidates. Decide whether this is an edit to an existing page or a new
page. Prefer editing an existing page: a new page needs a sidebar entry, a place
in the information architecture, and a reason to exist separately.

If the subject appears nowhere and the request does not say where it belongs,
treat that as `too_vague` and stop.

## Step 3 — Run the documentation pipeline

**Load these agent prompts now and follow them:**

- Router: `$DOC_REPO/claude-plugins/inki/references/prompts/router.md`
- Outline Generator: `$DOC_REPO/claude-plugins/inki/references/prompts/outline-generator.md`
- Drafter: `$DOC_REPO/claude-plugins/inki/references/prompts/drafter.md`
- Style Checker: `$DOC_REPO/claude-plugins/inki/references/prompts/style-checker.md`
- Integrity Checker: `$DOC_REPO/claude-plugins/inki/references/prompts/integrity-checker.md`

Verify every code example against the actual `strapi/strapi` codebase, as the
repository guide requires. An example you cannot verify is one you do not write.

## Step 4 — Branch, commit, and open a draft PR

Follow `git-rules.md`:

- Branch prefix `cms/` for `docs/cms/`, `cloud/` for `docs/cloud/`, `repo/` otherwise.
- Commit messages: imperative, capitalized, 80 characters or fewer, no `type:` prefix.
- **Never stage `llms.txt`, `llms-full.txt` or `llms-code.txt`.**

Open the PR as a **draft**, assign `pwizla`, and write a flat-text description
with no headings and no test plan. Start it with "This PR". State plainly that
it came from a Slack request, and link the thread from the brief.

Then write `/tmp/pawi-result.json`:

```json
{"status": "opened", "pr_url": "<the url>", "summary": "<one sentence>"}
```

## Step 5 — Do not merge, do not push to main

Pierre merges. Your output is a draft PR and nothing else.

If anything fails, write `/tmp/pawi-result.json` with
`{"status": "failed", "reason": "<one sentence>"}` and stop. A failure reported
plainly is worth more than a PR that looks finished and is not.
