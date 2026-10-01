# Push to your personal GitHub repo

Your empty repo: https://github.com/shwetgaur/vireo-refund-pac

The cloud agent has the full refund pack on `main` but **no GitHub token**, so it cannot push for you.

## Option 1 — GitHub CLI (easiest)

On your laptop, signed in as **shwetgaur**:

```bash
gh auth login
git clone https://origin.cursor.com/git/bridge-it-piyush/tmp-3f3961a28d6aaf35 vireo-refund-pack
cd vireo-refund-pack
bash scripts/publish-github.sh
```

Or clone from Cursor’s agent view if you have that URL.

## Option 2 — Push from Cursor Desktop

If this agent session is linked to your machine and you have `gh` authenticated:

```bash
cd /path/to/this/project
git remote add github https://github.com/shwetgaur/vireo-refund-pac.git
git push -u github main
```

## Option 3 — Rename the repo (optional)

GitHub → **Settings** → **General** → **Repository name** → change `vireo-refund-pac` to `vireo-refund-pack`, then update the remote URL before pushing.

## Verify

After push, these should load:

- https://github.com/shwetgaur/vireo-refund-pac/tree/main/README.md
- https://github.com/shwetgaur/vireo-refund-pac/tree/main/submission-form.md

Paste that URL into the Banao submission form.
