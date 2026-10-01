#!/usr/bin/env bash
# Create github.com/shwetgaur/vireo-refund-pack and push main.
# Needs: gh auth login (personal account) OR GITHUB_TOKEN with repo scope.
set -euo pipefail
cd "$(dirname "$0")/.."

# GitHub repo (rename to vireo-refund-pack in Settings if you created vireo-refund-pac)
REPO="${GITHUB_REPO:-shwetgaur/vireo-refund-pac}"
BRANCH="main"

if ! command -v gh >/dev/null; then
  echo "Install GitHub CLI: https://cli.github.com/"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    echo "Run: gh auth login   (pick personal account shwetgaur, not an org)"
    echo "Or set GITHUB_TOKEN with repo scope."
    exit 1
  fi
  echo "$GITHUB_TOKEN" | gh auth login --with-token
fi

echo "Logged in as: $(gh api user -q .login)"
LOGIN=$(gh api user -q .login)
if [[ "$LOGIN" != "shwetgaur" ]]; then
  echo "Warning: active gh user is '$LOGIN', expected shwetgaur."
  read -r -p "Continue anyway? [y/N] " ans
  [[ "${ans,,}" == y ]] || exit 1
fi

if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "Repo exists: https://github.com/$REPO"
else
  gh repo create "$REPO" --public --source=. --remote=github --push=false \
    --description "Vireo Audio refund pack — clean export, reason inference, board UI (Banao task)"
  echo "Created https://github.com/$REPO"
fi

git remote remove github 2>/dev/null || true
git remote add github "https://github.com/$REPO.git"
git push -u github "$BRANCH"
echo "Done: https://github.com/$REPO"
