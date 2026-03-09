// src/app/api/flashcards/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { flashcardDeckSchema } from "@/lib/validations/flashcard.schema";
import { successResponse, handleZodError, unauthorizedResponse, internalErrorResponse } from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const decks = await prisma.flashcardDeck.findMany({
      where: { userId: session.user.id },
      include: {
        subject: { select: { id: true, name: true, color: true } },
        _count:  { select: { flashcards: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return successResponse(decks);
  } catch (err) {
    console.error("[DECKS_GET]", err);
    return internalErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body   = await req.json();
    const parsed = flashcardDeckSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const deck = await prisma.flashcardDeck.create({
      data: { ...parsed.data, userId: session.user.id },
      include: {
        subject:   { select: { id: true, name: true, color: true } },
        _count:    { select: { flashcards: true } },
        flashcards: true,
      },
    });

    return successResponse(deck, 201);
  } catch (err) {
    console.error("[DECKS_POST]", err);
    return internalErrorResponse();
  }
}
