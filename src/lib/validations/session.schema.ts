// src/lib/validations/session.schema.ts
import { z } from "zod";

export const startSessionSchema = z.object({
  type: z.enum(["POMODORO", "SHORT_BREAK", "LONG_BREAK", "FREE_STUDY"]).default("POMODORO"),
  subjectId: z.string().optional().nullable(),
});

export const endSessionSchema = z.object({
  completed: z.boolean().default(true),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
export type EndSessionInput = z.infer<typeof endSessionSchema>;
