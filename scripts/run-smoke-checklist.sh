#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

REPORT_PATH="${1:-docs/monorepo/SMOKE_REPORT.md}"
mkdir -p "$(dirname "${REPORT_PATH}")"

SITE_URL="${SMOKE_SITE_URL:-https://applyingmyself.com}"
DEV_URL="${SMOKE_DEV_URL:-https://dev.applyingmyself.com}"
CONVEX_URL="${SMOKE_CONVEX_URL:-https://oceanic-retriever-344.convex.site}"

NOW_UTC="$(date -u +"%Y-%m-%d %H:%M:%SZ")"

declare -a ROWS

add_row() {
  local scenario="$1"
  local status="$2"
  local details="$3"
  ROWS+=("| ${scenario} | ${status} | ${details} |")
}

run_cmd_check() {
  local label="$1"
  local cmd="$2"
  local output
  if output="$(bash -lc "${cmd}" 2>&1)"; then
    add_row "${label}" "PASS" "Command succeeded: \`${cmd}\`"
  else
    local compact
    compact="$(echo "${output}" | tail -n 2 | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g')"
    add_row "${label}" "FAIL" "Command failed: \`${cmd}\` (${compact})"
  fi
}

run_http_check() {
  local label="$1"
  local url="$2"
  local output
  if output="$(curl -sS -I --max-time 20 "${url}" 2>&1)"; then
    local status_line
    status_line="$(echo "${output}" | awk 'toupper($1) ~ /^HTTP/ {print; exit}')"
    add_row "${label}" "PASS" "${status_line:-HTTP response received} (${url})"
  else
    local compact
    compact="$(echo "${output}" | tail -n 1 | sed 's/[[:space:]]\+/ /g')"
    add_row "${label}" "BLOCKED" "Network check failed in current environment (${compact})"
  fi
}

run_cmd_check "API Contract Check" "bun run check:api-contract"
run_cmd_check "Typecheck (web/extension/convex)" "bun run typecheck"
run_cmd_check "Build (web/extension/convex)" "bun run build"

run_http_check "Web Prod Reachability" "${SITE_URL}"
run_http_check "Web Dev Reachability" "${DEV_URL}"
run_http_check "Convex Reachability" "${CONVEX_URL}"

if [[ -n "${SMOKE_EMAIL:-}" && -n "${SMOKE_PASSWORD:-}" ]]; then
  add_row "Auth login/logout (web + extension)" "PENDING" "Credentials provided. Run manual smoke in docs/monorepo/SMOKE_CHECKLIST.md."
else
  add_row "Auth login/logout (web + extension)" "BLOCKED" "Set SMOKE_EMAIL and SMOKE_PASSWORD to execute authenticated manual smoke."
fi

add_row "Resume upload + extraction" "PENDING" "Manual scenario. See docs/monorepo/SMOKE_CHECKLIST.md."
add_row "Cover letter generation (form + extracted job)" "PENDING" "Manual scenario. See docs/monorepo/SMOKE_CHECKLIST.md."
add_row "Job applications CRUD" "PENDING" "Manual scenario. See docs/monorepo/SMOKE_CHECKLIST.md."
add_row "Billing checkout + cancel/reactivate" "PENDING" "Manual scenario. See docs/monorepo/SMOKE_CHECKLIST.md."
add_row "Contact/email verification flows" "PENDING" "Manual scenario. See docs/monorepo/SMOKE_CHECKLIST.md."

{
  echo "# Smoke Report"
  echo ""
  echo "- Generated (UTC): ${NOW_UTC}"
  echo "- Runner: $(hostname)"
  echo "- Report path: ${REPORT_PATH}"
  echo ""
  echo "| Scenario | Status | Details |"
  echo "|---|---|---|"
  for row in "${ROWS[@]}"; do
    echo "${row}"
  done
} > "${REPORT_PATH}"

echo "Smoke report written to ${REPORT_PATH}"
