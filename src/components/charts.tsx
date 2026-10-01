"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { monthLabel } from "@/lib/format";
import type { MonthRow, ReasonRow } from "@/lib/board";

const REASONS = [
  { code: "GW-OTHER", fill: "#8b3a3a" },
  { code: "RETURN-QC-OK", fill: "#1f4d3a" },
  { code: "DUP-PAYMENT", fill: "#3d5a80" },
  { code: "CANCEL", fill: "#b0892c" },
  { code: "DOA-REPL", fill: "#6b4f7a" },
  { code: "WTY-BUYBACK", fill: "#2f6f6a" },
  { code: "PRICE-ADJ", fill: "#8a6a3b" },
  { code: "LOST-TRANSIT", fill: "#4a5560" },
];

function lakhTick(v: number) {
  return `${(v / 100000).toFixed(v >= 500000 ? 1 : 1)}`;
}

export function MonthlyRefundChart({ months }: { months: MonthRow[] }) {
  const data = months.map((m) => {
    const row: Record<string, string | number> = {
      month: monthLabel(m.month),
      total: m.refund_inr,
    };
    for (const r of REASONS) {
      row[r.code] = m.by_reason[r.code]?.inr ?? 0;
    }
    return row;
  });

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e4d9c4" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#5c5346" }} />
          <YAxis
            tickFormatter={lakhTick}
            tick={{ fontSize: 11, fill: "#5c5346" }}
            width={36}
          />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(value ?? 0))
            }
            contentStyle={{
              background: "#f6f1e7",
              border: "1px solid #d4cbb8",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {REASONS.map((r) => (
            <Bar key={r.code} dataKey={r.code} stackId="a" fill={r.fill} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReasonCompare({
  dropdown,
  working,
}: {
  dropdown: ReasonRow[];
  working: ReasonRow[];
}) {
  const data = dropdown.map((d) => {
    const w = working.find((x) => x.code === d.code);
    return {
      name: d.code,
      dropdown: d.inr,
      working: w?.inr ?? 0,
    };
  });
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke="#e4d9c4" horizontal={false} />
          <XAxis type="number" tickFormatter={lakhTick} tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(Number(value ?? 0))
            }
            contentStyle={{
              background: "#f6f1e7",
              border: "1px solid #d4cbb8",
              fontSize: 12,
            }}
          />
          <Legend />
          <Bar dataKey="dropdown" name="Agent dropdown" fill="#8b3a3a" />
          <Bar dataKey="working" name="Text-inferred" fill="#1f4d3a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
