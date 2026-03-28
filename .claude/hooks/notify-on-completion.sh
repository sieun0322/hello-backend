#!/usr/bin/env bash
# Hook: Notification
# 작업 완료/대기 시 macOS 알림 표시

set -euo pipefail

INPUT=$(cat)
TITLE=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("title","Claude Code"))' 2>/dev/null || echo "Claude Code")
MESSAGE=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("message",""))' 2>/dev/null || echo "")

if [ -z "$MESSAGE" ]; then
  exit 0
fi

# macOS 알림
osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"Glass\"" 2>/dev/null || true
