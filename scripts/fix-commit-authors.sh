#!/usr/bin/env bash
# Rewrite all commits to your identity (removes cursoragent from GitHub Contributors).
# Usage: bash scripts/fix-commit-authors.sh personal|bridgeit
set -euo pipefail
cd "$(dirname "$0")/.."

PROFILE="${1:-personal}"
case "$PROFILE" in
  personal)
    NAME="Shwet Gaur"
    EMAIL="shwetgaur9@gmail.com"
    ;;
  bridgeit|work)
    NAME="Shwet Gaur"
    EMAIL="shwet@bridgeitapp.org"
    ;;
  *)
    echo "Usage: $0 personal|bridgeit"
    exit 1
    ;;
esac

echo "Rewriting all commits to: $NAME <$EMAIL>"
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --env-filter "
export GIT_AUTHOR_NAME='$NAME'
export GIT_AUTHOR_EMAIL='$EMAIL'
export GIT_COMMITTER_NAME='$NAME'
export GIT_COMMITTER_EMAIL='$EMAIL'
" -- --all

git config user.name "$NAME"
git config user.email "$EMAIL"
echo "Done. Verify: git log --format='%an <%ae>' | sort -u"
echo "Then: git push --force github main   (personal) or origin main (work)"
