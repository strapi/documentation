# --help handling

Shared convention so any inki skill can respond to `--help`. Claude Code has no built-in `--help`: the string is passed through as a normal argument, so each skill must handle it itself. Skills that accept flags reference this file from their argument-parsing step.

## Rule

If `$ARGUMENTS` contains `--help` or `-h` (anywhere in the list), do NOT run the skill. Instead print a short usage block and stop:

```
/inki:<name>: <one-line description (the skill's frontmatter description, trimmed)>

Usage:
  /inki:<name> <argument-hint, verbatim from the skill's frontmatter>

Flags:
  <one line per flag the skill accepts, with a short gloss>

See the full command reference: claude-plugins/inki/COMMANDS.md
Shared flags are documented in the README "Common flags" section.
```

Keep it to what this specific skill accepts; do not list flags the skill does not use. Pull the description and the usage line from the skill's own frontmatter so they never drift. Then stop, without performing any work.
