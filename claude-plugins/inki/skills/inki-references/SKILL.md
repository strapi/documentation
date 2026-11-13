---
name: inki-references
description: "Shared Strapi docs references for the inki-* skills: page templates, authoring guides per docs area, style rules, reviewer and drafter prompts, git and PR rules, logging and help conventions. Load when another inki-* skill cites it, or when you need a doc template or an authoring rule."
user-invocable: false
---

# Inki references

This skill holds no workflow. It hosts the files that several `inki-*` skills share, so each file exists once. Other skills cite them as `../inki-references/references/<path>`, a path that resolves the same from the source folder and from every linked skills folder.

- `references/templates/`: page skeletons per doc type (feature, plugin, configuration, API, guide, breaking change, Cloud). Start with `templates/README.md`. Component rules (badges, tabs…) are in `templates/components/`.
- `references/authoring/`: `AGENTS.*.md` authoring guides, one per docs area (CMS features, plugins, API, configurations, guides, breaking changes, Cloud, snippets).
- `references/prompts/`: reviewer and drafter specifications (router, outliner, outline checker, UX analyzer, drafter, style checker, integrity checkers, known-pitfalls catalog). Start with `prompts/README.md`.
- `references/shared/`: commit, push, PR, PR title, and PR description rules used by `inki-commit`, `inki-push`, `inki-pr`, and `inki-pr-fix`.
- `references/12-rules-of-technical-writing.md`, `references/STYLE_GUIDE.pdf`: the writing rules. The repo-root `12-rules-of-technical-writing.md` is canonical; this copy is synced by CI.
- `references/git-rules.md`: branch, commit, and PR conventions. The repo-root `git-rules.md` is canonical; this copy is synced by CI.
- `references/logging.md`: how every `inki-*` skill writes its run log.
- `references/help.md`: how every `inki-*` skill answers `--help`.
- `references/subject-resolver.md`, `references/target-resolver.md`: how `inki-document` and `inki-review` turn their argument into a subject or a list of files.
