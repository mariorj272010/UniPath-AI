"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** translateY distance in px before reveal */
  y?: number;
  /** seconds */
  delay?: number;
  as?: "div" | "section" | "li" | "span";
};

/**
 * Scroll reveal that ENHANCES an already-visible default. With JS off (or in a
 * headless renderer) the content renders fully visible — the hidden state is only
 * armed after mount, so the reveal can never ship a blank section.
 */
export function Reveal({ children, className, y = 28, delay = 0, as = "div" }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }

    setArmed(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const hidden = armed && !shown;
  const Tag = as as "div";

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={className}
      style={{
        transform: hidden ? `translate3d(0, ${y}px, 0)` : "translate3d(0,0,0)",
        opacity: hidden ? 0 : 1,
        filter: hidden ? "blur(6px)" : "blur(0px)",
        transition:
          "transform 1s var(--ease-out-expo), opacity 0.9s var(--ease-out-expo), filter 0.9s var(--ease-out-expo)",
        transitionDelay: `${delay}s`,
        willChange: armed ? "transform, opacity" : undefined,
      }}
    >
      {children}
    </Tag>
  );
}

/** Reveals each direct child in sequence. */
export function RevealStagger({
  children,
  className,
  step = 0.09,
  ...rest
}: { children: ReactNode[]; step?: number } & Omit<RevealProps, "children" | "delay">) {
  return (
    <div className={cn(className)}>
      {children.map((child, i) => (
        <Reveal key={i} delay={i * step} {...rest}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
