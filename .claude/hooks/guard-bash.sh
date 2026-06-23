#!/usr/bin/env bash
# PreToolUse guard for Bash commands.
# Blocks obviously dangerous operations and reads of secret files.
# Reads the tool input as JSON on stdin; exit 2 blocks the call.

set -euo pipefail
input="$(cat)"
cmd="$(printf '%s' "$input" | python3 -c 'import sys,json; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))' 2>/dev/null || true)"

# Block destructive recursive force removals
if printf '%s' "$cmd" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*[rf][a-zA-Z]*[[:space:]]+)+(/|~|\.|\*)'; then
  echo "Blocked: refusing destructive 'rm -rf' on a sensitive path. Run it manually if you really mean to." >&2
  exit 2
fi

# Block reads/cats of secret files
if printf '%s' "$cmd" | grep -Eq '(cat|less|head|tail|cp|scp)[^|]*\.env(\b|\.)'; then
  echo "Blocked: refusing to read .env / secrets via shell. Use CI secrets instead." >&2
  exit 2
fi

# Block git push of force to main
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push.*--force.*\b(main|master)\b'; then
  echo "Blocked: refusing force-push to main." >&2
  exit 2
fi

exit 0
