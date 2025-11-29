# AGENTS.md (Repository-wide Agent Guide)

Scope and precedence
- This file applies to the entire repository.
- Subdirectory AGENTS.md files may add/override rules for their scope.

Execution policy and invariants
- Stack: prefer JavaScript/Node; do not introduce new languages without approval.
- Do not modify `llms-full.txt` generation.
- Claude links must use `q` on `/new`; ChatGPT uses its reviewed param; keep locale logic.
- Enable anchors and file checks by default for code extraction.

Key scripts and how to run
- `docusaurus/scripts/generate-llms.js` → generates `llms.txt` (uses <Tldr> when present).
- `docusaurus/scripts/generate-llms-code.js --anchors --check-files` → generates `llms-code.txt` with section anchors and file existence status.
- `docusaurus/scripts/validate-prompts.js` → validates prompt placeholders/structure.

File map (important paths)
- AI toolbar: `docusaurus/src/components/AiToolbar/openLLM.js`, `.../config/aiToolsConfig.js`, `.../config/aiPromptTemplates.js`.
- Generators/validators: `docusaurus/scripts/generate-llms-code.js`, `docusaurus/scripts/generate-llms.js`, `docusaurus/scripts/validate-prompts.js`.

Output and communication expectations
- When asked, paste changed files or first 300 lines of generated artifacts.
- Use bullet lists for unordered information; numbers for sequences.
- Reference files with repo‑relative clickable paths.

PR and branch workflow
- Branch naming: `repo/agents-md-first-version` (this change) and `chore/*` for similar tasks.
- Always run the generators/validators before requesting review.

Security and tokens
- Never commit secrets. Use `GITHUB_TOKEN` env var if needed; least privilege; rotate/revoke after use.

Links
- Contributing guide: CONTRIBUTING.md
- Style guide (PDF): STYLE_GUIDE.pdf
- 12 Rules of Technical Writing: 12-rules-of-technical-writing.md (canonical)
- External reference: https://strapi.notion.site/12-Rules-of-Technical-Writing-c75e080e6b19432287b3dd61c2c9fa04
