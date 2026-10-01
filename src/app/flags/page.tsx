import { SiteNav } from "@/components/site-nav";
import { getBoard } from "@/lib/board";
import { inr, lakh } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function FlagsPage() {
  const board = getBoard();
  const { kpis } = board;

  return (
    <>
      <SiteNav current="/flags" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-4xl tracking-tight">
          Paid twice on the same order
        </h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          Policy §5: a customer does not get a refund and a replacement for the
          same order. {kpis.double_dip_tickets} tickets did. That is{" "}
          {inr(kpis.double_dip_refund_inr)} refunded plus{" "}
          {inr(kpis.double_dip_repl_cost_inr)} in unit cost and shipping —{" "}
          {lakh(kpis.double_dip_combined_inr)} over 18 months. Neha&apos;s spot
          check of twenty tickets already saw this; the export says it is not a
          couple of one-offs.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
            <p className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Tickets
            </p>
            <p className="font-serif text-3xl">{kpis.double_dip_tickets}</p>
          </div>
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
            <p className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Refund posted
            </p>
            <p className="font-serif text-3xl">{lakh(kpis.double_dip_refund_inr)}</p>
          </div>
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-4">
            <p className="text-[11px] tracking-[0.16em] text-[var(--ink-soft)] uppercase">
              Extra unit + ship
            </p>
            <p className="font-serif text-3xl text-[var(--brick)]">
              {lakh(kpis.double_dip_repl_cost_inr)}
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5">
          <h2 className="font-serif text-xl">Largest double-fills</h2>
          <p className="mb-3 text-sm text-[var(--ink-soft)]">
            Flag is mechanical: refund amount present and{" "}
            <code>replacement_issued = Y</code>. Notes often say the quiet part
            — &quot;keep him happy&quot;, &quot;TL aware&quot;, &quot;one-time
            gesture&quot;.
          </p>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket</TableHead>
                  <TableHead>When</TableHead>
                  <TableHead>Agent / team</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Refund</TableHead>
                  <TableHead className="text-right">Repl. cost</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {board.flags.map((f) => (
                  <TableRow key={f.ticket_id}>
                    <TableCell className="font-mono text-xs">{f.ticket_id}</TableCell>
                    <TableCell>{f.month}</TableCell>
                    <TableCell>
                      <div>{f.agent}</div>
                      <div className="text-xs text-[var(--ink-soft)]">{f.team}</div>
                    </TableCell>
                    <TableCell className="max-w-[10rem] text-sm">{f.product}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inr(f.refund_inr)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {inr(f.repl_cost_inr)}
                    </TableCell>
                    <TableCell className="max-w-xs text-xs text-[var(--ink-soft)]">
                      {f.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </>
  );
}
