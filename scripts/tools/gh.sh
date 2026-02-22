#!/usr/bin/env bash
set -euo pipefail

if command -v gh >/dev/null 2>&1; then
  exec gh "$@"
fi

FALLBACK_GH="/mnt/c/Users/HP/rfskill/tools/bin/gh.exe"
if [ -x "$FALLBACK_GH" ]; then
  exec "$FALLBACK_GH" "$@"
fi

echo "GitHub CLI not found. Install gh or make $FALLBACK_GH available." >&2
exit 1
