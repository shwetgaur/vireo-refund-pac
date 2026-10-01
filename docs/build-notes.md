# Build notes — what we used, changed, and threw away

For the three-minute walkthrough (no slides).

## Prompts / tools

- Cursor Grok 4.6 to write the pipeline and the board-pack site.
- No ticket sent to an LLM API. Reason codes are regex over `customer_message` + `agent_notes`.
- pandas for the join/clean. Next.js + shadcn for the pack.

## Versions

1. **First instinct, thrown away:** embed every ticket, chat box, paid classifier. Five hours and a clean-machine constraint. A small thing that runs.
2. **Second instinct, thrown away:** home page as an agent rupee league table. That is what Arjun asked for and it would have been wrong. Returns Desk would have been “the problem”.
3. **Third instinct, thrown away:** treat every GW-OTHER over Rs 500 as recoverable savings. Most of those tickets are miscoded real refunds. Capping them is not a saving; it is a denial.
4. **What shipped:** clean the export, prove the crore, re-read reasons, flag double-fill, write the memo.

## What we kept looking at

- Sameer’s note on Freshdesk money and re-imports.
- Policy §5 (no refund + replacement) and §9 (legacy units).
- Priya’s CSAT claim vs the actual scores.
- Held-out labels *after* the rules were frozen, so we would not quote 96%.
