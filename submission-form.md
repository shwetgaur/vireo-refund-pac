# Submission form — Vireo Audio, Task 1 V5 (Set C)

## What did you build, and what business outcome does it move? State the number and the money.

A local refund pack: Python cleans the helpdesk export (drop 638 re-imported tickets, convert Freshdesk paise to rupees), a regex classifier re-reads reason from the customer message and closing note, and a Next.js board pack shows monthly refunds by reason and by agent-inside-team, plus the double-fulfillment leak.

Outcome we are trying to move: **cut same-order refund-plus-replacement from Rs 1.84 lakh a quarter to under Rs 0.30 lakh, worth about Rs 1.5 lakh a quarter (Rs 6.1 lakh a year).**

The pack also replaces Arjun’s crore with the reconciled number: **Rs 12.8 lakh in Q2 2026**, Rs 67.1 lakh over 18 months, ~Rs 11.2 lakh a quarter.

## What does one run cost, and what would a month cost at Vireo's volume (roughly 650 tickets a week)? Show the arithmetic. If you used no paid calls, say so.

No paid calls. The classifier is local regex. One run: **Rs 0**. A month at 650 tickets/week: **0 × 650 × 4.3 = Rs 0**.

Cursor (Grok 4.6) was used to write the tool. That is a coding-assistant cost, not a per-ticket inference cost, and it is not billed per Vireo ticket.

## How do you know it works? Sample size, how you checked, error rate, and the kind of case it gets wrong.

**Cleaning (not a sample):** 125 tickets exist in both systems with a refund. Every pair is exactly ×100. 638 ticket IDs are exact duplicates across `helpdesk` and `legacy_fd`. After both fixes the quarterly total is Rs 11.2 lakh — Sameer’s figure.

**Reason classifier:** two human-labeled samples from message + note against policy §5, dropdown ignored when the text disagreed.

- Development, n = 69 (used to write rules): 96% vs 55% for the dropdown. Not proof.
- **Held-out, n = 32 (rules frozen): 84% vs 72% for the dropdown. 5 misses.**

It gets wrong: hardware tickets whose notes say “keep him happy” / “escalation avoided” (pulled to goodwill); wrong-item tickets the agent tagged “under DOA”; tickets whose only note is “cx ok”.

Double-fill flags are mechanical (`refund` present and `replacement_issued = Y`). They are as good as that field. Neha’s spot check already found the pattern.

## Did you change, narrow, or push back on the client's ask? What, when, and why.

Yes.

1. **Pushed back on “who is giving away money.”** Returns Desk and Billing exist to process refunds. A rupee league table would put those agents at the top and start a fight with CX. We show agents *inside* their team, plus rate and double-fill.
2. **Narrowed the goal.** Refund *rate* is stable at 18–22%. Rupees followed volume. We did not take “cut refunds” as the KPI. We took the thing policy already forbids: refund + replacement on the same order.
3. **Refused to put the dropdown in the pack as the reason view.** GW-OTHER is 43% of rupees and the first dropdown item. We still show it, then show the text-inferred view next to it.
4. **Reconciled before analysing.** Arjun’s crore and Sameer’s 11 lakh are the same data. The pack is useless until that is said out loud.

## What is wrong with what you are handing us? Be specific.

- Classifier is regex, not a model. Held-out 84% — it will mis-bucket goodwill-flavoured hardware tickets.
- Gold labels are one reader, not dual-annotated. Wrong-item → LOST-TRANSIT is a judgement call.
- `replacement_issued` is an agent flag. If they forget to tick it we under-count the leak; if they tick it and never ship we over-count.
- 798 refunds have no `order_id`. We still count the rupees; we cannot always join the unit cost. Replacement cost uses `product_sku` when present.
- 115 open/pending tickets already have a refund amount. We include them. Some may reverse.
- No timezone conversion. Export looks like IST wall-clock; we left it.
- No write-back to the helpdesk. This is a pack, not a control.
- Charts are pre-aggregated JSON. Changing a rule means re-running `python3 pipeline/analyze.py`.
- Screen recording of the *build* (prompts, versions thrown away) is a walkthrough of the tool plus `docs/build-notes.md`. I cannot honestly film a three-hour Cursor session after the fact.

## What did you deliberately leave out, and why that rather than something else?

Left out: repeat-contact / FCR, SLA-breach credits (1,060 × Rs 350 = Rs 3.7 lakh over 18 months), lot-level quality, Care Plus, a live LLM recoder, helpdesk write-back, agent coaching workflows.

Why those and not the crore / dropdown / double-fill: Arjun’s email and the board date. An 11-lakh hole in the pack, a reason column that is 43% “other”, and a policy already being broken. SLA credits are real money but they are an operations P&L line, not the refund question he asked. An LLM recoder is a week-two tool once they believe the number.

## Anything you built or found that nobody asked for?

- Priya’s “CSAT went up 0.4” is not in the file. CSAT went 3.54 → 3.46.
- Q4 frontline refund rupees did jump after “stop arguing”; the rate did not stay there as a new normal.
- Pulse 2 lots (PL2-2508-*) cluster in the refund list. Not a full quality case — a flag for Sameer.
- 39 refunds are almost exactly 2× retail (qty 2). Harmless, but easy to misread as a double payment.

## What did you use AI for? Which tools and models, where they helped, where they wasted your time, what you threw away. Link your three-minute screen recording here.

- **Cursor Grok 4.6** (this session): wrote the pipeline, dashboard, memo. Helped: scaffolding, regex, layout. Wasted: first pass wanted an LLM classifier and a generic SaaS shell — thrown away for a local regex + a board-pack page.
- **No paid inference API** on tickets.
- Thrown away: a plan to embed every ticket in a vector store; a “chat with your refunds” box; ranking agents by rupees on the home page; treating GW-OTHER > Rs 500 as recoverable savings (most of those are miscoded real refunds — capping them would be wrong).
- Screen recording: `docs/walkthrough.mp4` in this repo (and the Preview walkthrough). Upload to Drive and paste the link on the ATS form. Public Drive link: *add after upload*.

## Someone picks this up on Monday and you are unreachable. The three things they need to know.

1. Run `python3 pipeline/analyze.py` then `npm run dev`. Data lives in `data/`. Do not sum `refund_amount_inr` raw.
2. The board number is **Rs 12.8 lakh in Q2 2026**. The crore is paise + duplicates. Proof: 125 paired refunds, all ×100.
3. Do not send Arjun an agent league table. Open `/agents` (grouped by team) and `/flags` (the leak). Decisions are in `docs/decisions.md`.

## Honest hours spent. One number.

5

## Github Repo Link

https://github.com/shwetgaur/vireo-refund-pac

(Personal account **shwetgaur**, not BridgeIT. Repo was created empty — push with the command below. Rename to `vireo-refund-pack` in GitHub Settings if you want the exact name from the brief.)
