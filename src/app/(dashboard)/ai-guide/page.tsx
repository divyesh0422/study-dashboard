// src/app/(dashboard)/ai-guide/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, Loader2, RefreshCw,
  BookOpen, Target, Brain, Clock, Lightbulb,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { AIMessage } from "@/lib/types";
import { nanoid } from "@/lib/utils/nanoid";
import { cn } from "@/lib/utils/cn";

const SUGGESTION_GROUPS = [
  {
    label: "Study Strategies",
    icon:  Brain,
    color: "bg-violet-100 text-violet-700",
    prompts: [
      "Explain the Pomodoro technique",
      "What is spaced repetition?",
      "How do I do active recall?",
      "Best way to take notes in lectures",
    ],
  },
  {
    label: "Productivity",
    icon:  Target,
    color: "bg-blue-100 text-blue-700",
    prompts: [
      "How to beat procrastination",
      "How to build a study habit",
      "Managing exam stress",
      "Creating a weekly study schedule",
    ],
  },
  {
    label: "Learning Tips",
    icon:  Lightbulb,
    color: "bg-amber-100 text-amber-700",
    prompts: [
      "How to remember things longer",
      "Mind mapping explained",
      "Feynman technique for studying",
      "How to read textbooks effectively",
    ],
  },
  {
    label: "Quick Help",
    icon:  Clock,
    color: "bg-green-100 text-green-700",
    prompts: [
      "Give me a 5-minute study tip",
      "Motivate me to study",
      "Explain the 80/20 rule for studying",
      "Help me focus right now",
    ],
  },
];

export default function AIGuidePage() {
  const [messages, setMessages]   = useState<AIMessage[]>([]);
  const [input, setInput]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;
    setInput("");

    const userMsg: AIMessage = { id: nanoid(), role: "user", content: text.trim(), createdAt: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "AI unavailable");

      setMessages((prev) => [
        ...prev,
        { id: nanoid(), role: "assistant", content: data.data.reply, createdAt: new Date() },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { id: nanoid(), role: "assistant", content: `⚠️ ${err.message}`, createdAt: new Date() },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isLoading]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-1px)] p-6 lg:p-8 gap-4 animate-fade-in">
      <PageHeader
        title="AI Study Guide"
        description="Your personal AI tutor — ask anything about studying, concepts, or strategies"
        action={
          hasMessages && (
            <Button variant="outline" size="sm" onClick={() => setMessages([])}>
              <RefreshCw className="mr-2 h-4 w-4" /> New Chat
            </Button>
          )
        }
      />

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden rounded-2xl border bg-card flex flex-col min-h-0">

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!hasMessages ? (
            /* Welcome Screen */
            <div className="max-w-2xl mx-auto space-y-8 py-4">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl gradient-purple shadow-lg">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Hello! I&apos;m your Study Guide</h2>
                <p className="text-muted-foreground mt-2 text-sm">
                  Ask me to explain concepts, suggest study techniques, or help you understand difficult topics.
                </p>
              </div>

              {/* Suggestion groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUGGESTION_GROUPS.map((group) => (
                  <div key={group.label} className="rounded-xl border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg", group.color)}>
                        <group.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold">{group.label}</span>
                    </div>
                    <div className="space-y-1">
                      {group.prompts.map((p) => (
                        <button
                          key={p}
                          onClick={() => sendMessage(p)}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs text-left text-muted-foreground hover:bg-background hover:text-foreground transition-colors group"
                        >
                          <span>{p}</span>
                          <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation */
            <div className="max-w-2xl mx-auto space-y-6">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}
                >
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 rounded-xl gradient-purple flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={cn(
                      "text-[10px] mt-1.5 opacity-60",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}>
                      {msg.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-8 w-8 rounded-xl gradient-purple flex items-center justify-center shrink-0 shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-3.5 flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="h-2 w-2 rounded-full bg-muted-foreground"
                        animate={{ y: ["0%", "-50%", "0%"] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t bg-background/80 backdrop-blur p-4">
          <div className="max-w-2xl mx-auto flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your study guide anything… (Enter to send)"
                rows={1}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 max-h-32 overflow-y-auto"
                style={{ minHeight: "44px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "auto";
                  t.style.height = Math.min(t.scrollHeight, 128) + "px";
                }}
              />
            </div>
            <Button
              size="icon"
              className="h-11 w-11 rounded-xl shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-center text-[11px] text-muted-foreground mt-2">
            Powered by Claude AI · Requires <code className="font-mono">ANTHROPIC_API_KEY</code> in <code className="font-mono">.env</code>
          </p>
        </div>
      </div>
    </div>
  );
}
