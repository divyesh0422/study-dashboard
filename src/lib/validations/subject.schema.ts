// src/lib/validations/subject.schema.ts
import { z } from "zod";

export const subjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().max(500, "Description too long").optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format").default("#6366f1"),
  icon: z.string().default("BookOpen"),
});

export const updateSubjectSchema = subjectSchema.partial();

export type SubjectInput = z.infer<typeof subjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
