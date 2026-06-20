import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium leading-none ring-1 transition-colors [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        brand: "bg-[oklch(0.82_0.125_72/0.12)] text-ember ring-[oklch(0.82_0.125_72/0.3)]",
        emerald: "bg-[oklch(0.82_0.1_168/0.12)] text-verdant ring-[oklch(0.82_0.1_168/0.3)]",
        amber: "bg-[oklch(0.8_0.15_58/0.12)] text-amber-500 ring-[oklch(0.8_0.15_58/0.3)]",
        navy: "bg-[oklch(0.97_0.01_80/0.06)] text-ink-soft ring-line-hi",
        outline: "text-ink-faint ring-line-hi",
        glass: "glass-dark text-ink ring-transparent",
      },
      size: {
        sm: "px-2.5 py-1 text-[11px]",
        md: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}
