// src/components/dashboard/StudyStreakWidget.tsx
"use client";

import { motion } from "framer-motion";
import { Flame, Trophy } from "lucide-react";

interface StudyStreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export function StudyStreakWidget({ currentStreak, longestStreak }: StudyStreakWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Study Streak</h3>

      <div className="flex items-center gap-6">
        {/* Current streak */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/20 mb-2">
            <Flame className="h-8 w-8 text-orange-500" />
          </div>
          <span className="text-3xl font-bold">{currentStreak}</span>
          <span className="text-xs text-muted-foreground mt-1">Current</span>
        </div>

        <div className="h-12 w-px bg-border" />

        {/* Longest streak */}
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 dark:bg-yellow-900/20 mb-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
          </div>
          <span className="text-3xl font-bold">{longestStreak}</span>
          <span className="text-xs text-muted-foreground mt-1">Best</span>
        </div>

        {/* Motivational message */}
        <div className="flex-1 ml-2">
          <p className="text-sm font-medium">
            {currentStreak === 0
              ? "Start your streak today!"
              : currentStreak === longestStreak
              ? "You're on your best streak! 🏆"
              : `${longestStreak - currentStreak} days to beat your record!`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {currentStreak > 0 ? `Keep studying daily to maintain your ${currentStreak}-day streak` : "Study every day to build consistency"}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
