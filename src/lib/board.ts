import { readFileSync } from "fs";
import { join } from "path";

export type ReasonRow = {
  code: string;
  label: string;
  tickets: number;
  inr: number;
};

export type MonthRow = {
  month: string;
  tickets: number;
  refund_tickets: number;
  refund_inr: number;
  csat: number | null;
  double_dip: number;
  by_reason: Record<string, { tickets: number; inr: number }>;
};

export type AgentRow = {
  agent_id: string;
  name: string;
  site: string | null;
  team: string | null;
  tier: number | null;
  tickets: number;
  refund_tickets: number;
  refund_inr: number;
  refund_rate: number;
  double_dip: number;
  gw_other_inr: number;
  csat: number | null;
};

export type FlagRow = {
  ticket_id: string;
  month: string;
  agent: string;
  team: string;
  dropdown: string;
  inferred: string;
  refund_inr: number;
  repl_cost_inr: number;
  product: string;
  note: string;
  customer: string;
};

export type Board = {
  window: string;
  decisions: string[];
  reconciliation: {
    raw_rows: number;
    unique_tickets: number;
    duplicate_ticket_ids: number;
    duplicate_rows_dropped: number;
    naive_refund_sum_inr: number;
    paired_refund_tickets: number;
    paired_exact_x100: number;
    clean_refund_sum_inr: number;
    clean_refund_tickets: number;
    clean_avg_quarter_inr: number;
    latest_quarter: string;
    latest_quarter_inr: number;
    note: string;
  };
  goal: {
    statement: string;
    baseline_quarter_inr: number;
    target_quarter_inr: number;
    save_quarter_inr: number;
    save_year_inr: number;
    arithmetic: string;
    why_this_not_agent_league: string;
  };
  kpis: {
    clean_total_inr: number;
    clean_refund_tickets: number;
    latest_quarter: string;
    latest_quarter_inr: number;
    latest_quarter_tickets: number;
    avg_quarter_inr: number;
    q1_2025_inr: number;
    refund_rate_18m: number;
    gw_share_inr: number;
    gw_tickets: number;
    gw_over_cap_tickets: number;
    double_dip_tickets: number;
    double_dip_refund_inr: number;
    double_dip_repl_cost_inr: number;
    double_dip_combined_inr: number;
    csat_overall: number;
    csat_q1_2025: number;
    csat_latest: number;
    reclassified_gw_tickets: number;
    reclassified_gw_inr: number;
  };
  quarters: {
    quarter: string;
    tickets: number;
    refund_tickets: number;
    refund_inr: number;
    refund_rate: number;
    csat: number;
    gw_share: number;
    double_dip_tickets: number;
    double_dip_refund_inr: number;
    double_dip_repl_cost_inr: number;
  }[];
  monthly_dropdown: MonthRow[];
  monthly_working: MonthRow[];
  reason_dropdown: ReasonRow[];
  reason_working: ReasonRow[];
  reclassified_from_gw: { code: string; label: string; tickets: number; inr: number }[];
  teams: {
    team: string;
    tickets: number;
    refund_tickets: number;
    refund_inr: number;
    refund_rate: number;
    double_dip: number;
  }[];
  agents: AgentRow[];
  flags: FlagRow[];
  evaluation: {
    gold_n: number;
    classifier_accuracy: number;
    dropdown_accuracy_vs_gold: number;
    unclear_rate: number;
    error_count: number;
    by_gold_reason: Record<string, { n: number; accuracy: number }>;
    error_kinds: { gold: string; predicted: string; n: number }[];
    sample_errors: {
      ticket_id: string;
      gold: string;
      predicted: string;
      dropdown: string;
      amount_inr: number;
    }[];
    dev_sample: {
      n: number;
      classifier_accuracy: number;
      dropdown_accuracy_vs_gold: number;
      note: string;
    };
    method: string;
  };
  cost: {
    model: string;
    one_run_inr: number;
    month_at_650_tickets_week_inr: number;
    arithmetic: string;
  };
};

let cache: Board | null = null;

export function getBoard(): Board {
  if (cache) return cache;
  const path = join(process.cwd(), "public/data/board.json");
  cache = JSON.parse(readFileSync(path, "utf8")) as Board;
  return cache;
}
