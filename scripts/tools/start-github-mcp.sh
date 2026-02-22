#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  export GITHUB_TOKEN="$($SCRIPT_DIR/github-token.sh)"
fi

if [ -z "${GITHUB_TOKEN}" ]; then
  echo "No GITHUB_TOKEN available for GitHub MCP server." >&2
  exit 1
fi

exec npx -y @modelcontextprotocol/server-github
