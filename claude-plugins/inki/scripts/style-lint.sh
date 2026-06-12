#!/usr/bin/env bash
# style-lint.sh -- Deterministic style linting for Strapi documentation
# Checks Markdown/MDX files against regex-based rules from the 12 Rules of Technical Writing.
# Outputs: <severity>:<line>:<rule>:<message>
# Exit codes: 0 = clean, 1 = errors found, 2 = warnings only (no errors)
#
# macOS-compatible: uses grep -E (no PCRE dependency).

set -euo pipefail

# Known acronyms that are allowed in ALL CAPS
KNOWN_ACRONYMS="API|CLI|CSS|HTML|JS|JSON|NPM|REST|SDK|SQL|UI|URL|UUID|ULID|HTTP|HTTPS|CMS|SSO|RBAC|JWT|JWK|JWKS|JWS|JWE|JWA|CORS|DNS|FTP|SSH|CDN|SEO|RSS|SMTP|IMAP|POP3|LDAP|SAML|OIDC|OAuth|CRUD|ORM|MVC|SPA|SSR|CSR|PWA|DOM|YAML|TOML|XML|CSV|TSV|AWS|GCP|IAM|EC2|S3|RDS|ECS|EKS|VPC|VPN|WAF|MDX|JSX|TSX|GDPR|SSG|ISR|TLS|SSL|TCP|UDP|IDE|VSC|EOF|USA|FAQ|PDF|PNG|JPG|JPEG|GIF|SVG|WEBP|AVIF|RGB|HEX|HSL|ISO|UTC|GMT|MFA|TOTP|HOTP|ACL|PII|CRON|IPV4|IPV6|MIME|TTL|CTA|KPI|IIFE|GZIP"

# Literal em dash character for matching (UTF-8)
EM_DASH=$'\xe2\x80\x94'

usage() {
  echo "Usage: $0 <file1.md> [file2.md ...]" >&2
  echo "  Runs deterministic style checks on Markdown/MDX files." >&2
  echo "  Exit codes: 0 = clean, 1 = errors found, 2 = warnings only" >&2
  exit 1
}

if [[ $# -eq 0 ]]; then
  usage
fi

has_errors=0
has_warnings=0

# --- Preprocessing: strip code blocks, HTML comments, and inline code ---
# Returns a version of the file where excluded content is replaced with blank
# lines (preserving line numbers) or spaces (for inline code).

strip_excluded_content() {
  local file="$1"
  awk '
    BEGIN { in_code_block = 0; in_html_comment = 0 }

    # Toggle code blocks (``` fences)
    /^[[:space:]]*```/ {
      if (in_code_block) {
        in_code_block = 0
        print ""
        next
      } else {
        in_code_block = 1
        print ""
        next
      }
    }

    in_code_block {
      print ""
      next
    }

    # Handle multi-line HTML comments
    {
      line = $0

      # Remove complete single-line HTML comments
      while (match(line, /<!--.*-->/)) {
        before = substr(line, 1, RSTART - 1)
        after = substr(line, RSTART + RLENGTH)
        replacement = ""
        for (i = 0; i < RLENGTH; i++) replacement = replacement " "
        line = before replacement after
      }

      # Start of multi-line HTML comment
      if (!in_html_comment && match(line, /<!--/)) {
        in_html_comment = 1
        before = substr(line, 1, RSTART - 1)
        after_comment = substr(line, RSTART)
        replacement = ""
        for (i = 0; i < length(after_comment); i++) replacement = replacement " "
        line = before replacement
      }

      if (in_html_comment) {
        if (match(line, /-->/)) {
          in_html_comment = 0
          after = substr(line, RSTART + RLENGTH)
          before = ""
          for (i = 0; i < RSTART + RLENGTH - 1; i++) before = before " "
          line = before after
        } else {
          print ""
          next
        }
      }

      # Remove inline code (backtick-wrapped content)
      while (match(line, /`[^`]+`/)) {
        before = substr(line, 1, RSTART - 1)
        after = substr(line, RSTART + RLENGTH)
        replacement = ""
        for (i = 0; i < RLENGTH; i++) replacement = replacement " "
        line = before replacement after
      }

      print line
    }
  ' "$file"
}

# Helper: case-insensitive word match using grep -Ei with word boundaries
# macOS grep -E does not support \b, so we use [[:<:]] and [[:>:]] on macOS
# and \b on Linux.
word_boundary_start='[[:<:]]'
word_boundary_end='[[:>:]]'
if grep -E '\b' /dev/null 2>/dev/null; then
  word_boundary_start='\b'
  word_boundary_end='\b'
