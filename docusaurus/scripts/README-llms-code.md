# llms-code: generator and validator

This tooling extracts code examples from docs and emits a single consumable file for LLMs, plus an optional validation pass to catch structural issues early.

## What it generates

- `static/llms-code.txt` with blocks grouped by page and section:
  - `## Section`
  - `Description: ...` (optional)
  - `(Source: https://docs.strapi.io/...#anchor)` when `--anchors` is set
  - For each variant: `Language: ...`, `File path: ...` (or `N/A`), fenced code, `---` divider between variants
- In verbose runs a skip log is written to `static/llms-code-skip.log` listing pages with no code snippets.

## npm/yarn scripts

Run from `docusaurus/`:

- `yarn llms:generate-and-validate`
  - Generate for all docs and validate (quiet output; no file existence checks)

- `yarn llms:generate-verbose`
  - Generate with `--verbose`; prints each skipped page and writes `static/llms-code-skip.log`

- `yarn llms:generate-and-validate:verbose`
  - Verbose generate (writes skip log) then validate (quiet)

- `yarn validate:llms-code`
  - Validate an existing `static/llms-code.txt` (quiet; no file existence checks)

- `yarn validate:llms-code:strict`
  - Validate with file existence checks (use only if paths point to a real project), plus anchor verification

## Generator flags (`scripts/generate-llms-code.js`)

- `--all` Scan all docs (restricted to `cms/` and `cloud/` trees)
- `--include a,b` / `--exclude x,y` Filter discovered doc IDs by substring
- `--anchors` Include section anchors in Source lines
- `--line-numbers` Emit `Lines: start-end` for each variant
- `--verbose` Print per-file skip messages; auto-writes `static/llms-code-skip.log`
- `--log-file path` Custom path for the skip log
- `--output path` Destination for generated text (use `-` for stdout)

Notes:
- Discovery intentionally excludes `snippets/` and other non-doc trees.
- When file path cannot be inferred it is emitted as `N/A`.

## Validator flags (`scripts/validate-llms-code.js`)

- `--path path` Input file (use `/dev/stdin` to validate from a pipe)
- `--strict` Exit with non-zero on any errors (warnings do not fail)
- `--verify-anchors` Check that section anchors exist in the source doc
- `--check-files` Check referenced files exist (use with `--project-root ..` when appropriate)
- `--project-root dir` Base path for file checks and anchor lookups
- `--report json|text` Output diagnostics as JSON or text (default)

Heuristics and niceties:
- Language aliases normalized (e.g., `js` ≡ `JavaScript`, `ts` ≡ `TypeScript`, `sh` treated as `Bash`, `graphql`, `html`, `dotenv`, `text` recognized)
- Fence-first blocks (without a `Language:` line) are accepted by inferring language from the fence
- Section Description and Source are optional and do not fail validation
- File path line may be `File path:` or legacy `File:`; missing is treated as `N/A`

## Examples

- Generate + validate (quiet):
```
yarn llms:generate-and-validate
```

- Verbose generate + validate, with skip log:
```
yarn llms:generate-and-validate:verbose
```

- Validate a streamed output without writing a file:
```
node scripts/generate-llms-code.js --anchors --all --output - \
  | node scripts/validate-llms-code.js --path /dev/stdin --strict --verify-anchors --project-root ..
```

