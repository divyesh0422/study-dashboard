// src/app/api/flashcards/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, unauthorizedResponse, notFoundResponse, forbiddenResponse, internalErrorResponse } from "@/lib/utils/api";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id: params.id },
      include: {
        subject:    { select: { id: true, name: true, color: true } },
        flashcards: { orderBy: { createdAt: "asc" } },
        _count:     { select: { flashcards: true } },
      },
    });

    if (!deck)                        return notFoundResponse("Deck");
    if (deck.userId !== session.user.id) return forbiddenResponse();

    return successResponse(deck);
  } catch (err) {
    console.error("[DECK_GET]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const deck = await prisma.flashcardDeck.findUnique({ where: { id: params.id } });
    if (!deck)                        return notFoundResponse("Deck");
    if (deck.userId !== session.user.id) return forbiddenResponse();

    await prisma.flashcardDeck.delete({ where: { id: params.id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[DECK_DELETE]", err);
    return internalErrorResponse();
  }
}
