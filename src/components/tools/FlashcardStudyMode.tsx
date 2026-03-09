// src/components/tools/FlashcardStudyMode.tsx
"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, CheckCircle2, XCircle, MinusCircle, Trophy } from "lucide-react";
import { Flashcard, FlashcardDifficulty } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { useUpdateCardDifficulty } from "@/lib/hooks/useFlashcards";

interface FlashcardStudyModeProps {
  cards:   Flashcard[];
  deckTitle: string;
  onExit:  () => void;
}

const DIFFICULTY_CONFIG: Record<FlashcardDifficulty, { label: string; icon: typeof CheckCircle2; color: string; bg: string }> = {
  EASY:    { label: "Easy",   icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-100 hover:bg-emerald-200" },
  MEDIUM:  { label: "Medium", icon: MinusCircle,  color: "text-yellow-600",  bg: "bg-yellow-100 hover:bg-yellow-200"  },
  HARD:    { label: "Hard",   icon: XCircle,      color: "text-red-600",     bg: "bg-red-100 hover:bg-red-200"        },
  UNRATED: { label: "Skip",   icon: MinusCircle,  color: "text-slate-500",   bg: "bg-slate-100 hover:bg-slate-200"   },
};

export function FlashcardStudyMode({ cards, deckTitle, onExit }: FlashcardStudyModeProps) {
  const [currentIdx, setCurrentIdx]   = useState(0);
  const [isFlipped, setIsFlipped]     = useState(false);
  const [direction, setDirection]     = useState<"left" | "right">("right");
  const [results, setResults]         = useState<Record<string, FlashcardDifficulty>>({});
  const [isComplete, setIsComplete]   = useState(false);

  const updateDifficulty = useUpdateCardDifficulty();
  const current = cards[currentIdx];
  const progress = ((currentIdx + 1) / cards.length) * 100;

  const goNext = useCallback(async (difficulty?: FlashcardDifficulty) => {
    if (difficulty && current) {
      setResults((r) => ({ ...r, [current.id]: difficulty }));
      updateDifficulty.mutate({ cardId: current.id, difficulty });
    }

    setDirection("right");
    setIsFlipped(false);

    if (currentIdx < cards.length - 1) {
      setTimeout(() => setCurrentIdx((i) => i + 1), 100);
    } else {
      setIsComplete(true);
    }
  }, [current, currentIdx, cards.length, updateDifficulty]);

  function goPrev() {
    if (currentIdx === 0) return;
    setDirection("left");
    setIsFlipped(false);
    setTimeout(() => setCurrentIdx((i) => i - 1), 100);
  }

  // Summary
  if (isComplete) {
    const easy   = Object.values(results).filter((r) => r === "EASY").length;
    const medium = Object.values(results).filter((r) => r === "MEDIUM").length;
    const hard   = Object.values(results).filter((r) => r === "HARD").length;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-100">
          <Trophy className="h-10 w-10 text-yellow-600" />
        </div>
        <h2 className="text-2xl font-bold">Session Complete! 🎉</h2>
        <p className="mt-2 text-muted-foreground">You reviewed all {cards.length} cards</p>

        <div className="mt-6 grid grid-cols-3 gap-4 w-full max-w-xs">
          {[
            { label: "Easy",   count: easy,   color: "bg-emerald-100 text-emerald-700" },
            { label: "Medium", count: medium, color: "bg-yellow-100 text-yellow-700"   },
            { label: "Hard",   count: hard,   color: "bg-red-100 text-red-700"         },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-3 ${s.color}`}>
              <p className="text-2xl font-bold">{s.count}</p>
              <p className="text-xs font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline" onClick={() => { setCurrentIdx(0); setIsFlipped(false); setResults({}); setIsComplete(false); }}>
            <RotateCw className="mr-2 h-4 w-4" /> Study Again
          </Button>
          <Button onClick={onExit}>Back to Decks</Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {deckTitle}
        </Button>
        <span className="text-sm text-muted-foreground font-medium">
          {currentIdx + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
        style={{ perspective: "1000px" }}
      >
        <motion.div
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 200, damping: 20 }}
          className="relative"
        >
          {/* Front */}
          <div
            className="min-h-[240px] rounded-2xl border-2 border-border bg-card p-8 flex flex-col items-center justify-center text-center shadow-sm"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4 font-medium">Question</p>
            <p className="text-xl font-semibold leading-relaxed">{current?.front}</p>
            <p className="text-xs text-muted-foreground mt-6">Click to reveal answer</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 min-h-[240px] rounded-2xl border-2 border-primary/40 bg-primary/5 p-8 flex flex-col items-center justify-center text-center shadow-sm"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-xs text-primary uppercase tracking-wider mb-4 font-medium">Answer</p>
            <p className="text-xl font-semibold leading-relaxed">{current?.back}</p>
          </div>
        </motion.div>
      </div>

      {/* Difficulty buttons (only show when flipped) */}
      <AnimatePresence>
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{   opacity: 0, y: 10 }}
            className="space-y-2"
          >
            <p className="text-xs text-center text-muted-foreground">How well did you know this?</p>
            <div className="grid grid-cols-3 gap-2">
              {(["HARD", "MEDIUM", "EASY"] as FlashcardDifficulty[]).map((d) => {
                const cfg = DIFFICULTY_CONFIG[d];
                return (
                  <button
                    key={d}
                    onClick={() => goNext(d)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl py-3 transition-all font-medium text-sm",
                      cfg.bg, cfg.color
                    )}
                  >
                    <cfg.icon className="h-5 w-5" />
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation — hidden when answer is shown (must rate to advance) */}
      {!isFlipped && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={currentIdx === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setIsFlipped(true)}>
            <RotateCw className="h-4 w-4 mr-1" />
            Show Answer
          </Button>
          <Button variant="outline" size="sm" onClick={() => goNext()} disabled={currentIdx === cards.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