fi

lint_file() {
  local file="$1"

  if [[ ! -f "$file" ]]; then
    echo "error:0:file-not-found:File not found: $file" >&2
    has_errors=1
    return
  fi

  # Get stripped content (code blocks, comments, inline code removed)
  local stripped
  stripped=$(strip_excluded_content "$file")

  local line_num=0
  local in_frontmatter=0
  local frontmatter_started=0

  while IFS= read -r line; do
    line_num=$((line_num + 1))

    # Handle frontmatter (YAML between --- delimiters at start of file)
    if [[ $line_num -eq 1 && "$line" == "---" ]]; then
      in_frontmatter=1
      frontmatter_started=1
      continue
    fi
    if [[ $in_frontmatter -eq 1 ]]; then
      if [[ "$line" == "---" ]]; then
        in_frontmatter=0
      fi
      continue
    fi

    # Skip empty lines
    [[ -z "$line" ]] && continue

    # Skip import statements and JSX component-only lines
    if echo "$line" | grep -qE '^import[[:space:]]'; then
      continue
    fi
    if echo "$line" | grep -qE '^<[A-Z]'; then
      continue
    fi

    # =====================
    # ERROR-LEVEL CHECKS
    # =====================

    # Em dashes in prose (not in URLs)
    if echo "$line" | grep -q "${EM_DASH}"; then
      # Check it is not inside a URL
      local is_url=0
      if echo "$line" | grep -qE "https?://[^[:space:]]*${EM_DASH}"; then
        is_url=1
      fi
      if [[ $is_url -eq 0 ]]; then
        echo "error:${line_num}:em-dash:Em dash found -- replace with colon, period, or restructure"
        has_errors=1
      fi
    fi

    # Em dash written as an HTML entity: &mdash;, &#8212; (decimal), or &#x2014;
    # (hex). MDX renders these as the em dash character, so they are the same
    # violation as a literal em dash but slip past the literal-character match.
    if echo "$line" | grep -qiE "&(mdash|#8212|#x2014);"; then
      echo "error:${line_num}:em-dash-entity:Em dash HTML entity found -- replace with colon, period, or restructure"
      has_errors=1
    fi

    # Double hyphens used as dashes in prose (not in frontmatter or HTML comments)
    if echo "$line" | grep -qE " -- "; then
      # Exclude frontmatter separators (---) and HTML comments (<!--)
      if ! echo "$line" | grep -qE "^---|<!--|^-"; then
        echo "error:${line_num}:double-hyphen-dash:Double hyphen used as dash -- replace with colon, period, or restructure"
        has_errors=1
      fi
    fi

    # "Easy/simple" words describing tasks
    local easy_match
    easy_match=$(echo "$line" | grep -oEi "${word_boundary_start}(easy|easily|simple|simply|straightforward)${word_boundary_end}" | head -1 || true)
    if [[ -n "$easy_match" ]]; then
      echo "error:${line_num}:easy-words:\"${easy_match}\" used to describe a task"
      has_errors=1
    fi

    # Bold prefixes that should be admonitions
    local bold_match
    bold_match=$(echo "$line" | grep -oE '\*\*(Note|Important|Warning|Tip|Caution):\*\*' | head -1 || true)
    if [[ -n "$bold_match" ]]; then
      local bold_type
      bold_type=$(echo "$bold_match" | sed 's/\*\*//g; s/://')
      local bold_lower
      bold_lower=$(echo "$bold_type" | tr '[:upper:]' '[:lower:]')
      echo "error:${line_num}:bold-admonition:**${bold_type}:** should be a :::${bold_lower} admonition"
      has_errors=1
    fi

    # Multi-action steps: numbered list items with joining words
    if echo "$line" | grep -qE '^[[:space:]]*[0-9]+\.[[:space:]]'; then
      if echo "$line" | grep -qEi "(,?[[:space:]]*${word_boundary_start}then${word_boundary_end}|${word_boundary_start}and then${word_boundary_end}|${word_boundary_start}and also${word_boundary_end}|,?[[:space:]]*${word_boundary_start}next${word_boundary_end})"; then
        echo "error:${line_num}:multi-action-step:Numbered step contains multiple actions -- split into separate steps"
        has_errors=1
      fi
    fi

    # Casual language
    local casual_match
    casual_match=$(echo "$line" | grep -oEi "${word_boundary_start}(gonna|wanna|pretty cool|awesome|super)${word_boundary_end}" | head -1 || true)
    if [[ -n "$casual_match" ]]; then
      echo "error:${line_num}:casual-language:Casual language \"${casual_match}\" -- use a neutral tone"
      has_errors=1
    fi

    # =====================
    # WARNING-LEVEL CHECKS
    # =====================

    # ALL CAPS words (3+ letters) that are not known acronyms
    local caps_words
    caps_words=$(echo "$line" | grep -oE "${word_boundary_start}[A-Z]{3,}${word_boundary_end}" || true)
    if [[ -n "$caps_words" ]]; then
      while IFS= read -r caps_word; do
        [[ -z "$caps_word" ]] && continue
        if ! echo "$caps_word" | grep -qE "^(${KNOWN_ACRONYMS})$"; then
          echo "warning:${line_num}:all-caps:ALL CAPS \"${caps_word}\" is not a known acronym"
          has_warnings=1
        fi
      done <<< "$caps_words"
    fi

    # ./ prefix in file paths (inside backticks -- checked on original line since
    # inline code was stripped; re-check original file line)
    local orig_line
    orig_line=$(sed -n "${line_num}p" "$file")
    if echo "$orig_line" | grep -qE '`\./[^`]*`'; then
      echo "warning:${line_num}:dot-slash-path:File path uses ./ prefix -- should start with /"
      has_warnings=1
    fi

    # Long sentences (> 150 chars as proxy for > 25 words)
    # Only check lines that look like prose (not headings, lists, tables, etc.)
    if ! echo "$line" | grep -qE '^[#|!\[]' && ! echo "$line" | grep -qE '^[[:space:]]*[-*]' && ! echo "$line" | grep -qE '^[[:space:]]*[0-9]+\.'; then
      if [[ ${#line} -gt 150 ]]; then
        echo "warning:${line_num}:long-sentence:Line exceeds 150 characters (likely > 25 words)"
        has_warnings=1
      fi
    fi

    # "utilize", "leverage", "in order to"
    if echo "$line" | grep -qEi "${word_boundary_start}utilize[sd]?${word_boundary_end}"; then
      echo "warning:${line_num}:simplify-word:\"utilize\" -- use \"use\" instead"
      has_warnings=1
    fi
    if echo "$line" | grep -qEi "${word_boundary_start}leverage[sd]?${word_boundary_end}"; then
      echo "warning:${line_num}:simplify-word:\"leverage\" -- use \"use\" instead"
      has_warnings=1
    fi
    if echo "$line" | grep -qEi "${word_boundary_start}in order to${word_boundary_end}"; then
      echo "warning:${line_num}:simplify-word:\"in order to\" -- use \"to\" instead"
      has_warnings=1
    fi

    # i18n called "plugin" instead of "feature" (it's a core feature since Strapi 5)
    if echo "$line" | grep -qEi "i18n.*plugin|internationalization.*plugin"; then
      echo "warning:${line_num}:i18n-not-plugin:i18n is a feature since Strapi 5, not a plugin -- use \"feature\" instead of \"plugin\""
      has_warnings=1
    fi

    # Users & Permissions called "plugin" instead of "feature" (core feature since Strapi 5)
    # Exception: admin panel paths like "Users & Permissions plugin > Roles" are correct
    if echo "$line" | grep -qE "Users & Permissions plugin" && ! echo "$line" | grep -qE "Users & Permissions plugin >"; then
      echo "warning:${line_num}:up-not-plugin:Users & Permissions is a feature since Strapi 5, not a plugin -- use \"feature\" instead of \"plugin\""
      has_warnings=1
    fi

    # Spelled-out numbers (should be numerals per Strapi style guide)
    local spelled_number
    spelled_number=$(echo "$line" | grep -oEi "${word_boundary_start}(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)${word_boundary_end}" | head -1 || true)
    if [[ -n "$spelled_number" ]]; then
      echo "warning:${line_num}:spelled-number:\"${spelled_number}\" -- write as a numeral per Strapi style guide"
      has_warnings=1
    fi

    # =====================
    # SUGGESTION-LEVEL
    # =====================

    # Standalone cross-reference sentences
    if echo "$line" | grep -qE '^See \[.*\]\(.*\)\.[[:space:]]*$'; then
      echo "suggestion:${line_num}:standalone-xref:Standalone \"See [link].\" -- consider integrating into preceding sentence"
    fi

  done <<< "$stripped"
}

# --- Main ---

for file in "$@"; do
  lint_file "$file"
done

# Exit code logic
if [[ $has_errors -eq 1 ]]; then
  exit 1
elif [[ $has_warnings -eq 1 ]]; then
  exit 2
else
  exit 0
fi
