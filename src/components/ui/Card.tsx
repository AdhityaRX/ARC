import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}

export function Card({ children, className, accent }: CardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--arc-bg-tertiary)] rounded-[var(--arc-radius-md)] border border-[var(--arc-border-subtle)] shadow-[var(--arc-shadow-sm)]",
        accent && "border-l-2 border-l-[var(--arc-crimson-500)]",
        className
      )}
    >
      {children}
    </div>
  );
}
