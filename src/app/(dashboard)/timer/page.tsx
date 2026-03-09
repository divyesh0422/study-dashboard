// src/app/(dashboard)/timer/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Settings2, Clock } from "lucide-react";
import { PomodoroTimer } from "@/components/timer/PomodoroTimer";
import { useSessions } from "@/lib/hooks/useSessions";
import { useTimerStore } from "@/store/timerStore";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatDuration, formatDate } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";

export default function TimerPage() {
  const { data: sessions } = useSessions(10);
  const { settings, updateSettings } = useTimerStore();

  const todaySessions = sessions?.filter((s) => {
    const today = new Date().toDateString();
    return new Date(s.startTime).toDateString() === today;
  }) ?? [];

  const totalTodaySeconds = todaySessions
    .filter((s) => s.completed && s.type === "POMODORO")
    .reduce((sum, s) => sum + (s.duration ?? 0), 0);

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      <PageHeader
        title="Study Timer"
        description="Focus with the Pomodoro technique"
        action={
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" /> Settings
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Timer Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-8">
                <div>
                  <Label className="text-sm font-medium">
                    Work Duration: {settings.workDuration} min
                  </Label>
                  <Slider
                    min={5} max={60} step={5}
                    value={[settings.workDuration]}
                    onValueChange={([v]) => updateSettings({ workDuration: v })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Short Break: {settings.shortBreakDuration} min
                  </Label>
                  <Slider
                    min={1} max={15} step={1}
                    value={[settings.shortBreakDuration]}
                    onValueChange={([v]) => updateSettings({ shortBreakDuration: v })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Long Break: {settings.longBreakDuration} min
                  </Label>
                  <Slider
                    min={10} max={30} step={5}
                    value={[settings.longBreakDuration]}
                    onValueChange={([v]) => updateSettings({ longBreakDuration: v })}
                    className="mt-2"
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timer */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border bg-card p-8 shadow-sm flex items-center justify-center">
            <PomodoroTimer />
          </div>
        </div>

        {/* Today's sessions */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Today&apos;s Sessions</h3>
          </div>

          <div className="mb-4 rounded-lg bg-primary/10 px-4 py-3">
            <p className="text-xs text-muted-foreground">Total focused today</p>
            <p className="text-2xl font-bold text-primary mt-0.5">
              {formatDuration(totalTodaySeconds)}
            </p>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {todaySessions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No sessions today yet
              </p>
            ) : (
              todaySessions.map((s) => (
                <div
                  key={s.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
                    s.completed ? "bg-muted/50" : "bg-muted/20"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      s.type === "POMODORO" ? "bg-primary" :
                        s.type === "SHORT_BREAK" ? "bg-emerald-500" : "bg-blue-500"
                    )} />
                    <span className="text-muted-foreground">
                      {s.type === "POMODORO" ? "Focus" : s.type === "SHORT_BREAK" ? "Short break" : "Long break"}
                    </span>
                  </div>
                  <span className="font-medium tabular-nums">
                    {s.duration ? formatDuration(s.duration) : "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
