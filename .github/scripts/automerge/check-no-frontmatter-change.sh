#!/usr/bin/env bash
#
# Criterion 9 — the YAML frontmatter is untouched.
#
# Frontmatter is not prose. `title` and `description` drive search results and
# social cards, `displayed_sidebar` decides where the page appears in the
# navigation, `tags` feed the tag index, and `pagination_next`/`pagination_prev`
# rewire the reading order. Changing any of them affects readers who never open
# the page.
#
# Detection: the frontmatter is the block between the first two `---` fences at
# the very top of a Markdown file. Any added or removed line inside that block
# fails.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

FOUND=$(echo "$DIFF" | awk '
  /^diff --git/ {
    skip = ($0 ~ /llms.*\.txt/)
    # Reset per-file state. old_ln/new_ln track position so we can tell whether
    # a hunk actually reaches the top of the file.
    old_ln = 0; new_ln = 0
    fm_open = 0; fm_done = 0
    next
  }
  skip { next }
  /^--- |^\+\+\+ / { next }

  # Hunk header: @@ -old,count +new,count @@
  /^@@/ {
    match($0, /-[0-9]+/); old_ln = substr($0, RSTART+1, RLENGTH-1) + 0
    match($0, /\+[0-9]+/); new_ln = substr($0, RSTART+1, RLENGTH-1) + 0
    next
  }

  # Frontmatter can only be at the very top. Once we are past it in both files,
  # nothing else can be frontmatter.
  fm_done { next }

  {
    kind = substr($0, 1, 1)
    body = substr($0, 2)
    stripped = body
    gsub(/^[[:space:]]+|[[:space:]]+$/, "", stripped)

    # A hunk that does not start at line 1 cannot contain frontmatter.
    if (kind == " " && old_ln == 1 && new_ln == 1 && stripped == "---" && !fm_open) {
      fm_open = 1; old_ln++; new_ln++; next
    }
    if ((kind == "+" && new_ln == 1) || (kind == "-" && old_ln == 1)) {
      if (stripped == "---") { fm_open = 1 }
    }

    if (fm_open && stripped == "---" && (old_ln > 1 || new_ln > 1)) {
      fm_done = 1
    }

    if (fm_open && !fm_done && (kind == "+" || kind == "-")) {
      print kind stripped
    }

    if (kind == " " || kind == "-") old_ln++
    if (kind == " " || kind == "+") new_ln++
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "changes $COUNT frontmatter line(s), first: $FIRST"
fi

pass "frontmatter is untouched"
