#!/usr/bin/env bash
#
# Answers one question: is a strapi/strapi PR available in a published release?
#
#   ./is-strapi-pr-released.sh 26425          # exit 0 = released, 1 = not released
#   ./is-strapi-pr-released.sh 26425 v5.52.1  # compare against an explicit tag
#
# "Released" means the PR's merge commit is an ancestor of a published GitHub
# release tag — i.e. the code is in a version users can install from npm. It does
# NOT mean the branch was locked, a milestone is due, or the PR was merged into
# develop.
#
# The test is a single API call and is fully deterministic:
#   compare(<tag>...<merge-sha>) -> status "behind" + ahead_by 0  => released
#                               -> status "ahead"  + ahead_by > 0 => not released
#
# Requires: gh (authenticated), jq.

set -euo pipefail

PR_NUMBER="${1:-}"
TAG_OVERRIDE="${2:-}"
REPO="strapi/strapi"

if [ -z "$PR_NUMBER" ]; then
  echo "usage: $0 <strapi-pr-number> [tag]" >&2
  exit 2
fi

# ── Resolve the reference tag ────────────────────────────────────────────────
#
# Deliberately NOT `releases/latest`: that returns whatever GitHub flags as
# "latest", which can be a v4 maintenance release. v4 and v5 releases interleave
# chronologically (v4.26.2 shipped between v5.47.1 and v5.48.0), so comparing a
# develop commit against a v4 tag would be meaningless.
#
# Take the newest non-draft, non-prerelease tag matching v5.
if [ -n "$TAG_OVERRIDE" ]; then
  TAG="$TAG_OVERRIDE"
else
  if ! TAG=$(gh api "repos/$REPO/releases?per_page=30" \
    --jq '[.[] | select(.draft == false and .prerelease == false and (.tag_name | startswith("v5.")))]
          | sort_by(.published_at) | reverse | .[0].tag_name' 2>&1); then
    echo "error: cannot list releases: $TAG" >&2
    exit 2
  fi

  if [ -z "$TAG" ] || [ "$TAG" = "null" ]; then
    echo "error: could not resolve a published v5 release tag" >&2
    exit 2
  fi
fi

# ── Resolve the PR's merge commit ────────────────────────────────────────────
#
# An API failure (404, rate limit, network) must NOT be reported as
# "not released" — that would silently flag every PR during an outage. Errors
# exit 2 so callers can tell "the answer is no" from "there is no answer".
if ! PR_JSON=$(gh api "repos/$REPO/pulls/$PR_NUMBER" --jq '{merged: .merged, sha: .merge_commit_sha}' 2>&1); then
  echo "error: cannot read strapi/strapi#$PR_NUMBER: $PR_JSON" >&2
  exit 2
fi

MERGED=$(echo "$PR_JSON" | jq -r '.merged')
SHA=$(echo "$PR_JSON" | jq -r '.sha')

# An unmerged PR is by definition not released.
if [ "$MERGED" != "true" ]; then
  echo "not-released: strapi/strapi#$PR_NUMBER is not merged"
  exit 1
fi

if [ -z "$SHA" ] || [ "$SHA" = "null" ]; then
  echo "error: no merge commit found for strapi/strapi#$PR_NUMBER" >&2
  exit 2
fi

# ── Compare ──────────────────────────────────────────────────────────────────
if ! COMPARE=$(gh api "repos/$REPO/compare/$TAG...$SHA" --jq '{status: .status, ahead: .ahead_by}' 2>&1); then
  echo "error: cannot compare $TAG...$SHA: $COMPARE" >&2
  exit 2
fi

STATUS=$(echo "$COMPARE" | jq -r '.status')
AHEAD=$(echo "$COMPARE" | jq -r '.ahead')

# The commit is contained in the tag when it is not ahead of it. "identical"
# covers the edge case where the merge commit is itself the tagged commit.
if { [ "$STATUS" = "behind" ] || [ "$STATUS" = "identical" ]; } && [ "$AHEAD" -eq 0 ]; then
  echo "released: strapi/strapi#$PR_NUMBER is in $TAG"
  exit 0
fi

echo "not-released: strapi/strapi#$PR_NUMBER is $AHEAD commit(s) ahead of $TAG"
exit 1
