"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-out-expo)] outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:pointer-events-none disabled:opacity-45 active:scale-[0.97] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ember text-void-deep ember-glow hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_oklch(0.82_0.125_72/0.6),0_18px_50px_-12px_oklch(0.82_0.125_72/0.65)]",
        secondary:
          "glass glass-edge text-ink hover:-translate-y-0.5 hover:bg-[oklch(0.97_0.01_80/0.1)]",
        ghost: "text-ink-soft hover:bg-[oklch(0.97_0.01_80/0.06)] hover:text-ink",
        outline:
          "border border-[oklch(0.82_0.125_72/0.4)] text-ember hover:bg-[oklch(0.82_0.125_72/0.1)]",
        glass: "glass-dark text-ink hover:bg-[oklch(0.97_0.01_80/0.08)]",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 py-3.5 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
