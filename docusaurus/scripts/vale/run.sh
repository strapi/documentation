#!/usr/bin/env bash
# Runs Vale for Strapi docs prose checks. Downloads a pinned Vale binary into
# docusaurus/.tools/ on first use — no global install. Same entry point locally and in CI.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCUSAURUS_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
VALE_VERSION="3.14.2"
TOOLS_DIR="${DOCUSAURUS_DIR}/.tools/vale/${VALE_VERSION}"
VALE_BIN="${TOOLS_DIR}/vale"

ensure_vale() {
  if [[ -x "${VALE_BIN}" ]]; then
    return 0
  fi

  mkdir -p "${TOOLS_DIR}"

  local os arch asset
  case "$(uname -s)" in
    Linux) os="Linux" ;;
    Darwin) os="macOS" ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "error: Windows is not supported by this script. Use WSL or Linux CI." >&2
      exit 1
      ;;
    *)
      echo "error: unsupported OS: $(uname -s)" >&2
      exit 1
      ;;
  esac

  case "$(uname -m)" in
    x86_64 | amd64) arch="64-bit" ;;
    arm64 | aarch64) arch="arm64" ;;
    *)
      echo "error: unsupported architecture: $(uname -m)" >&2
      exit 1
      ;;
  esac

  asset="vale_${VALE_VERSION}_${os}_${arch}.tar.gz"
  url="https://github.com/vale-cli/vale/releases/download/v${VALE_VERSION}/${asset}"

  echo "Downloading Vale ${VALE_VERSION} (${os}/${arch}) to ${TOOLS_DIR}..."
  curl -fsSL "${url}" -o "${TOOLS_DIR}/vale.tar.gz"
  tar -xzf "${TOOLS_DIR}/vale.tar.gz" -C "${TOOLS_DIR}"
  rm -f "${TOOLS_DIR}/vale.tar.gz"

  if [[ ! -x "${VALE_BIN}" ]]; then
    echo "error: Vale binary not found after extract (expected ${VALE_BIN})" >&2
    exit 1
  fi
}

ensure_vale
cd "${DOCUSAURUS_DIR}"

if [[ $# -eq 0 ]]; then
  exec "${VALE_BIN}" --config .vale.ini docs/
fi

exec "${VALE_BIN}" --config .vale.ini "$@"
