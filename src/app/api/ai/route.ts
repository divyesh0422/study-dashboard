// src/app/api/ai/route.ts

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import {
  unauthorizedResponse,
  internalErrorResponse,
  errorResponse,
} from "@/lib/utils/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are StudyGuide AI — a friendly expert study assistant inside a student study dashboard.

Your role is to:
- Explain difficult concepts clearly
- Suggest effective study strategies
- Create summaries of topics
- Recommend study techniques (Pomodoro, spaced repetition)
- Help with academic questions
- Break large tasks into manageable steps
- Suggest flashcards for topics

Guidelines:
- Keep responses concise (2–4 paragraphs)
- Use bullet points when helpful
- Be supportive and motivating
- Use simple explanations and examples
`;

export async function POST(req: NextRequest) {
  try {
    /* ---------------- AUTH CHECK ---------------- */

    const session = await auth();

    if (!session?.user?.id) {
      return unauthorizedResponse();
    }

    /* ---------------- ENV CHECK ---------------- */

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return errorResponse(
        "AI_UNAVAILABLE",
        "ANTHROPIC_API_KEY is missing",
        503
      );
    }

    /* ---------------- SAFE BODY PARSE ---------------- */

    let body: any;

    try {
      body = await req.json();
    } catch {
      return errorResponse("INVALID_BODY", "Invalid JSON body", 400);
    }

    const { message, context, history = [] } = body;

    if (!message || typeof message !== "string") {
      return errorResponse("INVALID_INPUT", "Message is required", 400);
    }

    /* ---------------- AI CLIENT ---------------- */

    const anthropic = new Anthropic({
      apiKey,
    });

    /* ---------------- MESSAGE HISTORY ---------------- */

    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((h: any) => ({
        role: h.role === "assistant" ? "assistant" : "user",
        content: String(h.content),
      })),
      {
        role: "user",
        content: context
          ? `[Context: ${context}]\n\n${message}`
          : message,
      },
    ];

    /* ---------------- AI REQUEST ---------------- */

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    /* ---------------- EXTRACT TEXT ---------------- */

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block: any) => block.text)
      .join("\n");

    /* ---------------- RESPONSE ---------------- */

    return NextResponse.json({
      data: {
        reply: text,
        inputTokens: response.usage?.input_tokens ?? 0,
        outputTokens: response.usage?.output_tokens ?? 0,
      },
    });

  } catch (error) {
    console.error("AI API Error:", error);
    return internalErrorResponse();
  }
}