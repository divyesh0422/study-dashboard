// src/app/api/flashcards/[id]/cards/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { flashcardSchema } from "@/lib/validations/flashcard.schema";

import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id },
    });

    if (!deck) return notFoundResponse("Deck");
    if (deck.userId !== session.user.id) return forbiddenResponse();

    const body = await req.json();
    const parsed = flashcardSchema.safeParse(body);

    if (!parsed.success) {
      return handleZodError(parsed.error);
    }

    const card = await prisma.flashcard.create({
      data: {
        ...parsed.data,
        deckId: id,
      },
    });

    return successResponse(card, 201);
  } catch (err) {
    console.error("[CARD_POST]", err);
    return internalErrorResponse();
  }
}