"use client";

import { useEffect, useState } from "react";
import { GlowButton } from "./glow-button";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Engine", href: "#engine" },
  { label: "Signals", href: "#signals" },
  { label: "Telemetry", href: "#telemetry" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 flex justify-center px-4 pt-4 sm:pt-6"
      style={{ zIndex: "var(--z-nav)" }}
    >
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-700 ease-[var(--ease-out-expo)] sm:px-6",
          scrolled ? "glass glass-edge shadow-2xl" : "border border-transparent",
        )}
      >
        <a href="#top" className="group flex items-center gap-2.5">
          <span className="relative grid h-7 w-7 place-items-center">
            <span className="absolute inset-0 rounded-md bg-ember/15 blur-[6px] transition-opacity group-hover:opacity-100" />
            <span className="anim-float relative block h-3.5 w-3.5 rounded-[3px] bg-ember shadow-[0_0_14px_2px_oklch(0.82_0.125_72/0.7)]" />
          </span>
          <span className="font-display text-[0.95rem] font-extrabold tracking-[-0.02em] text-ink">
            MICRORITM
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative rounded-full px-4 py-2 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="hud-label hidden lg:block">v2.6 · online</span>
          <GlowButton href="#access" className="px-5 py-2.5 text-[0.82rem]">
            Request access
          </GlowButton>
        </div>
      </nav>
    </header>
  );
}
