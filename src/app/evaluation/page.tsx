import { SiteNav } from "@/components/site-nav";
import { getBoard } from "@/lib/board";
import { inr, pct } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EvaluationPage() {
  const { evaluation: ev, reconciliation: rec, cost } = getBoard();

  return (
    <>
      <SiteNav current="/evaluation" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-4xl tracking-tight">How we know this works</h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">{ev.method}</p>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
            <p className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Held-out accuracy
            </p>
            <p className="font-serif text-4xl">{pct(ev.classifier_accuracy)}</p>
            <p className="text-xs text-[var(--ink-soft)]">
              n = {ev.gold_n} · dropdown on the same tickets {pct(ev.dropdown_accuracy_vs_gold)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
            <p className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Development sample
            </p>
            <p className="font-serif text-4xl">{pct(ev.dev_sample.classifier_accuracy)}</p>
            <p className="text-xs text-[var(--ink-soft)]">{ev.dev_sample.note}</p>
          </div>
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
            <p className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Paise check
            </p>
            <p className="font-serif text-4xl">
              {rec.paired_exact_x100}/{rec.paired_refund_tickets}
            </p>
            <p className="text-xs text-[var(--ink-soft)]">
              Dual-source refunds exactly ×100. Cleaning is not a guess.
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
            <h2 className="font-serif text-xl">Held-out by gold reason</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gold label</TableHead>
                  <TableHead className="text-right">n</TableHead>
                  <TableHead className="text-right">Accuracy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(ev.by_gold_reason).map(([code, row]) => (
                  <TableRow key={code}>
                    <TableCell>{code}</TableCell>
                    <TableCell className="text-right tabular-nums">{row.n}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {pct(row.accuracy)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
            <h2 className="font-serif text-xl">What it gets wrong</h2>
            <p className="mb-3 text-sm text-[var(--ink-soft)]">
              Hardware tickets whose notes say &quot;keep him happy&quot; get
              pulled toward goodwill. Wrong-item sometimes lands on DOA because
              the agent typed &quot;under DOA&quot;. Tickets whose only note is
              &quot;cx ok&quot; stay unclear.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gold</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead className="text-right">n</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ev.error_kinds.map((e) => (
                  <TableRow key={`${e.gold}-${e.predicted}`}>
                    <TableCell>{e.gold}</TableCell>
                    <TableCell>{e.predicted}</TableCell>
                    <TableCell className="text-right">{e.n}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
          <h2 className="font-serif text-xl">Held-out misses</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Gold</TableHead>
                <TableHead>Predicted</TableHead>
                <TableHead>Dropdown</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ev.sample_errors.map((e) => (
                <TableRow key={e.ticket_id}>
                  <TableCell className="font-mono text-xs">{e.ticket_id}</TableCell>
                  <TableCell>{e.gold}</TableCell>
                  <TableCell>{e.predicted}</TableCell>
                  <TableCell>{e.dropdown}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {inr(e.amount_inr)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="mt-8 rounded-xl border border-dashed border-[var(--rule)] p-5 text-sm text-[var(--ink-soft)]">
          <p className="font-medium text-[var(--ink)]">Cost</p>
          <p className="mt-2">{cost.model}.</p>
          <p className="mt-1">{cost.arithmetic}</p>
          <p className="mt-1">
            One run: Rs {cost.one_run_inr}. A month at 650 tickets a week: Rs{" "}
            {cost.month_at_650_tickets_week_inr}.
          </p>
        </section>
      </main>
    </>
  );
}
