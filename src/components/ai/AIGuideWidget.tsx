// src/components/ai/AIGuideWidget.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { AIMessage } from "@/lib/types";
import { nanoid } from "@/lib/utils/nanoid";

const QUICK_PROMPTS = [
  "Explain spaced repetition",
  "How to stay focused?",
  "Best note-taking method",
  "Beat procrastination tips",
];

export function AIGuideWidget() {
  const [isOpen, setIsOpen]       = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: nanoid(), role: "user", content: text.trim(), createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-8).map((m) => ({
        role: m.role, content: m.content,
      }));

      const res = await fetch("/api/ai", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text.trim(), history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message ?? "AI unavailable");
      }

      const aiMsg: AIMessage = {
        id: nanoid(), role: "assistant",
        content: data.data.reply, createdAt: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: AIMessage = {
        id: nanoid(), role: "assistant",
        content: `⚠️ ${err.message ?? "Something went wrong. Please try again."}`,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{   opacity: 0, scale: 0.9,  y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border gradient-purple">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-white" />
                <span className="font-semibold text-white text-sm">StudyGuide AI</span>
                <span className="text-[10px] bg-white/20 text-white rounded-full px-2 py-0.5">Beta</span>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-white hover:bg-white/20"
                    onClick={() => setMessages([])}
                    title="Clear chat"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="text-center py-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-purple mx-auto mb-3">
                    <Bot className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">Hi! I&apos;m your AI study guide.</p>
                  <p className="text-xs text-muted-foreground mt-1">Ask me anything about studying, concepts, or techniques.</p>

                  {/* Quick prompts */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        onClick={() => sendMessage(p)}
                        className="text-xs rounded-lg border border-border bg-muted/50 px-2 py-2 hover:bg-accent transition-colors text-left leading-tight"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="h-7 w-7 rounded-full gradient-purple flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="h-3.5 w-3.5 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted text-foreground rounded-tl-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="h-7 w-7 rounded-full gradient-purple flex items-center justify-center shrink-0">
                    <Sparkles className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          animate={{ y: ["0%", "-50%", "0%"] }}
                          transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3 flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your study guide..."
                disabled={isLoading}
                className="flex-1 text-sm bg-muted/50 border border-border rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-xl shrink-0"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-purple shadow-lg hover:shadow-xl transition-shadow"
        aria-label="Open AI Study Guide"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="h-6 w-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
