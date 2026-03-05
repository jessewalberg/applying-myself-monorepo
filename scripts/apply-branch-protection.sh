#!/usr/bin/env bash
set -euo pipefail

REPO_SLUG="${1:-}"
BRANCH="${2:-main}"

if [[ -z "${REPO_SLUG}" ]]; then
  if git remote get-url origin >/dev/null 2>&1; then
    ORIGIN_URL="$(git remote get-url origin)"
    REPO_SLUG="$(echo "${ORIGIN_URL}" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
  fi
fi

if [[ -z "${REPO_SLUG}" ]]; then
  echo "Usage: bash scripts/apply-branch-protection.sh <owner/repo> [branch]"
  echo "No origin remote found; pass owner/repo explicitly."
  exit 1
fi

gh auth status >/dev/null

TMP_PAYLOAD="$(mktemp)"
cat > "${TMP_PAYLOAD}" <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": [
      "Quality Gates",
      "Web Build",
      "Extension Build",
      "Convex Build"
    ]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "block_creations": false,
  "required_conversation_resolution": true,
  "lock_branch": false,
  "allow_fork_syncing": true
}
JSON

echo "Applying branch protection to ${REPO_SLUG}:${BRANCH} ..."
gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  "repos/${REPO_SLUG}/branches/${BRANCH}/protection" \
  --input "${TMP_PAYLOAD}" >/dev/null

rm -f "${TMP_PAYLOAD}"

echo "Branch protection applied."
echo "Required checks: Quality Gates, Web Build, Extension Build, Convex Build."
