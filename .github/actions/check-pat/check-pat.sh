#!/usr/bin/env bash
#
# Validates a personal access token and reports the verdict on $GITHUB_OUTPUT.
# Covered by .github/scripts/test-check-pat.sh.
#
# Inputs, all through the environment:
#   TOKEN, SECRET_NAME, WARN_DAYS, FAIL_ON_ERROR
#
# Outputs, written to $GITHUB_OUTPUT:
#   status   ok | expiring | dead | unknown
#   login, message, details_file
#
# Scopes and expiry stay out of $GITHUB_OUTPUT and out of stdout. GitHub prints
# the `env:` block of every step in the log, and this repository is public, so
# those values go to the details file instead, for a `run:` step to read.

set -euo pipefail

DETAILS="${RUNNER_TEMP}/check-pat-details.txt"

emit() { echo "$1=$2" >> "$GITHUB_OUTPUT"; }

# `dead` is a verdict on the token. `unknown` means GitHub could not be asked.
# Conflating the two would turn every GitHub incident into a false alarm.
fail() {
  emit status "${2:-dead}"
  emit login ''
  emit message "$1"
  emit details_file "$DETAILS"
  printf '%s\n' "$1" > "$DETAILS"

  if [ "${2:-dead}" = 'unknown' ]; then
    echo "::warning title=${SECRET_NAME} could not be checked::$1"
    exit 0
  fi

  echo "::error title=${SECRET_NAME} is not usable::$1"
  if [ "$FAIL_ON_ERROR" = 'true' ]; then
    exit 1
  fi
  exit 0
}

if [ -z "${TOKEN}" ]; then
  fail "The ${SECRET_NAME} secret is empty or missing from this repository. Add it under Settings > Secrets and variables > Actions."
fi

HEADERS="${RUNNER_TEMP}/check-pat-headers.txt"
BODY="${RUNNER_TEMP}/check-pat-body.json"

# Only transport failures and 5xx are retried, so a dead token still fails in
# one second rather than three.
STATUS='000'
for ATTEMPT in 1 2 3; do
  STATUS=$(curl -sS --max-time 20 \
    -o "$BODY" -D "$HEADERS" -w '%{http_code}' \
    -H "Authorization: Bearer ${TOKEN}" \
    -H 'Accept: application/vnd.github+json' \
    -H 'X-GitHub-Api-Version: 2022-11-28' \
    https://api.github.com/user) || STATUS='000'

  case "$STATUS" in
    000|5??)
      if [ "$ATTEMPT" -lt 3 ]; then
        echo "Attempt ${ATTEMPT}: GitHub answered ${STATUS}, retrying..."
        sleep $((ATTEMPT * 3))
      fi
      ;;
    *)
      break
      ;;
  esac
done

if [ "$STATUS" != '200' ]; then
  REASON=$(jq -r '.message // empty' "$BODY" 2>/dev/null) || REASON=''
  REASON="${REASON:-no message returned}"
  ROTATE="Mint a replacement, then: gh secret set ${SECRET_NAME} --repo ${GITHUB_REPOSITORY}"

  case "$STATUS" in
    000)
      fail "Could not reach api.github.com after 3 attempts, so ${SECRET_NAME} could not be checked. This says nothing about the token." unknown
      ;;
    5??)
      fail "GitHub answered HTTP ${STATUS} (${REASON}) after 3 attempts, so ${SECRET_NAME} could not be checked. This says nothing about the token." unknown
      ;;
    401)
      fail "GitHub rejected ${SECRET_NAME} with HTTP 401 (${REASON}). The token is expired, revoked, or malformed. ${ROTATE}"
      ;;
    403)
      fail "GitHub refused ${SECRET_NAME} with HTTP 403 (${REASON}). The token exists but is not allowed through. Likely causes: SSO authorization for the organization, an organization token policy, or a rate limit. Check its SSO authorization first, then ${ROTATE}"
      ;;
    *)
      fail "GitHub answered HTTP ${STATUS} (${REASON}) when validating ${SECRET_NAME}. ${ROTATE}"
      ;;
  esac
fi

# `|| true` is load-bearing: composite steps run under `bash -e`, and grep exits
# 1 on "no match", which is the normal case for a token with no expiry.
header_value() {
  { grep -i "^$1:" "$HEADERS" || true; } \
    | tail -n 1 | cut -d: -f2- | tr -d '\r' | sed 's/^ *//;s/ *$//'
}

LOGIN=$(jq -r '.login // empty' "$BODY") || LOGIN=''
SCOPES=$(header_value 'x-oauth-scopes')

# Best effort. GitHub returns this header only for tokens that carry an expiry.
# The 200 above already proved the token is alive, so an absent header costs the
# countdown and nothing else.
EXPIRES=$(header_value 'github-authentication-token-expiration')
DAYS_LEFT=''
STATE='ok'

if [ -n "$EXPIRES" ]; then
  EXP_TS=$(date -u -d "$EXPIRES" +%s 2>/dev/null) || EXP_TS=''
  if [ -n "$EXP_TS" ]; then
    DAYS_LEFT=$(( (EXP_TS - $(date -u +%s)) / 86400 ))
    if [ "$DAYS_LEFT" -le "$WARN_DAYS" ]; then
      STATE='expiring'
    fi
  fi
fi

echo "${SECRET_NAME}: authenticated as ${LOGIN:-unknown}"

if [ "$STATE" = 'expiring' ]; then
  MESSAGE="${SECRET_NAME} is valid but expires soon. Rotate it."
  echo "::warning title=${SECRET_NAME} expires soon::${MESSAGE}"
else
  MESSAGE="${SECRET_NAME} is valid, authenticated as ${LOGIN}."
fi

{
  echo "${SECRET_NAME}: ${STATE}"
  echo "authenticated as ${LOGIN:-unknown}"
  echo "scopes: ${SCOPES:-none reported}"
  if [ -n "$EXPIRES" ]; then
    echo "expires: ${EXPIRES}${DAYS_LEFT:+ (${DAYS_LEFT} day(s) left)}"
  else
    echo "expires: not reported"
  fi
} > "$DETAILS"

emit status "$STATE"
emit login "$LOGIN"
emit message "$MESSAGE"
emit details_file "$DETAILS"
