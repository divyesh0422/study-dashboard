// src/lib/types/index.ts
export type TaskStatus       = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type TaskPriority     = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type SessionType      = "POMODORO" | "SHORT_BREAK" | "LONG_BREAK" | "FREE_STUDY";
export type FlashcardDifficulty = "UNRATED" | "EASY" | "MEDIUM" | "HARD";

export interface User {
  id: string; name: string | null; email: string; image: string | null;
  pomodoroWork: number; pomodoroBreak: number; pomodoroLong: number;
  dailyGoalHours: number; theme: string; onboardingDone: boolean;
  aiGuideEnabled: boolean; createdAt: string;
}

export interface Subject {
  id: string; name: string; description: string | null;
  color: string; icon: string; userId: string;
  createdAt: string; updatedAt: string;
  _count?: { tasks: number; notes: number; studySessions: number };
  stats?: { totalTasks: number; completedTasks: number; totalNotes: number; totalStudyHours: number };
}

export interface Task {
  id: string; title: string; description: string | null;
  status: TaskStatus; priority: TaskPriority;
  dueDate: string | null; completedAt: string | null;
  userId: string; subjectId: string | null;
  subject: Pick<Subject, "id" | "name" | "color"> | null;
  createdAt: string; updatedAt: string;
}

export interface Note {
  id: string; title: string; content: string; tags: string[];
  isPinned: boolean; userId: string; subjectId: string | null;
  subject: Pick<Subject, "id" | "name" | "color"> | null;
  createdAt: string; updatedAt: string;
}

export interface StudySession {
  id: string; startTime: string; endTime: string | null;
  duration: number | null; type: SessionType; completed: boolean;
  userId: string; subjectId: string | null;
  subject: Pick<Subject, "id" | "name" | "color"> | null; createdAt: string;
}

export interface Flashcard {
  id: string; front: string; back: string;
  difficulty: FlashcardDifficulty; deckId: string;
  createdAt: string; updatedAt: string;
}

export interface FlashcardDeck {
  id: string; title: string; description: string | null;
  color: string; userId: string; subjectId: string | null;
  subject: Pick<Subject, "id" | "name" | "color"> | null;
  flashcards: Flashcard[]; createdAt: string; updatedAt: string;
  _count?: { flashcards: number };
}

export interface AIMessage {
  id: string; role: "user" | "assistant"; content: string; createdAt: Date;
}

export interface AIChatRequest {
  message: string; context?: string;
  history?: { role: "user" | "assistant"; content: string }[];
}

export interface Analytics {
  totalStudyHours: number; currentStreak: number; longestStreak: number;
  tasksCompleted: number; tasksTotal: number; taskCompletionRate: number;
  weeklyHours: { date: string; hours: number }[];
  subjectHours: { name: string; hours: number; color: string }[];
  topSubject: { name: string; hours: number } | null;
}

export interface ApiResponse<T> { data: T; meta?: { page?: number; total?: number; hasMore?: boolean } }
export interface ApiError { error: { code: string; message: string; details?: { field: string; message: string }[] } }
export interface TaskFilters { status?: TaskStatus; priority?: TaskPriority; subjectId?: string; search?: string }
export interface NoteFilters { subjectId?: string; search?: string; pinned?: boolean }
