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

export default function AgentsPage() {
  const board = getBoard();
  const byTeam = new Map<string, typeof board.agents>();
  for (const a of board.agents) {
    const key = a.team ?? "Unknown";
    const list = byTeam.get(key) ?? [];
    list.push(a);
    byTeam.set(key, list);
  }

  return (
    <>
      <SiteNav current="/agents" />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="font-serif text-4xl tracking-tight">Agents, inside their job</h1>
        <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
          Arjun asked who is giving away money. Sorted by rupees, Returns Desk
          and Billing fill the top of the list — because that is who processes
          refunds. Rate inside the team is the fair comparison. Double-fill is
          the column that is actually a leak.
        </p>

        <div className="mt-8 space-y-8">
          {[...byTeam.entries()].map(([team, agents]) => (
            <section
              key={team}
              className="rounded-xl border border-[var(--rule)] bg-[var(--card)] p-5"
            >
              <h2 className="font-serif text-xl">{team}</h2>
              <p className="mb-3 text-sm text-[var(--ink-soft)]">
                {agents.reduce((s, a) => s + a.refund_tickets, 0)} refunds ·{" "}
                {inr(agents.reduce((s, a) => s + a.refund_inr, 0))}
              </p>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead className="text-right">Tickets</TableHead>
                      <TableHead className="text-right">Refunds</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Rupees</TableHead>
                      <TableHead className="text-right">Double-fill</TableHead>
                      <TableHead className="text-right">CSAT</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents
                      .slice()
                      .sort((a, b) => b.refund_rate - a.refund_rate)
                      .map((a) => (
                        <TableRow key={a.agent_id}>
                          <TableCell>
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-[var(--ink-soft)]">
                              {a.agent_id}
                            </div>
                          </TableCell>
                          <TableCell>{a.site}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {a.tickets}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {a.refund_tickets}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {pct(a.refund_rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {inr(a.refund_inr)}
                          </TableCell>
                          <TableCell
                            className={`text-right tabular-nums ${a.double_dip ? "text-[var(--brick)]" : ""}`}
                          >
                            {a.double_dip}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {a.csat ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
