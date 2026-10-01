#!/usr/bin/env python3
"""Vireo refund pack — clean the export, infer reason, flag policy leaks.

Run from repo root:  python3 pipeline/analyze.py
Writes public/data/board.json for the dashboard.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
OUT = ROOT / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)

REASON_ORDER = [
    "GW-OTHER",
    "RETURN-QC-OK",
    "DUP-PAYMENT",
    "CANCEL",
    "DOA-REPL",
    "WTY-BUYBACK",
    "PRICE-ADJ",
    "LOST-TRANSIT",
]

REASON_LABELS = {
    "GW-OTHER": "Goodwill / Other",
    "RETURN-QC-OK": "Return received, QC passed",
    "DUP-PAYMENT": "Duplicate / failed payment",
    "CANCEL": "Cancelled before dispatch",
    "DOA-REPL": "Dead on arrival (refund)",
    "WTY-BUYBACK": "Warranty buy-back",
    "PRICE-ADJ": "Price / coupon adjustment",
    "LOST-TRANSIT": "Lost or undelivered",
    "UNCLEAR": "Unclear from text",
}

# First match wins. More specific operational reasons before GW-OTHER.
# Wrong-item / wrong-colour is treated as fulfillment failure → LOST-TRANSIT
# (no official code; decision recorded in docs/decisions.md).
RULES: list[tuple[str, list[str]]] = [
    (
        "DUP-PAYMENT",
        [
            r"amount deducted without",
            r"failed order after payment",
            r"payment (debited|went through).{0,50}no order",
            r"upi shows success",
            r"double charg",
            r"charged twice",
            r"i was charged twice",
            r"duplicate (txn|payment|charge)",
            r"no order confirmation",
            r"no order id",
            r"app shows nothing",
            r"site says i have no orders",
            r"your (site|app) says i have no",
            r"page failed after i p",
            r"conf(irmed)? with payment gateway",
            r"checked pg dashboard",
            r"asked for utr",
        ],
    ),
    (
        "CANCEL",
        [
            r"cancel(led|lation)? before dispatch",
            r"please cancel",
            r"pls cancel",
            r"want to cancel",
            r"cancel(led)?,? refund",
            r"change of mind",
            r"stop the shipment",
            r"ordered by mistake",
            r"son ordered this",
            r"don'?t ship",
            r"wrong colou?r, don'?t ship",
            r"cancellation request",
            r"cancel(led)? (the )?ord",
        ],
    ),
    (
        "PRICE-ADJ",
        [
            r"coupon",
            r"promo code",
            r"discount not applied",
            r"discount was not applied",
            r"20%\s*off",
            r"store credit issued",
            r"price match",
            r"charged extra",
            r"overcharged",
        ],
    ),
    (
        "DOA-REPL",
        [
            r"dead on arrival",
            r"\bdoa\b",
            r"received damaged",
            r"unit rcvd damaged",
            r"arrived (damaged|broken|dead|defective)",
            r"damaged in transit",
            r"transit damage",
            r"box was (empty|open|crushed|damaged)",
            r"has a crack",
            r"is cracked",
            r"parcel looked like",
            r"screen has a crack",
            r"photos (received|rcvd), damage",
        ],
    ),
    (
        "LOST-TRANSIT",
        [
            r"lost in transit",
            r"not (been )?delivered",
            r"never delivered",
            r"nothing in hand",
            r"tracking not updat",
            r"order not delivered",
            r"shipment not r",
            r"stuck on s[hi]+pped",
            r"out for delivery for a week",
            r"incorrect product shipped",
            r"wrong item",
            r"different colou?r than",
            r"what'?s inside is not",
            r"received teh wrong item",
            r"received the wrong item",
        ],
    ),
    (
        "RETURN-QC-OK",
        [
            r"reverse (pickup|pkp|pckup|pckp)",
            r"return (was )?accepted",
            r"return pickup",
            r"pickup (missed|pending|not done|scheduled|rescheduled)",
            r"pkp not done",
            r"refund not credited",
            r"still waiting for my refund",
            r"picked up the item",
            r"reverse pickup qc",
            r"refund (was )?promised",
            r"refund delay",
            r"refund pending",
            r"rfnd delay",
            r"rfnd not credited",
            r"you picked up",
            r"sitting at home for .{0,12}waiting for your courier",
        ],
    ),
    (
        "WTY-BUYBACK",
        [
            r"warranty (claim|buy|eligib)",
            r"\brma\b",
            r"repair status",
            r"buy.?back",
            r"out of warranty",
            r"left (ear)?bud not (taking )?charg",
            r"not charging at all",
            r"rapid bat[te]ry drain",
            r"band snapped",
            r"strap damage",
            r"speaker not powering",
            r"no sound from the",
            r"mic(rophone)? (is )?(very )?low",
            r"cannot pair",
            r"unable to pair",
            r"device not discoverable",
            r"bluetooth keeps cutting",
            r"connection dropping",
            r"sound stutters",
            r"expensive brick",
            r"no lights, no sound",
        ],
    ),
    (
        "GW-OTHER",
        [
            r"goodwill",
            r"as a (one-time )?gesture",
            r"one-time gesture",
            r"keep him happy",
            r"escalation avoided",
            r"threatened social media",
            r"cx was very upset",
            r"courtesy",
        ],
    ),
]

COMPILED = [(code, [re.compile(p, re.I) for p in pats]) for code, pats in RULES]


def inr(n: float) -> int:
    return int(round(float(n)))


def infer_reason(customer_message: str, agent_notes: str) -> tuple[str, float, list[str]]:
    text = f"{customer_message or ''} \n {agent_notes or ''}"
    hits: list[str] = []
    for code, patterns in COMPILED:
        matched = [p.pattern for p in patterns if p.search(text)]
        if matched:
            # First operational bucket that fires, except GW which is last.
            confidence = min(0.95, 0.62 + 0.08 * len(matched))
            return code, confidence, matched[:3]
    return "UNCLEAR", 0.25, []


def load_tables() -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    tickets = pd.read_csv(DATA / "tickets.csv")
    agents = pd.read_csv(DATA / "agents.csv")
    orders = pd.read_csv(DATA / "orders.csv")
    products = pd.read_csv(DATA / "products.csv")
    customers = pd.read_csv(DATA / "customers.csv")
    return tickets, agents, orders, products, customers


def clean_tickets(tickets: pd.DataFrame) -> tuple[pd.DataFrame, dict]:
    raw = tickets.copy()
    raw["refund_raw"] = pd.to_numeric(raw["refund_amount_inr"], errors="coerce")
    raw["created_at"] = pd.to_datetime(raw["created_at"])
    raw["first_response_at"] = pd.to_datetime(raw["first_response_at"], errors="coerce")
    raw["resolved_at"] = pd.to_datetime(raw["resolved_at"], errors="coerce")
    raw["csat_score"] = pd.to_numeric(raw["csat_score"], errors="coerce")
    raw["transfers"] = pd.to_numeric(raw["transfers"], errors="coerce")

    naive_sum = float(raw["refund_raw"].fillna(0).sum())
    dup_ids = raw["ticket_id"][raw["ticket_id"].duplicated(keep=False)]
    n_dup_rows = int(dup_ids.shape[0])
    n_dup_ids = int(dup_ids.nunique())

    # Prefer the current helpdesk row when a ticket was re-imported.
    raw["_pref"] = (raw["source_system"] == "helpdesk").astype(int)
    dedup = (
        raw.sort_values(["ticket_id", "_pref"], ascending=[True, False])
        .drop_duplicates("ticket_id", keep="first")
        .copy()
    )

    # Freshdesk stored paise. Verified: 125 overlapping refunds are exactly ×100.
    pairs = raw[raw["ticket_id"].isin(dup_ids.unique())].pivot_table(
        index="ticket_id", columns="source_system", values="refund_raw", aggfunc="first"
    )
    both = pairs.dropna() if not pairs.empty else pd.DataFrame()
    n_paired_refunds = int(len(both))
    ratio_ok = 0
    if n_paired_refunds and "legacy_fd" in both.columns and "helpdesk" in both.columns:
        ratio = both["legacy_fd"] / both["helpdesk"]
        ratio_ok = int((np.isclose(ratio, 100)).sum())

    dedup["refund_inr"] = np.where(
        dedup["source_system"] == "legacy_fd",
        dedup["refund_raw"] / 100.0,
        dedup["refund_raw"],
    )
    dedup["is_refund"] = dedup["refund_inr"].fillna(0) > 0
    dedup["month"] = dedup["created_at"].dt.strftime("%Y-%m")
    dedup["quarter"] = dedup["created_at"].dt.to_period("Q").astype(str)

    audit = {
        "raw_rows": int(len(raw)),
        "unique_tickets": int(len(dedup)),
        "duplicate_ticket_ids": n_dup_ids,
        "duplicate_rows_dropped": n_dup_rows - n_dup_ids,
        "naive_refund_sum_inr": inr(naive_sum),
        "helpdesk_raw_sum_inr": inr(raw.loc[raw.source_system == "helpdesk", "refund_raw"].fillna(0).sum()),
        "legacy_raw_sum_inr": inr(raw.loc[raw.source_system == "legacy_fd", "refund_raw"].fillna(0).sum()),
        "paired_refund_tickets": n_paired_refunds,
        "paired_exact_x100": ratio_ok,
        "clean_refund_sum_inr": inr(dedup["refund_inr"].fillna(0).sum()),
        "clean_refund_tickets": int(dedup["is_refund"].sum()),
    }
    return dedup, audit


def roster_latest(agents: pd.DataFrame) -> pd.DataFrame:
    a = agents.copy()
    a["from_date"] = pd.to_datetime(a["from_date"], errors="coerce")
    return a.sort_values("from_date").drop_duplicates("agent_id", keep="last")


def classify(dedup: pd.DataFrame) -> pd.DataFrame:
    inferred = []
    confs = []
    evidence = []
    for row in dedup.itertuples(index=False):
        if not row.is_refund:
            inferred.append(None)
            confs.append(None)
            evidence.append([])
            continue
        code, conf, ev = infer_reason(row.customer_message, row.agent_notes)
        inferred.append(code)
        confs.append(conf)
        evidence.append(ev)
    out = dedup.copy()
    out["inferred_reason"] = inferred
    out["infer_confidence"] = confs
    out["infer_evidence"] = evidence
    # Working reason: inferred when we have a hit, otherwise the dropdown.
    out["working_reason"] = np.where(
        out["inferred_reason"].isin([None, "UNCLEAR"]),
        out["refund_reason_code"],
        out["inferred_reason"],
    )
    return out


def _score_labels(refunds: pd.DataFrame, labels: dict[str, str]) -> dict:
    rows = []
    for tid, label in labels.items():
        hit = refunds[refunds["ticket_id"] == tid]
        if hit.empty:
            continue
        row = hit.iloc[0]
        pred = row["inferred_reason"]
        rows.append(
            {
                "ticket_id": tid,
                "gold": label,
                "predicted": pred,
                "dropdown": row["refund_reason_code"],
                "correct": pred == label,
                "dropdown_correct": row["refund_reason_code"] == label,
                "amount_inr": inr(row["refund_inr"]),
            }
        )
    ev = pd.DataFrame(rows)
    n = len(ev)
    by_gold = {}
    if n:
        for code, g in ev.groupby("gold"):
            by_gold[code] = {
                "n": int(len(g)),
                "accuracy": round(float(g["correct"].mean()), 3),
            }
    errors = ev[~ev["correct"]] if n else ev
    error_kinds = []
    if n and len(errors):
        error_kinds = (
            errors.groupby(["gold", "predicted"])
            .size()
            .reset_index(name="n")
            .sort_values("n", ascending=False)
            .head(8)
            .to_dict(orient="records")
        )
    return {
        "n": n,
        "classifier_accuracy": round(float(ev["correct"].mean()), 3) if n else 0,
        "dropdown_accuracy_vs_gold": round(float(ev["dropdown_correct"].mean()), 3) if n else 0,
        "unclear_rate": round(float((ev["predicted"] == "UNCLEAR").mean()), 3) if n else 0,
        "error_count": int((~ev["correct"]).sum()) if n else 0,
        "by_gold_reason": by_gold,
        "error_kinds": error_kinds,
        "sample_errors": errors.to_dict(orient="records") if n else [],
    }


def evaluate(refunds: pd.DataFrame) -> dict:
    dev = json.loads(Path(__file__).with_name("gold_labels.json").read_text())["labels"]
    held = json.loads(Path(__file__).with_name("heldout_labels.json").read_text())["labels"]
    dev_score = _score_labels(refunds, dev)
    held_score = _score_labels(refunds, held)
    return {
        "gold_n": held_score["n"],
        "classifier_accuracy": held_score["classifier_accuracy"],
        "dropdown_accuracy_vs_gold": held_score["dropdown_accuracy_vs_gold"],
        "unclear_rate": held_score["unclear_rate"],
        "error_count": held_score["error_count"],
        "by_gold_reason": held_score["by_gold_reason"],
        "error_kinds": held_score["error_kinds"],
        "sample_errors": held_score["sample_errors"],
        "dev_sample": {
            "n": dev_score["n"],
            "classifier_accuracy": dev_score["classifier_accuracy"],
            "dropdown_accuracy_vs_gold": dev_score["dropdown_accuracy_vs_gold"],
            "note": "Rules were written while reading this sample. Treat as development, not proof.",
        },
        "held_out": held_score,
        "method": (
            "Two samples, both labeled from customer message + closing note against policy §5. "
            "Dropdown ignored when the text named a different event. "
            f"Development n={dev_score['n']} (used to write rules): "
            f"{dev_score['classifier_accuracy']:.0%} classifier vs {dev_score['dropdown_accuracy_vs_gold']:.0%} dropdown. "
            f"Held-out n={held_score['n']} (frozen rules): "
            f"{held_score['classifier_accuracy']:.0%} classifier vs {held_score['dropdown_accuracy_vs_gold']:.0%} dropdown. "
            "Wrong-item / wrong-colour mapped to LOST-TRANSIT (no official code). "
            "Cleaning check is separate: 125 dual-source refunds are exactly ×100 paise."
        ),
    }


def monthly_frame(df: pd.DataFrame, reason_col: str) -> list[dict]:
    months = sorted(df["month"].unique())
    out = []
    for m in months:
        chunk = df[df["month"] == m]
        rec = {
            "month": m,
            "tickets": int(len(chunk)),
            "refund_tickets": int(chunk["is_refund"].sum()),
            "refund_inr": inr(chunk["refund_inr"].fillna(0).sum()),
            "csat": (
                round(float(chunk["csat_score"].mean()), 2)
                if chunk["csat_score"].notna().any()
                else None
            ),
            "double_dip": int(((chunk["is_refund"]) & (chunk["replacement_issued"] == "Y")).sum()),
            "by_reason": {},
        }
        refunds = chunk[chunk["is_refund"]]
        for code, g in refunds.groupby(reason_col):
            if pd.isna(code):
                continue
            rec["by_reason"][str(code)] = {
                "tickets": int(len(g)),
                "inr": inr(g["refund_inr"].sum()),
            }
        out.append(rec)
    return out


def build_board() -> dict:
    tickets, agents, orders, products, customers = load_tables()
    dedup, audit = clean_tickets(tickets)
    dedup = classify(dedup)
    roster = roster_latest(agents)
    dedup = dedup.merge(
        roster[["agent_id", "name", "site", "team", "shift", "tier"]],
        on="agent_id",
        how="left",
    )
    dedup = dedup.merge(
        products[["sku", "product_name", "family", "unit_cost_inr", "retail_price_inr"]],
        left_on="product_sku",
        right_on="sku",
        how="left",
    )
    refunds = dedup[dedup["is_refund"]].copy()
    refunds["repl_cost_inr"] = refunds["unit_cost_inr"].fillna(0) + 340
    refunds["double_dip"] = refunds["replacement_issued"] == "Y"
    refunds["gw_over_cap"] = (refunds["refund_reason_code"] == "GW-OTHER") & (
        refunds["refund_inr"] > 500
    )

    eval_block = evaluate(refunds)

    latest_q = sorted(dedup["quarter"].unique())[-1]
    latest = refunds[refunds["quarter"] == latest_q]
    h1_2026 = refunds[refunds["created_at"] >= "2026-01-01"]
    q1_2025 = refunds[refunds["quarter"] == "2025Q1"]

    dd = refunds[refunds["double_dip"]]
    dd_latest = latest[latest["double_dip"]]
    dd_h1 = h1_2026[h1_2026["double_dip"]]

    # Goal arithmetic (H1 2026 run-rate, two quarters)
    leak_h1_refund = float(dd_h1["refund_inr"].sum())
    leak_h1_repl = float(dd_h1["repl_cost_inr"].sum())
    leak_h1 = leak_h1_refund + leak_h1_repl
    leak_q = leak_h1 / 2.0

    quarterly = []
    for q, g in refunds.groupby("quarter"):
        tickets_q = dedup[dedup["quarter"] == q]
        ddg = g[g["double_dip"]]
        quarterly.append(
            {
                "quarter": q,
                "tickets": int(len(tickets_q)),
                "refund_tickets": int(len(g)),
                "refund_inr": inr(g["refund_inr"].sum()),
                "refund_rate": round(len(g) / len(tickets_q), 3),
                "csat": round(float(tickets_q["csat_score"].mean()), 2),
                "gw_share": round(
                    float(g.loc[g.refund_reason_code == "GW-OTHER", "refund_inr"].sum())
                    / float(g["refund_inr"].sum()),
                    3,
                ),
                "double_dip_tickets": int(len(ddg)),
                "double_dip_refund_inr": inr(ddg["refund_inr"].sum()),
                "double_dip_repl_cost_inr": inr(ddg["repl_cost_inr"].sum()),
            }
        )

    agent_rows = []
    for aid, g in refunds.groupby("agent_id"):
        vol = dedup[dedup["agent_id"] == aid]
        rec = {
            "agent_id": aid,
            "name": g["name"].iloc[0] if pd.notna(g["name"].iloc[0]) else aid,
            "site": None if pd.isna(g["site"].iloc[0]) else g["site"].iloc[0],
            "team": None if pd.isna(g["team"].iloc[0]) else g["team"].iloc[0],
            "tier": None if pd.isna(g["tier"].iloc[0]) else int(g["tier"].iloc[0]),
            "tickets": int(len(vol)),
            "refund_tickets": int(len(g)),
            "refund_inr": inr(g["refund_inr"].sum()),
            "refund_rate": round(len(g) / max(len(vol), 1), 3),
            "double_dip": int(g["double_dip"].sum()),
            "gw_other_inr": inr(g.loc[g.refund_reason_code == "GW-OTHER", "refund_inr"].sum()),
            "csat": (
                round(float(vol["csat_score"].mean()), 2)
                if vol["csat_score"].notna().any()
                else None
            ),
        }
        agent_rows.append(rec)
    agent_rows.sort(key=lambda x: -x["refund_inr"])

    team_rows = []
    for team, g in refunds.groupby("assigned_team"):
        vol = dedup[dedup["assigned_team"] == team]
        team_rows.append(
            {
                "team": team,
                "tickets": int(len(vol)),
                "refund_tickets": int(len(g)),
                "refund_inr": inr(g["refund_inr"].sum()),
                "refund_rate": round(len(g) / max(len(vol), 1), 3),
                "double_dip": int(g["double_dip"].sum()),
            }
        )
    team_rows.sort(key=lambda x: -x["refund_inr"])

    def reason_break(frame: pd.DataFrame, col: str) -> list[dict]:
        rows = []
        for code in REASON_ORDER:
            g = frame[frame[col] == code]
            rows.append(
                {
                    "code": code,
                    "label": REASON_LABELS[code],
                    "tickets": int(len(g)),
                    "inr": inr(g["refund_inr"].sum()) if len(g) else 0,
                }
            )
        return rows

    flags = []
    for row in dd.sort_values("refund_inr", ascending=False).head(80).itertuples():
        flags.append(
            {
                "ticket_id": row.ticket_id,
                "month": row.month,
                "agent": row.name if pd.notna(row.name) else row.agent_id,
                "team": row.assigned_team,
                "dropdown": row.refund_reason_code,
                "inferred": row.inferred_reason,
                "refund_inr": inr(row.refund_inr),
                "repl_cost_inr": inr(row.repl_cost_inr),
                "product": row.product_name if pd.notna(row.product_name) else row.product_sku,
                "note": (str(row.agent_notes) or "")[:220],
                "customer": (str(row.customer_message) or "").replace("\n", " ")[:180],
            }
        )

    # Recode lift: GW-OTHER tickets the classifier moved
    gw = refunds[refunds["refund_reason_code"] == "GW-OTHER"]
    recoded = gw[~gw["inferred_reason"].isin(["GW-OTHER", "UNCLEAR", None])]
    recode_by = []
    for code, g in recoded.groupby("inferred_reason"):
        recode_by.append(
            {"code": code, "label": REASON_LABELS.get(code, code), "tickets": int(len(g)), "inr": inr(g["refund_inr"].sum())}
        )
    recode_by.sort(key=lambda x: -x["inr"])

    board = {
        "generated_from": "pipeline/analyze.py",
        "window": "2025-01-01 to 2026-06-30",
        "decisions": [
            "Treat duplicate ticket_id rows as one ticket; keep the helpdesk copy.",
            "Divide legacy_fd refund_amount_inr by 100 (Freshdesk paise). 125 dual-source refunds are exactly ×100.",
            "Do not rank agents by rupees without the team. Returns Desk is supposed to refund.",
            "Wrong-item / wrong-colour mapped to LOST-TRANSIT — no official code exists.",
            "Double-fulfillment leak = refund posted + (unit cost + Rs 340 shipping).",
            "CSAT blanks excluded from averages (policy §8).",
        ],
        "reconciliation": {
            **audit,
            "sameer_helpdesk_quarterly_inr": 1100000,
            "clean_avg_quarter_inr": inr(audit["clean_refund_sum_inr"] / 6),
            "latest_quarter": latest_q,
            "latest_quarter_inr": inr(latest["refund_inr"].sum()),
            "note": (
                "Arjun's crore is the raw export: Freshdesk paise plus 638 re-imported tickets. "
                "After both fixes the 18-month total is Rs 67.1 lakh — about Rs 11.2 lakh a quarter, "
                "which matches Sameer's helpdesk report."
            ),
        },
        "goal": {
            "statement": (
                "Cut same-order refund-plus-replacement from Rs 1.84 lakh a quarter "
                "to under Rs 0.30 lakh, worth about Rs 1.5 lakh a quarter "
                "(Rs 6.1 lakh a year)."
            ),
            "baseline_quarter_inr": inr(leak_q),
            "target_quarter_inr": 30000,
            "save_quarter_inr": inr(leak_q - 30000),
            "save_year_inr": inr((leak_q - 30000) * 4),
            "arithmetic": (
                f"2026 H1: {int(len(dd_h1))} double-filled tickets, "
                f"Rs {inr(leak_h1_refund):,} refunded plus Rs {inr(leak_h1_repl):,} "
                f"in replacement cost (unit cost + Rs 340) = Rs {inr(leak_h1):,} / 2 "
                f"= Rs {inr(leak_q):,} a quarter. Target ≤ Rs 30,000 residual."
            ),
            "why_this_not_agent_league": (
                "Refund rate has sat at 18–22% for 18 months. Rupees went up because "
                "ticket volume went up. Returns Desk refunds ~50% of its tickets — that is the job. "
                "The money you can actually stop is paying twice on the same order."
            ),
        },
        "kpis": {
            "clean_total_inr": audit["clean_refund_sum_inr"],
            "clean_refund_tickets": audit["clean_refund_tickets"],
            "latest_quarter": latest_q,
            "latest_quarter_inr": inr(latest["refund_inr"].sum()),
            "latest_quarter_tickets": int(len(latest)),
            "avg_quarter_inr": inr(audit["clean_refund_sum_inr"] / 6),
            "q1_2025_inr": inr(q1_2025["refund_inr"].sum()),
            "refund_rate_18m": round(float(dedup["is_refund"].mean()), 3),
            "gw_share_inr": round(
                float(refunds.loc[refunds.refund_reason_code == "GW-OTHER", "refund_inr"].sum())
                / float(refunds["refund_inr"].sum()),
                3,
            ),
            "gw_tickets": int((refunds["refund_reason_code"] == "GW-OTHER").sum()),
            "gw_over_cap_tickets": int(refunds["gw_over_cap"].sum()),
            "gw_over_cap_inr": inr(refunds.loc[refunds["gw_over_cap"], "refund_inr"].sum()),
            "double_dip_tickets": int(len(dd)),
            "double_dip_refund_inr": inr(dd["refund_inr"].sum()),
            "double_dip_repl_cost_inr": inr(dd["repl_cost_inr"].sum()),
            "double_dip_combined_inr": inr(dd["refund_inr"].sum() + dd["repl_cost_inr"].sum()),
            "csat_overall": round(float(dedup["csat_score"].mean()), 2),
            "csat_q1_2025": round(
                float(dedup.loc[dedup.quarter == "2025Q1", "csat_score"].mean()), 2
            ),
            "csat_latest": round(
                float(dedup.loc[dedup.quarter == latest_q, "csat_score"].mean()), 2
            ),
            "reclassified_gw_tickets": int(len(recoded)),
            "reclassified_gw_inr": inr(recoded["refund_inr"].sum()),
        },
        "quarters": quarterly,
        "monthly_dropdown": monthly_frame(dedup, "refund_reason_code"),
        "monthly_working": monthly_frame(dedup, "working_reason"),
        "reason_dropdown": reason_break(refunds, "refund_reason_code"),
        "reason_working": reason_break(refunds, "working_reason"),
        "reclassified_from_gw": recode_by,
        "teams": team_rows,
        "agents": agent_rows,
        "flags": flags,
        "evaluation": eval_block,
        "cost": {
            "model": "none — rule classifier, no paid API",
            "one_run_inr": 0,
            "month_at_650_tickets_week_inr": 0,
            "arithmetic": "0 × 650 tickets × 4.3 weeks = Rs 0. Pipeline is local regex over two text fields.",
        },
    }
    return board


def main() -> None:
    board = build_board()
    path = OUT / "board.json"
    path.write_text(json.dumps(board, indent=2))
    print(f"wrote {path} ({path.stat().st_size // 1024} KB)")
    print("clean refunds", board["kpis"]["clean_total_inr"], "n", board["kpis"]["clean_refund_tickets"])
    print("eval", board["evaluation"]["gold_n"], "acc", board["evaluation"]["classifier_accuracy"],
          "dropdown", board["evaluation"]["dropdown_accuracy_vs_gold"])
    print("goal", board["goal"]["statement"])


if __name__ == "__main__":
    main()
