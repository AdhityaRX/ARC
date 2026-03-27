"use client";

import { useEffect, useRef, useCallback } from "react";
import { useProjectStore } from "@/stores/projectStore";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { Badge } from "@/components/ui/Badge";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { Zap } from "lucide-react";

interface ChatWindowProps {
  projectId: string;
}

export function ChatWindow({ projectId }: ChatWindowProps) {
  const {
    messages,
    setMessages,
    addMessage,
    updateLastMessage,
    currentProject,
    isSending,
    setIsSending,
    isLoading,
    setIsLoading,
  } = useProjectStore();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/projects/${projectId}/messages`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [projectId, setMessages, setIsLoading]);

  const handleSend = useCallback(
    async (content: string) => {
      setIsSending(true);

      addMessage({
        id: crypto.randomUUID(),
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      });

      // Add placeholder for assistant
      const assistantId = crypto.randomUUID();
      addMessage({
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
      });

      try {
        const res = await fetch(`/api/projects/${projectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: content }),
        });

        if (!res.ok) throw new Error("Chat request failed");

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No reader");

        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") break;
              try {
                const parsed = JSON.parse(data);
                if (parsed.type === "text") {
                  accumulated += parsed.text;
                  updateLastMessage(accumulated);
                }
              } catch {
                // skip malformed JSON
              }
            }
          }
        }
      } catch (error) {
        console.error("Chat error:", error);
        updateLastMessage("Sorry, something went wrong. Please try again.");
      } finally {
        setIsSending(false);
      }
    },
    [projectId, addMessage, updateLastMessage, setIsSending]
  );

  const status = currentProject?.status || "ideation";

  return (
    <div className="flex flex-col h-full">
      {/* Project Header */}
      {currentProject && (
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--arc-border-subtle)]">
          <h1 className="text-lg font-semibold text-[var(--arc-text-primary)] truncate">
            {currentProject.name}
          </h1>
          <Badge className={STATUS_COLORS[status]}>
            {STATUS_LABELS[status]}
          </Badge>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--arc-crimson-500)] border-t-transparent animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[var(--arc-crimson-900)] flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-[var(--arc-crimson-500)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--arc-text-primary)] mb-2">
                Start building something great
              </h2>
              <p className="text-[var(--arc-text-secondary)] max-w-md">
                Describe your project idea and ARC will help you refine it into
                a complete architecture and implementation plan.
              </p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <ChatMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={
                  isSending &&
                  i === messages.length - 1 &&
                  msg.role === "assistant"
                }
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isSending} />
    </div>
  );
}
