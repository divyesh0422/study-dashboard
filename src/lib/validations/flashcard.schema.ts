// src/lib/validations/flashcard.schema.ts
import { z } from "zod";

export const flashcardDeckSchema = z.object({
  title:       z.string().min(1, "Title is required").max(100),
  description: z.string().max(300).optional(),
  color:       z.string().regex(/^#[0-9A-Fa-f]{6}$/).default("#6366f1"),
  subjectId:   z.string().optional().nullable(),
});

export const flashcardSchema = z.object({
  front: z.string().min(1, "Front text is required").max(1000),
  back:  z.string().min(1, "Back text is required").max(1000),
  difficulty: z.enum(["UNRATED", "EASY", "MEDIUM", "HARD"]).default("UNRATED"),
});

export const updateDifficultySchema = z.object({
  difficulty: z.enum(["UNRATED", "EASY", "MEDIUM", "HARD"]),
});

export type FlashcardDeckInput = z.infer<typeof flashcardDeckSchema>;
export type FlashcardInput     = z.infer<typeof flashcardSchema>;
