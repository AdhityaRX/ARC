"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
  if (role === "user") {
    return (
      <div className="flex justify-end mb-6">
        <div className="max-w-[80%] bg-[var(--arc-bg-tertiary)] rounded-[var(--arc-radius-lg)] px-4 py-3 text-[0.9375rem] leading-relaxed text-[var(--arc-text-primary)]">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div
        className={cn(
          "max-w-[85%] text-[0.9375rem] leading-relaxed text-[var(--arc-text-primary)] prose prose-invert prose-sm max-w-none",
          "prose-headings:text-[var(--arc-text-primary)] prose-headings:font-semibold",
          "prose-p:text-[var(--arc-text-primary)] prose-p:leading-relaxed",
          "prose-a:text-[var(--arc-crimson-400)] prose-a:no-underline hover:prose-a:underline",
          "prose-strong:text-[var(--arc-text-primary)]",
          "prose-code:text-[var(--arc-crimson-400)] prose-code:bg-[var(--arc-bg-tertiary)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[var(--arc-radius-sm)] prose-code:text-sm prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-[var(--arc-bg-secondary)] prose-pre:border prose-pre:border-[var(--arc-border-subtle)] prose-pre:rounded-[var(--arc-radius-md)]",
          "prose-table:border-collapse",
          "prose-th:bg-[var(--arc-bg-secondary)] prose-th:border prose-th:border-[var(--arc-border-default)] prose-th:px-3 prose-th:py-2 prose-th:text-left",
          "prose-td:border prose-td:border-[var(--arc-border-subtle)] prose-td:px-3 prose-td:py-2",
          "prose-li:text-[var(--arc-text-primary)]",
          "prose-blockquote:border-l-[var(--arc-crimson-500)]",
          isStreaming && "typing-cursor"
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
