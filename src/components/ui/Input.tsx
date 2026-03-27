"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full h-10 px-3 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-sm)] text-[var(--arc-text-primary)] text-sm placeholder:text-[var(--arc-text-tertiary)] transition-[border-color] duration-[var(--arc-transition-fast)] focus:outline-none focus:border-[var(--arc-crimson-500)] focus:ring-1 focus:ring-[var(--arc-crimson-500)]",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
