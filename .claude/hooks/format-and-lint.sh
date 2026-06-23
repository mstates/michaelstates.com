#!/usr/bin/env bash
# PostToolUse hook: after an edit/write, format and lint the changed file(s).
# Best-effort and non-fatal — never blocks the session, just keeps things tidy.
# Receives tool input JSON on stdin.

set -uo pipefail
input="$(cat)"
file="$(printf '%s' "$input" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)"

# Only act on source files we care about
case "$file" in
  *.ts|*.tsx|*.js|*.jsx|*.astro|*.css|*.json|*.md)
    if command -v pnpm >/dev/null 2>&1; then
      pnpm exec prettier --write "$file" >/dev/null 2>&1 || true
      # Lint only JS/TS-ish files; surface a11y issues early but don't fail the hook
      case "$file" in
        *.ts|*.tsx|*.js|*.jsx|*.astro)
          pnpm exec eslint --fix "$file" >/dev/null 2>&1 || true
          ;;
      esac
    fi
    ;;
esac
exit 0
