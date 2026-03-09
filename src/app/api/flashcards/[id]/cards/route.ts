import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import {
  successResponse,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const deck = await prisma.flashcardDeck.findUnique({
      where: { id },
      include: { flashcards: true },
    });

    if (!deck) return notFoundResponse("Deck");
    if (deck.userId !== session.user.id) return forbiddenResponse();

    return successResponse(deck);
  } catch (err) {
    console.error("[FLASHCARD_GET]", err);
    return internalErrorResponse();
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const deck = await prisma.flashcardDeck.findUnique({ where: { id } });
    if (!deck) return notFoundResponse("Deck");
    if (deck.userId !== session.user.id) return forbiddenResponse();

    const { title, description, color, subjectId } = await req.json();

    const updated = await prisma.flashcardDeck.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(color !== undefined && { color }),
        ...(subjectId !== undefined && { subjectId }),
      },
      include: { flashcards: true },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[FLASHCARD_PUT]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const deck = await prisma.flashcardDeck.findUnique({ where: { id } });
    if (!deck) return notFoundResponse("Deck");
    if (deck.userId !== session.user.id) return forbiddenResponse();

    await prisma.flashcardDeck.delete({ where: { id } });

    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[FLASHCARD_DELETE]", err);
    return internalErrorResponse();
  }
}