# Vireo Audio — refund pack

A working board pack for Vireo’s Finance Controller. It takes the messy helpdesk export, puts a number on the page that reconciles, and shows **who / how much / what for** without ranking Returns Desk agents as if they were giving money away.

**The number:** refunds are **Rs 12.8 lakh in Q2 2026** (Rs 67.1 lakh over 18 months, ~Rs 11.2 lakh a quarter). The crore in the raw export is Freshdesk paise plus 638 re-imported tickets.

**The outcome we would move:** cut same-order refund-plus-replacement from **Rs 1.84 lakh a quarter to under Rs 0.30 lakh** — about **Rs 1.5 lakh a quarter**, **Rs 6 lakh a year**.

## What you need

- Python 3.11+
- Node 20+
- The files in `data/` (already in this repo)

No API keys.

## Run it

```bash
python3 -m pip install -r requirements.txt
python3 pipeline/analyze.py
npm install
npm run dev
```

Open [http://127.0.0.1:43147](http://127.0.0.1:43147).

- `/` — monthly pack, reconciliation, reason split
- `/agents` — agents inside their team
- `/flags` — refund + replacement on the same ticket
- `/evaluation` — how we checked the number
- `/memo` — one page for Arjun Mehta

`public/data/board.json` is already generated. You can skip the Python step unless you change the rules.

## What it does

1. Drops duplicate ticket IDs (keep the current helpdesk row).
2. Divides `legacy_fd` refund amounts by 100 (paise). 125 overlapping refunds are exactly ×100.
3. Infers a reason code from the customer message and the agent’s closing note.
4. Flags tickets that posted a refund *and* a replacement (policy §5).
5. Writes a board JSON the site reads. No paid model calls.

## Read next

- `docs/memo-arjun-mehta.md` — the memo
- `docs/decisions.md` — what we decided when the brief was unclear
- `submission-form.md` — the ATS answers
- `data/README.txt` and `data/support-policy.pdf` — the pack

## Cost

Rs 0 per run. Rs 0 per month at 650 tickets a week. The classifier is local regex.

## Publish to GitHub (personal)

Repo: **https://github.com/shwetgaur/vireo-refund-pac** (rename to `vireo-refund-pack` in GitHub Settings if you prefer)

The cloud agent cannot push without your GitHub login. From a machine where `gh auth login` is signed in as **shwetgaur**:

```bash
bash scripts/publish-github.sh
```

Or, if you already have this tree:

```bash
git remote add github https://github.com/shwetgaur/vireo-refund-pac.git
git push -u github main
```
