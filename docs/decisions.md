# Decisions we made because nobody was there to ask

1. **Duplicates.** Sameer said some tickets appear twice from the migration re-import. 638 ticket IDs sit in both `helpdesk` and `legacy_fd`. We keep the helpdesk row. Amounts on the pair already agree once paise are converted.

2. **Legacy money is paise.** Sameer: "the legacy Freshdesk rows store money the way Freshdesk stored money." Policy §9: the legacy tool stored monetary values in its own native unit. 125 overlapping refund tickets are *exactly* ×100, every time. We divide `legacy_fd` amounts by 100. That is why Arjun sees a crore and Sameer sees 11 lakh.

3. **Do not hunt agents by rupees.** Returns Desk and Billing are supposed to process refunds. Policy §6 says so. A raw "who is giving away money" table would put Ritika D'Souza at the top and start the wrong conversation. We show agents inside their team, and we show rate and double-fill, not just rupees.

4. **The goal is double-fulfillment, not "cut refunds".** Refund rate is stable. Cutting refunds as a KPI would fight Priya's Q4 instruction and the Returns Desk's job. Paying twice on the same order is already forbidden (policy §5) and is still happening.

5. **Replacement cost = unit cost + Rs 340.** Policy §5. No refurbishment recovery.

6. **Wrong-item / wrong-colour has no official code.** We map it to `LOST-TRANSIT` (fulfillment failure). Documented so a later reader can disagree.

7. **CSAT blanks are excluded.** Policy §8. We never treat a blank as zero.

8. **No paid model.** A regex classifier over two text fields is enough to show the dropdown is the problem, and it runs on a clean machine with no keys. An LLM would be the next pass, not the first.

9. **Held-out labels are the published accuracy.** The development sample (69 tickets) was read while writing rules. We do not quote 96% as the proof. We quote 84% on 32 tickets labeled after the rules were frozen.

10. **Timestamps.** Display timestamps in the export look like IST wall-clock. We did not convert. First-response times are non-negative; we did not chase a timezone bug that is not in the refund question.

11. **What we left out.** Repeat-contact / FCR, SLA-credit P&L (Rs 350 × 1,060 breaches = Rs 3.7 lakh over 18 months — real, but a different owner), lot-level quality, Care Plus, a live LLM recoder, a helpdesk write-back. Five hours. The crore, the dropdown, and the double-fill were the board-pack items.
