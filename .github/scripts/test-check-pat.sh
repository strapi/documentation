#!/usr/bin/env bash
#
# Self-test for .github/actions/check-pat/check-pat.sh.
#
# Every outcome is driven from a stubbed api.github.com, so this runs offline,
# in a second, on macOS and on Linux. One case is live and is skipped when no
# real token is available.
#
# Usage:
#   .github/scripts/test-check-pat.sh
#   GH_TEST_TOKEN=$(gh auth token) .github/scripts/test-check-pat.sh   # + live case

set -uo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT="${HERE}/../actions/check-pat/check-pat.sh"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASS=0
FAIL=0

# --- stubs -------------------------------------------------------------------
#
# `curl` answers with whatever STUB_* says. `date` fills in GNU's `-d`, which
# macOS lacks.

mkdir -p "$WORK/bin"

cat > "$WORK/bin/curl" <<'STUB'
#!/usr/bin/env bash
out=""; hdr=""
while [ $# -gt 0 ]; do
  case "$1" in
    -o) out="$2"; shift 2 ;;
    -D) hdr="$2"; shift 2 ;;
    *)  shift ;;
  esac
done
[ -n "$out" ] && printf '%s' "${STUB_BODY:-}"    > "$out"
[ -n "$hdr" ] && printf '%s' "${STUB_HEADERS:-}" > "$hdr"
printf '%s' "${STUB_STATUS:-200}"
STUB

cat > "$WORK/bin/date" <<'STUB'
#!/usr/bin/env bash
if [ "${1:-}" = "-u" ] && [ "${2:-}" = "-d" ]; then
  python3 - "$3" <<'PY'
import sys, datetime
s = sys.argv[1].replace(" UTC", " +0000")
for f in ("%Y-%m-%d %H:%M:%S %z", "%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%d %H:%M:%S"):
    try:
        d = datetime.datetime.strptime(s, f)
        if d.tzinfo is None:
            d = d.replace(tzinfo=datetime.timezone.utc)
        print(int(d.timestamp()))
        sys.exit(0)
    except ValueError:
        pass
sys.exit(1)
PY
  exit $?
fi
exec /bin/date "$@"
STUB

chmod +x "$WORK/bin/curl" "$WORK/bin/date"

# --- harness -----------------------------------------------------------------

# run_case <label> <expected_status> <expected_exit> <body> <headers> <http_status>
run_case() {
  local label="$1" want_status="$2" want_exit="$3"
  local out="$WORK/out.txt"
  : > "$out"

  local got_exit
  env PATH="$WORK/bin:$PATH" \
      RUNNER_TEMP="$WORK" \
      GITHUB_REPOSITORY="strapi/documentation" \
      GITHUB_OUTPUT="$out" \
      STUB_BODY="$4" STUB_HEADERS="$5" STUB_STATUS="$6" \
      TOKEN="${TOKEN_OVERRIDE-stub-token}" \
      SECRET_NAME="PAT_TOKEN_PIWI" \
      WARN_DAYS="${WARN_DAYS_OVERRIDE:-14}" \
      FAIL_ON_ERROR="${FAIL_ON_ERROR_OVERRIDE:-true}" \
      bash "$SCRIPT" > "$WORK/log.txt" 2>&1
  got_exit=$?

  local got_status
  got_status=$(grep -m1 '^status=' "$out" | cut -d= -f2-)

  if [ "$got_status" = "$want_status" ] && [ "$got_exit" = "$want_exit" ]; then
    printf '  PASS  %-46s status=%-8s exit=%s\n' "$label" "$got_status" "$got_exit"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %-46s status=%-8s exit=%s  (wanted status=%s exit=%s)\n' \
      "$label" "${got_status:-<none>}" "$got_exit" "$want_status" "$want_exit"
    sed 's/^/        /' "$WORK/log.txt"
    FAIL=$((FAIL + 1))
  fi
}

hdr_with_expiry() {
  printf 'HTTP/2 200\r\nx-oauth-scopes: repo\r\ngithub-authentication-token-expiration: %s\r\n' "$1"
}

FAR=$(/bin/date -u -v+200d '+%Y-%m-%d %H:%M:%S UTC' 2>/dev/null \
      || /bin/date -u -d '+200 days' '+%Y-%m-%d %H:%M:%S UTC')
NEAR=$(/bin/date -u -v+9d '+%Y-%m-%d %H:%M:%S UTC' 2>/dev/null \
      || /bin/date -u -d '+9 days' '+%Y-%m-%d %H:%M:%S UTC')

OK_BODY='{"login":"pwizla"}'
PLAIN_HDR=$'HTTP/2 200\r\nx-oauth-scopes: repo\r\n'

