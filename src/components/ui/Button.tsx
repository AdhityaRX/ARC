"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all rounded-[var(--arc-radius-sm)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--arc-crimson-500)] disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          {
            "bg-[var(--arc-crimson-500)] text-white hover:bg-[var(--arc-crimson-400)] active:bg-[var(--arc-crimson-600)]":
              variant === "primary",
            "bg-[var(--arc-bg-tertiary)] text-[var(--arc-text-primary)] border border-[var(--arc-border-default)] hover:bg-[var(--arc-bg-hover)] hover:border-[var(--arc-border-strong)]":
              variant === "secondary",
            "text-[var(--arc-text-secondary)] hover:text-[var(--arc-text-primary)] hover:bg-[var(--arc-bg-hover)]":
              variant === "ghost",
            "bg-red-900/30 text-red-400 hover:bg-red-900/50":
              variant === "danger",
          },
          {
            "h-8 px-3 text-sm gap-1.5": size === "sm",
            "h-10 px-4 text-sm gap-2": size === "md",
            "h-12 px-6 text-base gap-2.5": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
