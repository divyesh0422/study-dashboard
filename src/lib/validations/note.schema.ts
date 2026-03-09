// src/lib/validations/note.schema.ts
import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(1, "Content is required"),
  tags: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
  subjectId: z.string().optional().nullable(),
});

export const updateNoteSchema = noteSchema.partial();

export type NoteInput = z.infer<typeof noteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
