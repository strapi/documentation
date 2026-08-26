#!/usr/bin/env bash
#
# Criterion 10 — no external link is added.
#
# A URL pointing off strapi.io in the public documentation is an editorial
# endorsement: it sends readers somewhere the maintainer does not control, and
# it can rot, redirect, or change hands. Internal links stay in scope — they
# resolve inside the docs and the build already checks them.
#
# Allowed hosts are configurable; the defaults cover Strapi's own properties and
# the repositories the docs legitimately reference.

set -euo pipefail
source "$(dirname "${BASH_SOURCE[0]}")/lib.sh"

# Extended regex of hosts that do not count as external.
#
# Dots are written [.] rather than \. on purpose. This string reaches awk through
# -v, where a backslash is a STRING escape, not a regex one: awk consumes it and
# gawk warns "escape sequence \. treated as plain .". The dot then matches any
# character, so `strapiXio.evil.com` would have been accepted as an allowed host.
# [.] survives -v untouched and means exactly one literal dot.
ALLOWED_HOSTS="${AUTOMERGE_ALLOWED_LINK_HOSTS:-strapi[.]io|docs[.]strapi[.]io|github[.]com/strapi|market[.]strapi[.]io|cloud[.]strapi[.]io}"

PR="${1:-}"
require_pr_number "$PR"

DIFF=$(pr_diff "$PR") || unknown "cannot read the diff of $REPO#$PR"

FOUND=$(echo "$DIFF" | awk -v allowed="$ALLOWED_HOSTS" '
  /^diff --git/ { skip = ($0 ~ /llms.*\.txt/); next }
  skip { next }
  /^\+\+\+/ { next }
  /^\+/ {
    line = substr($0, 2)
    rest = line
    # Report every http(s) URL on the line that is not on an allowed host.
    while (match(rest, /https?:\/\/[^ ")><\]]+/)) {
      url = substr(rest, RSTART, RLENGTH)
      rest = substr(rest, RSTART + RLENGTH)
      if (url !~ ("^https?://(www\\.)?(" allowed ")")) { print url }
    }
  }
')

if [ -n "$FOUND" ]; then
  COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
  FIRST=$(echo "$FOUND" | head -1)
  fail "adds $COUNT external link(s), first: $FIRST"
fi

pass "adds no external link"
