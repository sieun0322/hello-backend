#!/usr/bin/env bash
# Hook: PreToolUse (Write)
# 민감한 경로에 대한 Write 시도 차단

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("file_path",""))' 2>/dev/null || echo "")

SENSITIVE_PATTERNS=(
  '\.env$'
  '\.env\.'
  '\.pem$'
  '\.key$'
  '\.p12$'
  'secret'
  'credential'
  'id_rsa'
  'id_ed25519'
)

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
  if echo "$FILE_PATH" | grep -qiE "$pattern" 2>/dev/null; then
    echo "{\"decision\": \"block\", \"reason\": \"민감한 경로에 쓰기 차단: '$FILE_PATH'\"}"
    exit 0
  fi
done
