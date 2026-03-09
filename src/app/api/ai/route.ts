// src/app/api/ai/route.ts
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { unauthorizedResponse, internalErrorResponse, errorResponse } from "@/lib/utils/api";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
});

const SYSTEM_PROMPT = `You are StudyGuide AI — a friendly, expert study assistant built into a student study management dashboard.

Your role is to:
- Help students understand difficult concepts clearly and simply
- Suggest effective study strategies tailored to their needs
- Create concise study summaries from topics they describe
- Recommend the best study techniques (Pomodoro, spaced repetition, active recall, etc.)
- Answer academic questions across all subjects
- Give motivational support when students feel overwhelmed
- Help students break down large tasks into manageable steps
- Suggest flashcard ideas for topics they're studying

Guidelines:
- Keep responses focused and concise (2-4 paragraphs max unless more detail is needed)
- Use bullet points and formatting to make answers easy to scan
- Always be encouraging and positive
- If asked to explain a concept, use simple analogies and examples
- When suggesting study strategies, be specific and actionable
- You have context about the student's dashboard — subjects, tasks, sessions

Always respond in a warm, friendly tone like a knowledgeable tutor who genuinely wants the student to succeed.`;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    if (!process.env.ANTHROPIC_API_KEY) {
      return errorResponse(
        "AI_UNAVAILABLE",
        "AI Guide is not configured. Add ANTHROPIC_API_KEY to your .env file.",
        503
      );
    }

    const body = await req.json();
    const { message, context, history = [] } = body;

    if (!message?.trim()) {
      return errorResponse("INVALID_INPUT", "Message is required", 400);
    }

    // Build messages array with history
    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((h: { role: string; content: string }) => ({
        role:    h.role as "user" | "assistant",
        content: h.content,
      })),
      {
        role:    "user" as const,
        content: context
          ? `[Context: ${context}]\n\n${message}`
          : message,
      },
    ];

    const response = await anthropic.messages.create({
      model:      "claude-sonnet-4-6",
      max_tokens: 1024,
      system:     SYSTEM_PROMPT,
      messages,
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as Anthropic.TextBlock).text)
      .join("\n");

    return Response.json({
      data: {
        reply:        text,
        inputTokens:  response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    console.error("[AI_POST]", err);
    return internalErrorResponse();
  }
}
