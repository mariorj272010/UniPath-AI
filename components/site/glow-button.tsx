"use client";

import type { ReactNode } from "react";
import { Magnetic } from "./magnetic";
import { cn } from "@/lib/utils";

type GlowButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: "ember" | "ghost";
  className?: string;
  onClick?: () => void;
};

/** Floating button with a magnetic pull, soft glow, and a swept sheen. */
export function GlowButton({
  children,
  href = "#",
  variant = "ember",
  className,
  onClick,
}: GlowButtonProps) {
  const base =
    "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-sm font-medium tracking-tight transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] active:scale-[0.97]";

  const variants = {
    ember:
      "bg-ember text-void-deep ember-glow hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_oklch(0.82_0.125_72/0.6),0_18px_50px_-12px_oklch(0.82_0.125_72/0.65)]",
    ghost:
      "glass glass-edge text-ink hover:-translate-y-0.5 hover:bg-[oklch(0.97_0.01_80/0.1)]",
  } as const;

  return (
    <Magnetic strength={14} className="inline-block">
      <a href={href} onClick={onClick} className={cn(base, variants[variant], className)}>
        <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
        {/* swept sheen on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        >
          <span
            className="absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg] group-hover:[animation:sheen_0.9s_var(--ease-out-expo)]"
            style={{
              background:
                variant === "ember"
                  ? "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.5), transparent)"
                  : "linear-gradient(90deg, transparent, oklch(1 0 0 / 0.18), transparent)",
            }}
          />
        </span>
      </a>
    </Magnetic>
  );
}
