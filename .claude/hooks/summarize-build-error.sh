#!/usr/bin/env bash
# Hook: PostToolUse (Bash)
# 빌드/테스트 실패 시 에러 핵심만 추출해서 Claude에게 전달

set -euo pipefail

INPUT=$(cat)

# exit code 확인
EXIT_CODE=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("exitCode", 0))' 2>/dev/null || echo "0")
COMMAND=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("command",""))' 2>/dev/null || echo "")
OUTPUT=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("stdout","") + d.get("stderr",""))' 2>/dev/null || echo "")

# 빌드/테스트 명령이 아니면 스킵
if ! echo "$COMMAND" | grep -qE '(cargo|go build|go test|npm (run|build|test)|pytest|make)'; then
  exit 0
fi

# 성공이면 스킵
if [ "$EXIT_CODE" = "0" ]; then
  exit 0
fi

# 에러 핵심 추출: error: / FAILED / panicked 포함 줄만
SUMMARY=$(echo "$OUTPUT" | grep -E '(^error|error\[|FAILED|panicked|FAIL\t|Error:)' | head -20 || true)

if [ -n "$SUMMARY" ]; then
  ESCAPED=$(echo "$SUMMARY" | python3 -c 'import sys,json; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo "\"$SUMMARY\"")
  echo "{\"additionalContext\": $ESCAPED}"
fi
