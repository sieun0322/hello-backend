#!/usr/bin/env bash
# Hook: PreToolUse (Bash)
# 파괴적 명령 실행 전 차단

set -euo pipefail

# Claude Code가 stdin으로 tool input JSON을 전달
INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d.get("command",""))' 2>/dev/null || echo "")

DANGEROUS_PATTERNS=(
  'git push --force'
  'git push -f'
  'git reset --hard'
  'git clean -f'
  'git commit.*--no-verify'
  'git commit.*-n '
  'DROP TABLE'
  'DROP DATABASE'
  'kubectl delete namespace'
  'kubectl delete --all'
  'truncate table'
  'rm -rf /'
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern" 2>/dev/null; then
    echo "{\"decision\": \"block\", \"reason\": \"위험 명령 감지: '$pattern' — 실행하려면 사용자에게 직접 확인하세요.\"}"
    exit 0
  fi
done