echo "check-pat.sh"
echo

echo "The token is fine:"
run_case "valid, no expiry reported"        ok       0 "$OK_BODY" "$PLAIN_HDR"               200
run_case "valid, expires in 200 days"       ok       0 "$OK_BODY" "$(hdr_with_expiry "$FAR")"  200

echo
echo "The token is about to go:"
run_case "expires in 9 days, warn at 14"    expiring 0 "$OK_BODY" "$(hdr_with_expiry "$NEAR")" 200
WARN_DAYS_OVERRIDE=3 \
run_case "expires in 9 days, warn at 3"     ok       0 "$OK_BODY" "$(hdr_with_expiry "$NEAR")" 200

echo
echo "The token is gone:"
run_case "401 Bad credentials"              dead     1 '{"message":"Bad credentials"}'    "$PLAIN_HDR" 401
run_case "403 SSO or policy"                dead     1 '{"message":"Resource protected"}' "$PLAIN_HDR" 403
TOKEN_OVERRIDE='' \
run_case "secret missing from the repository" dead   1 "$OK_BODY" "$PLAIN_HDR"               200
FAIL_ON_ERROR_OVERRIDE=false \
run_case "401, canary mode (report, do not fail)" dead 0 '{"message":"Bad credentials"}' "$PLAIN_HDR" 401

echo
echo "GitHub could not be asked, which is not a verdict on the token:"
run_case "503 from GitHub"                  unknown  0 '{"message":"Server Error"}' "$PLAIN_HDR" 503
run_case "connection failed"                unknown  0 ''                           ''           000

echo
echo "Scopes and expiry stay out of the public surfaces:"
leak_out="$WORK/leak-output.txt"; : > "$leak_out"
env PATH="$WORK/bin:$PATH" \
    RUNNER_TEMP="$WORK" \
    GITHUB_REPOSITORY="strapi/documentation" \
    GITHUB_OUTPUT="$leak_out" \
    STUB_BODY="$OK_BODY" STUB_HEADERS="$(hdr_with_expiry "$NEAR")" STUB_STATUS=200 \
    TOKEN="stub-token" SECRET_NAME="PAT_TOKEN_PIWI" WARN_DAYS=14 FAIL_ON_ERROR=true \
    bash "$SCRIPT" > "$WORK/leak-log.txt" 2>&1

leak_check() {  # <label> <condition-result>
  if [ "$2" = 0 ]; then
    printf '  PASS  %-46s\n' "$1"; PASS=$((PASS + 1))
  else
    printf '  FAIL  %-46s\n' "$1"; FAIL=$((FAIL + 1))
  fi
}

grep -qiE 'scopes|[0-9]{4}-[0-9]{2}-[0-9]{2}' "$WORK/leak-log.txt"; leak_check "stdout carries neither" $((1 - $?))
grep -qiE 'scopes|[0-9]{4}-[0-9]{2}-[0-9]{2}' "$leak_out";          leak_check "GITHUB_OUTPUT carries neither" $((1 - $?))
grep -qi 'scopes: repo' "$WORK/check-pat-details.txt"; leak_check "the details file still has the scopes" $?
grep -qE 'expires: [0-9]{4}-'  "$WORK/check-pat-details.txt"; leak_check "the details file still has the expiry" $?

if [ -n "${GH_TEST_TOKEN:-}" ]; then
  echo
  echo "Live, against the real api.github.com:"
  out="$WORK/live.txt"; : > "$out"
  env RUNNER_TEMP="$WORK" GITHUB_REPOSITORY="strapi/documentation" \
      GITHUB_OUTPUT="$out" TOKEN="$GH_TEST_TOKEN" SECRET_NAME="GH_TEST_TOKEN" \
      WARN_DAYS=14 FAIL_ON_ERROR=true \
      bash "$SCRIPT" > "$WORK/live-log.txt" 2>&1
  live_exit=$?
  live_status=$(grep -m1 '^status=' "$out" | cut -d= -f2-)
  if [ "$live_exit" = 0 ] && { [ "$live_status" = ok ] || [ "$live_status" = expiring ]; }; then
    printf '  PASS  %-46s status=%-8s exit=%s\n' "real token accepted" "$live_status" "$live_exit"
    PASS=$((PASS + 1))
  else
    printf '  FAIL  %-46s status=%-8s exit=%s\n' "real token accepted" "${live_status:-<none>}" "$live_exit"
    sed 's/^/        /' "$WORK/live-log.txt"
    FAIL=$((FAIL + 1))
  fi
else
  echo
  echo "  SKIP  live case (set GH_TEST_TOKEN to run it)"
fi

echo
echo "${PASS} passed, ${FAIL} failed"
[ "$FAIL" -eq 0 ]
