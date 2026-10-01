# Git identity: personal vs BridgeIT, no cursoragent

GitHub **Contributors** comes from the **Author** on each commit — not from Cursor’s “Commit Attribution” toggle. Cloud Agents commit as `Cursor Agent <cursoragent@cursor.com>` unless you fix history before/after push.

## Your rule

| Project type | Git email |
|---|---|
| Personal (e.g. `shwetgaur/*`) | `shwetgaur9@gmail.com` |
| BridgeIT / work | `shwet@bridgeitapp.org` |
| Never | `cursoragent@cursor.com` |

---

## One-time setup on your laptop

Edit **`~/.gitconfig`**:

```gitconfig
[user]
    name = Shwet Gaur
    email = shwet@bridgeitapp.org

# Personal repos — adjust paths to where you keep them
[includeIf "gitdir:~/personal/"]
    path = ~/.gitconfig-personal

[includeIf "gitdir:~/Projects/personal/"]
    path = ~/.gitconfig-personal

# This repo if cloned under a personal folder
[includeIf "gitdir:~/vireo-refund-pac/"]
    path = ~/.gitconfig-personal
```

Create **`~/.gitconfig-personal`**:

```gitconfig
[user]
    name = Shwet Gaur
    email = shwetgaur9@gmail.com
```

Verify inside a repo:

```bash
git config user.email
# personal folder → shwetgaur9@gmail.com
# work folder     → shwet@bridgeitapp.org
```

Add **`shwetgaur9@gmail.com`** on GitHub → **Settings → Emails** and verify it, or GitHub may not link commits to your profile.

---

## This repo (personal)

Local identity for this clone:

```bash
git config user.name "Shwet Gaur"
git config user.email "shwetgaur9@gmail.com"
```

Rewrite old cursoragent commits and force push:

```bash
bash scripts/fix-commit-authors.sh personal
git push --force github main
```

---

## After a Cloud Agent run

Agents push as **cursoragent**. Before you submit or merge:

```bash
bash scripts/fix-commit-authors.sh personal   # or bridgeit
git push --force github main
```

Or only fix the last commit:

```bash
git commit --amend --author="Shwet Gaur <shwetgaur9@gmail.com>" --no-edit
git push --force github main
```

---

## Cursor settings (your screenshot)

| Setting | Effect |
|---|---|
| Commit Attribution **off** | No “Made with Cursor” extra marker |
| PR Attribution **off** | PR badge only |
| Branch prefix `cursor/` | Branch names only |

None of these change the git **Author** line. That is why **cursoragent** still appeared on GitHub.

---

## BridgeIT repos

In a BridgeIT clone:

```bash
git config user.email "shwet@bridgeitapp.org"
bash scripts/fix-commit-authors.sh bridgeit
```
