#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TOKEN="$($SCRIPT_DIR/gh.sh auth token)"

if [ -z "$TOKEN" ]; then
  echo "Unable to read GitHub token from gh auth token." >&2
  exit 1
fi

printf '%s' "$TOKEN"
