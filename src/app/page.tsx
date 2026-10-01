import { SiteNav } from "@/components/site-nav";
import { MonthlyRefundChart, ReasonCompare } from "@/components/charts";
import { getBoard } from "@/lib/board";
import { crore, inr, lakh, pct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HomePage() {
  const board = getBoard();
  const { kpis, reconciliation: rec, goal } = board;

  return (
    <>
      <SiteNav current="/" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="text-xs tracking-[0.12em] text-[var(--ink-soft)] uppercase">
          Jan 2025 – Jun 2026 · 11,600 tickets after de-duplication
        </p>
        <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
          Refunds are {lakh(kpis.latest_quarter_inr)} a quarter, not a crore.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
          The export Arjun summed is Freshdesk paise plus 638 re-imported tickets.
          Once both are fixed, the number matches Sameer&apos;s helpdesk report.
          What actually moved is volume — and 166 tickets that were refunded{" "}
          <em>and</em> replaced.
        </p>

        <section className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label={`${kpis.latest_quarter} refunds`}
            value={lakh(kpis.latest_quarter_inr)}
            hint={`${kpis.latest_quarter_tickets} tickets`}
          />
          <Kpi
            label="18-month total"
            value={lakh(kpis.clean_total_inr)}
            hint={`${kpis.clean_refund_tickets} refunds · ${pct(kpis.refund_rate_18m)} of tickets`}
          />
          <Kpi
            label="Naive export"
            value={crore(rec.naive_refund_sum_inr)}
            hint="Before paise + dedup. This is the crore."
            alert
          />
          <Kpi
            label="Double-filled, 18m"
            value={lakh(kpis.double_dip_combined_inr)}
            hint={`${kpis.double_dip_tickets} tickets · refund + replacement cost`}
            alert
          />
        </section>

        <section className="mt-8 rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5 sm:p-6">
          <p className="text-[11px] tracking-[0.18em] text-[var(--pine)] uppercase">
            The number we are trying to move
          </p>
          <h2 className="mt-1 font-serif text-2xl leading-snug">{goal.statement}</h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
            {goal.arithmetic}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--ink-soft)]">
            {goal.why_this_not_agent_league}
          </p>
        </section>

        <section className="mt-8 rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="font-serif text-xl">Monthly refunds by dropdown code</h2>
              <p className="text-sm text-[var(--ink-soft)]">
                Axis in lakh. GW-OTHER (brick) is 43% of rupees — first item in
                the agent dropdown.
              </p>
            </div>
            <Badge variant="outline">Rupees, cleaned</Badge>
          </div>
          <MonthlyRefundChart months={board.monthly_dropdown} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
            <h2 className="font-serif text-xl">Dropdown vs text</h2>
            <p className="mb-3 text-sm text-[var(--ink-soft)]">
              Same rupees, re-bucketed from the customer message and closing
              note. GW-OTHER shrinks; returns, cancels and failed payments
              appear.
            </p>
            <ReasonCompare
              dropdown={board.reason_dropdown}
              working={board.reason_working}
            />
          </div>
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
            <h2 className="font-serif text-xl">What we pulled out of GW-OTHER</h2>
            <p className="mb-3 text-sm text-[var(--ink-soft)]">
              {kpis.reclassified_gw_tickets} tickets, {lakh(kpis.reclassified_gw_inr)} — the
              classifier found a real event in the text. Held-out accuracy 84%.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inferred reason</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {board.reclassified_from_gw.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell>{r.label}</TableCell>
                    <TableCell className="text-right tabular-nums">{r.tickets}</TableCell>
                    <TableCell className="text-right tabular-nums">{inr(r.inr)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
          <h2 className="font-serif text-xl">By quarter</h2>
          <p className="mb-3 text-sm text-[var(--ink-soft)]">
            Rate stayed 18–22%. Rupees tracked ticket volume. CSAT did not rise
            0.4 — it went from {kpis.csat_q1_2025} to {kpis.csat_latest}.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quarter</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                  <TableHead className="text-right">Refunds</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Rupees</TableHead>
                  <TableHead className="text-right">GW share</TableHead>
                  <TableHead className="text-right">Double-fill</TableHead>
                  <TableHead className="text-right">CSAT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {board.quarters.map((q) => (
                  <TableRow key={q.quarter}>
                    <TableCell className="font-medium">{q.quarter}</TableCell>
                    <TableCell className="text-right tabular-nums">{q.tickets}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {q.refund_tickets}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {pct(q.refund_rate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inr(q.refund_inr)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {pct(q.gw_share)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {q.double_dip_tickets}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{q.csat}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
          <h2 className="font-serif text-xl">By team — do not rank agents yet</h2>
          <p className="mb-3 text-sm text-[var(--ink-soft)]">
            Returns Desk refunds half its tickets. That is the job. Billing is
            next because failed payments live there. Frontline rupees are the
            ones to watch after Q4&apos;s &quot;stop arguing&quot; instruction.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead className="text-right">Tickets</TableHead>
                <TableHead className="text-right">Refunds</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Rupees</TableHead>
                <TableHead className="text-right">Double-fill</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {board.teams.map((t) => (
                <TableRow key={t.team}>
                  <TableCell className="font-medium">{t.team}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.tickets}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {t.refund_tickets}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {pct(t.refund_rate)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{inr(t.refund_inr)}</TableCell>
                  <TableCell className="text-right tabular-nums">{t.double_dip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="mt-8 rounded-xl border border-dashed border-[var(--rule)] p-5 text-sm leading-relaxed text-[var(--ink-soft)]">
          <p className="font-medium text-[var(--ink)]">How the export was cleaned</p>
          <p className="mt-2">{rec.note}</p>
          <p className="mt-2">
            {rec.paired_exact_x100} of {rec.paired_refund_tickets} overlapping
            refund tickets are exactly ×100. {rec.duplicate_ticket_ids} ticket IDs
            appear in both systems. Clean total {inr(rec.clean_refund_sum_inr)};
            average quarter {inr(rec.clean_avg_quarter_inr)}.
          </p>
        </section>
      </main>
    </>
  );
}

function Kpi({
  label,
  value,
  hint,
  alert,
}: {
  label: string;
  value: string;
  hint: string;
  alert?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
      <p className="text-[11px] tracking-[0.1em] text-[var(--ink-soft)] uppercase">
        {label}
      </p>
      <p
        className={`mt-1 font-serif text-3xl tracking-tight ${alert ? "text-[var(--brick)]" : ""}`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--ink-soft)]">{hint}</p>
    </div>
  );
}
