import { SiteNav } from "@/components/site-nav";

export default function MemoPage() {
  return (
    <>
      <SiteNav current="/memo" />
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <article className="rounded-xl border border-[var(--rule)] bg-[var(--card)] px-5 py-8 sm:px-10 sm:py-10">
          <p className="text-[11px] tracking-[0.2em] text-[var(--ink-soft)] uppercase">
            Memo · Confidential · Board pack 24 Sep 2026
          </p>
          <h1 className="mt-2 font-serif text-3xl leading-tight">
            To Arjun Mehta — the refund number, and the leak
          </h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            From the support-data review · copy for Priya Raman, Neha Kulkarni,
            Sameer Qureshi
          </p>

          <section className="mt-8 space-y-4 text-[15px] leading-7">
            <p>
              You asked for a monthly view of refunds by reason and by agent, and
              for the total to reconcile. Your export sums to well over a crore a
              quarter. Sameer&apos;s helpdesk report says about Rs 11 lakh. Both
              of you were reading the same files.
            </p>
            <p>
              Two things in the export explain the gap. Freshdesk stored money in
              paise — so every legacy row is 100 times too large. And 638 tickets
              were imported twice when the new helpdesk went live. After we drop
              the duplicates and convert the old money, refunds are{" "}
              <strong>Rs 67.1 lakh over 18 months</strong>, about{" "}
              <strong>Rs 11.2 lakh a quarter</strong>. Last quarter, Q2 2026, was{" "}
              <strong>Rs 12.8 lakh</strong> on 473 tickets. That is the number for
              the pack.
            </p>
            <p>
              Refunds did go up in rupees. They did not go up as a share of work.
              The desk closed 1,053 tickets in Q1 2025 and 2,277 in Q2 2026. The
              refund rate sat between 18% and 22% the whole way. More customers,
              more tickets, more refunds. Per ticket, we are not suddenly
              generous.
            </p>
            <p>
              Priya is right that Q4 was a policy quarter — frontline was told to
              stop arguing. Frontline refund rupees did jump then. CSAT did not
              rise 0.4. It moved from 3.54 to 3.46. Whatever we bought with that
              instruction, it was not a survey point.
            </p>
            <p>
              The reason-code column cannot go into the pack as-is.{" "}
              <strong>GW-OTHER is 43% of the rupees</strong> (Rs 29.1 lakh). It is
              the first item in the dropdown. Policy caps goodwill at Rs 500;
              879 of those 991 tickets are above the cap, most of them ordinary
              returns, failed payments and cancellations that nobody recoded.
              Until that is fixed, &quot;by reason&quot; is a report on how agents
              click, not on why money left.
            </p>
            <p>
              Do not rank agents by rupees. Ritika D&apos;Souza, Ankit Dhillon and
              Manish Iyer sit on Returns Desk. They refund about half their
              tickets because that is the job. Dev Kulkarni sits on Billing for
              the same reason. A league table without the team attached will
              punish the people who process the queue you designed.
            </p>
            <p>
              There is one leak that is not a coding problem. Policy says a
              customer does not get a refund <em>and</em> a replacement on the
              same order. <strong>166 tickets did</strong> — Rs 5.74 lakh
              refunded and Rs 2.97 lakh of product and shipping on top. That is
              Rs 8.71 lakh over 18 months. In the first half of 2026 it ran at{" "}
              <strong>Rs 1.84 lakh a quarter</strong>. Notes say &quot;one-time
              gesture&quot; and &quot;TL aware&quot;. Neha already saw this on a
              sample of twenty. It is not a couple of one-offs.
            </p>
            <p>
              <strong>Ask for the pack:</strong> put Rs 12.8 lakh on the Q2 page,
              not a crore. Split by the cleaned reason codes, not the dropdown.
              Show agents inside their team. And put a hard stop in the helpdesk
              so a ticket cannot post a refund and a replacement together. If we
              cut that double-fill from Rs 1.84 lakh a quarter to under Rs 0.30
              lakh, we save about <strong>Rs 1.5 lakh a quarter — Rs 6 lakh a
              year</strong>. That is the number I would take to the board.
            </p>
            <p className="text-sm text-[var(--ink-soft)]">
              Working file is the refund pack tool. It starts from the README. No
              paid model calls. The reason classifier is right on 84% of a
              32-ticket held-out read; it misses goodwill language on hardware
              tickets and a few wrong-item cases. The paise fix is not an
              estimate — 125 tickets exist in both systems and every one of them
              is exactly 100 times apart.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
