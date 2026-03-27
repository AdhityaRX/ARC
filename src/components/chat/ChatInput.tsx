"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 p-4 bg-[var(--arc-bg-primary)]">
      <div className="max-w-3xl mx-auto relative">
        <div className="flex items-end gap-2 bg-[var(--arc-bg-tertiary)] border border-[var(--arc-border-default)] rounded-[var(--arc-radius-lg)] p-2 focus-within:border-[var(--arc-crimson-500)] transition-[border-color] duration-[var(--arc-transition-fast)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your project idea..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-[var(--arc-text-primary)] text-[0.9375rem] placeholder:text-[var(--arc-text-tertiary)] resize-none outline-none py-2 px-2 max-h-[200px]"
          />
          <button
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className={cn(
              "shrink-0 w-9 h-9 rounded-[var(--arc-radius-sm)] flex items-center justify-center transition-all cursor-pointer",
              value.trim() && !disabled
                ? "bg-[var(--arc-crimson-500)] text-white hover:bg-[var(--arc-crimson-400)]"
                : "bg-[var(--arc-grey-600)] text-[var(--arc-text-tertiary)]"
            )}
          >
            {disabled ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-center text-xs text-[var(--arc-text-tertiary)] mt-2">
          ARC uses Claude Opus 4.6 to help architect your projects
        </p>
      </div>
    </div>
  );
}
