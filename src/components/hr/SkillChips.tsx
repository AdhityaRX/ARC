import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillChipsProps {
  matched?: string[];
  missing?: string[];
  className?: string;
}

export function SkillChips({ matched = [], missing = [], className }: SkillChipsProps) {
  if (matched.length === 0 && missing.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {matched.map((s) => (
        <span
          key={`m-${s}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        >
          <Check className="w-3 h-3" />
          {s}
        </span>
      ))}
      {missing.map((s) => (
        <span
          key={`x-${s}`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/20"
        >
          <X className="w-3 h-3" />
          {s}
        </span>
      ))}
    </div>
  );
}
