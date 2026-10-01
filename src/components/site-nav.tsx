import Link from "next/link";

const LINKS = [
  { href: "/", label: "Board pack" },
  { href: "/agents", label: "Agents" },
  { href: "/flags", label: "Leaks" },
  { href: "/evaluation", label: "Does it work" },
  { href: "/memo", label: "Memo" },
];

export function SiteNav({ current }: { current: string }) {
  return (
    <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[11px] tracking-[0.14em] text-[var(--ink-soft)] uppercase">
            Vireo Audio · Finance pack
          </p>
          <Link href="/" className="font-serif text-2xl tracking-tight text-[var(--ink)]">
            Refunds, cleaned
          </Link>
        </div>
        <nav className="flex flex-wrap gap-1 text-sm">
          {LINKS.map((l) => {
            const active = current === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={
                  active
                    ? "rounded-full bg-[var(--ink)] px-3 py-1.5 text-[var(--paper)]"
                    : "rounded-full px-3 py-1.5 text-[var(--ink-soft)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
