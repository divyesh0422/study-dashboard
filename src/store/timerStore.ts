// src/store/timerStore.ts
import { create } from "zustand";

export type TimerPhase = "work" | "short-break" | "long-break";

interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

interface TimerStore {
  phase: TimerPhase;
  timeLeft: number;
  isRunning: boolean;
  completedPomodoros: number;
  currentSessionId: string | null;
  selectedSubjectId: string | null;
  settings: TimerSettings;

  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
  skipPhase: () => void;
  setPhase: (phase: TimerPhase) => void;
  setSubject: (id: string | null) => void;
  setSessionId: (id: string | null) => void;
  updateSettings: (s: Partial<TimerSettings>) => void;
  getPhaseSeconds: (phase?: TimerPhase) => number;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  phase: "work",
  timeLeft: 25 * 60,
  isRunning: false,
  completedPomodoros: 0,
  currentSessionId: null,
  selectedSubjectId: null,
  settings: {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
  },

  getPhaseSeconds: (phase?: TimerPhase) => {
    const { settings, phase: currentPhase } = get();
    const p = phase ?? currentPhase;
    if (p === "work") return settings.workDuration * 60;
    if (p === "short-break") return settings.shortBreakDuration * 60;
    return settings.longBreakDuration * 60;
  },

  start: () => set({ isRunning: true }),

  pause: () => set({ isRunning: false }),

  reset: () => {
    const { getPhaseSeconds, phase } = get();
    set({ isRunning: false, timeLeft: getPhaseSeconds(phase) });
  },

  tick: () => {
    const { timeLeft } = get();
    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    }
  },

  skipPhase: () => {
    const { phase, completedPomodoros, getPhaseSeconds } = get();
    let nextPhase: TimerPhase;
    let newCompleted = completedPomodoros;

    if (phase === "work") {
      newCompleted = completedPomodoros + 1;
      nextPhase = newCompleted % 4 === 0 ? "long-break" : "short-break";
    } else {
      nextPhase = "work";
    }

    set({
      phase: nextPhase,
      timeLeft: getPhaseSeconds(nextPhase),
      isRunning: false,
      completedPomodoros: newCompleted,
      currentSessionId: null,
    });
  },

  setPhase: (phase) => {
    const { getPhaseSeconds } = get();
    set({ phase, timeLeft: getPhaseSeconds(phase), isRunning: false });
  },

  setSubject: (id) => set({ selectedSubjectId: id }),

  setSessionId: (id) => set({ currentSessionId: id }),

  updateSettings: (s) => {
    const { settings, phase, getPhaseSeconds } = get();
    const newSettings = { ...settings, ...s };
    set({ settings: newSettings });
    // Recalculate timeLeft if not running
    if (!get().isRunning) {
      set({ timeLeft: getPhaseSeconds(phase) });
    }
  },
}));
