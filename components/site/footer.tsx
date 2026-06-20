const COLUMNS = [
  { title: "Engine", links: ["Reasoning core", "Sensing", "Synthesis", "Security"] },
  { title: "Company", links: ["Manifesto", "Careers", "Press", "Contact"] },
  { title: "Resources", links: ["Docs", "Changelog", "Status", "System map"] },
];

export function SiteFooter() {
  return (
    <footer
      className="relative mt-10 overflow-hidden border-t border-line"
      style={{ zIndex: "var(--z-content)" }}
    >
      {/* horizon glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px"
        style={{ background: "linear-gradient(90deg, transparent, oklch(0.82 0.125 72 / 0.6), transparent)" }}
      />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="block h-3.5 w-3.5 rounded-[3px] bg-ember shadow-[0_0_14px_2px_oklch(0.82_0.125_72/0.7)]" />
            <span className="font-display text-base font-extrabold tracking-tight text-ink">
              MICRORITM
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-ink-soft">
            Intelligence, suspended in light. Built for teams who refuse to wait for the
            future.
          </p>
          <p className="hud-label mt-8">© {new Date().getFullYear()} Microritm Labs</p>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="hud-label mb-5">{col.title}</h3>
            <ul className="space-y-3">
              {col.links.map((l) => (
                <li key={l}>
                  <a
                    href="#"
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-line px-5 py-6 text-sm text-ink-faint sm:flex-row sm:px-8">
        <p>Designed in the dark. Rendered in real time.</p>
        <div className="flex gap-6">
          <a href="#" className="transition-colors hover:text-ink">Privacy</a>
          <a href="#" className="transition-colors hover:text-ink">Terms</a>
          <a href="#" className="transition-colors hover:text-ink">Security</a>
        </div>
      </div>
    </footer>
  );
}
