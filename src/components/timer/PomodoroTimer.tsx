// src/components/timer/PomodoroTimer.tsx
"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { useTimerStore, TimerPhase } from "@/store/timerStore";
import { useStartSession, useEndSession } from "@/lib/hooks/useSessions";
import { useSubjects } from "@/lib/hooks/useSubjects";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils/cn";
import { toast } from "sonner";

const PHASE_CONFIG: Record<TimerPhase, { label: string; color: string; bg: string }> = {
  "work":        { label: "Focus Time",   color: "#6366f1", bg: "bg-violet-50 dark:bg-violet-900/20" },
  "short-break": { label: "Short Break",  color: "#22c55e", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  "long-break":  { label: "Long Break",   color: "#3b82f6", bg: "bg-blue-50 dark:bg-blue-900/20" },
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return { m, s };
}

export function PomodoroTimer() {
  const {
    phase, timeLeft, isRunning, completedPomodoros,
    currentSessionId, selectedSubjectId, settings,
    start, pause, reset, tick, skipPhase,
    setSubject, setSessionId, getPhaseSeconds,
  } = useTimerStore();

  const intervalRef      = useRef<NodeJS.Timeout | null>(null);
  // Refs keep fresh values accessible inside async callbacks without stale closures
  const sessionIdRef     = useRef<string | null>(currentSessionId);
  const phaseRef         = useRef<TimerPhase>(phase);
  const isHandlingRef    = useRef(false); // guard against double-fire

  const { data: subjects } = useSubjects();
  const startSession = useStartSession();
  const endSession   = useEndSession();

  // Keep refs in sync on every render
  sessionIdRef.current = currentSessionId;
  phaseRef.current     = phase;

  const totalTime  = getPhaseSeconds(phase);
  const progress   = ((totalTime - timeLeft) / totalTime) * 100;
  const { m, s }   = formatTime(timeLeft);
  const phaseConfig = PHASE_CONFIG[phase];

  // ── Tick interval ──────────────────────────────────────────
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, tick]);

  // ── End the active session in DB (reads refs = always fresh) ─
  const endActiveSession = async (completed: boolean) => {
    const sid = sessionIdRef.current;
    if (!sid) return;
    try {
      await endSession.mutateAsync({ id: sid, completed });
    } catch {
      // swallow — session will remain in DB without duration, but don't block UI
    } finally {
      setSessionId(null);
    }
  };

  // ── Phase complete: fires when timer hits 0 ─────────────────
  useEffect(() => {
    if (timeLeft !== 0 || !isRunning) return;
    if (isHandlingRef.current) return; // guard double-fire
    isHandlingRef.current = true;

    pause(); // stop the interval

    (async () => {
      // Only save completed work sessions
      if (phaseRef.current === "work" && sessionIdRef.current) {
        await endActiveSession(true);
        toast.success("Pomodoro complete! 🎉 Take a well-deserved break.");
      }
      skipPhase();
      isHandlingRef.current = false;
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, isRunning]);

  // ── Controls ────────────────────────────────────────────────
  const handleStart = async () => {
    // Create a new DB session when starting a work phase
    if (phaseRef.current === "work" && !sessionIdRef.current) {
      try {
        const session = await startSession.mutateAsync({
          type:      "POMODORO",
          subjectId: selectedSubjectId ?? undefined,
        });
        setSessionId(session.id);
      } catch {
        toast.error("Could not start session — check your connection.");
        return; // don't start the timer if we can't track it
      }
    }
    start();
  };

  const handlePause = () => {
    pause();
    // Session stays open in DB — will be ended on resume completion or reset
  };

  const handleReset = async () => {
    pause();
    await endActiveSession(false); // mark as incomplete (not counted in analytics)
    reset();
  };

  // ── Skip: end DB session first, then advance phase ──────────
  const handleSkip = async () => {
    pause();
    if (phaseRef.current === "work" && sessionIdRef.current) {
      // Count partial work sessions as completed so time isn't lost
      await endActiveSession(true);
      toast.info("Session saved and skipped.");
    }
    skipPhase();
  };

  // SVG circle
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Phase indicator dots */}
      <div className="flex items-center gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              i < completedPomodoros % 4 ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
        <span className="ml-2 text-xs text-muted-foreground">
          {completedPomodoros} pomodoros completed
        </span>
      </div>

      {/* Phase badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", phaseConfig.bg)}
          style={{ color: phaseConfig.color }}
        >
          {phaseConfig.label}
        </motion.div>
      </AnimatePresence>

      {/* SVG ring timer */}
      <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px]">
        <svg
          viewBox="0 0 280 280"
          className="w-full h-full -rotate-90"
        >
          {/* Track */}
          <circle cx={140} cy={140} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={12} />
          {/* Progress */}
          <motion.circle
            cx={140} cy={140} r={radius}
            fill="none"
            stroke={phaseConfig.color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transition={{ duration: 0.5 }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${m}:${s}`}
              initial={{ scale: 0.95, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-baseline gap-1"
            >
              <span className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">{m}</span>
              <span className="text-3xl sm:text-4xl font-light text-muted-foreground animate-pulse">:</span>
              <span className="text-5xl sm:text-6xl font-bold tabular-nums tracking-tight">{s}</span>
            </motion.div>
          </AnimatePresence>
          <p className="mt-1 text-xs text-muted-foreground">
            {isRunning ? "Studying..." : timeLeft === totalTime ? "Ready" : "Paused"}
          </p>
        </div>
      </div>

      {/* Subject selector */}
      <div className="w-full max-w-xs">
        <Select
          value={selectedSubjectId ?? "none"}
          onValueChange={(v) => setSubject(v === "none" ? null : v)}
          disabled={isRunning}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Study subject (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No subject</SelectItem>
            {subjects?.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleReset} disabled={endSession.isPending}>
          <RotateCcw className="h-5 w-5" />
        </Button>

        <Button
          size="icon"
          className="h-16 w-16 rounded-full shadow-lg text-lg"
          style={{ backgroundColor: phaseConfig.color }}
          onClick={isRunning ? handlePause : handleStart}
          disabled={startSession.isPending || endSession.isPending}
        >
          {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </Button>

        <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={handleSkip} disabled={endSession.isPending}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Settings row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>{settings.workDuration}m work</span>
        <span>·</span>
        <span>{settings.shortBreakDuration}m break</span>
        <span>·</span>
        <span>{settings.longBreakDuration}m long</span>
      </div>
    </div>
  );
}
