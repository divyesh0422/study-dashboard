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

type RouteContext = { params: Promise<{ cardId: string }> };

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { cardId } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) return notFoundResponse("Card");
    if (card.deck.userId !== session.user.id) return forbiddenResponse();

    return successResponse(card);
  } catch (err) {
    console.error("[CARD_GET]", err);
    return internalErrorResponse();
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { cardId } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) return notFoundResponse("Card");
    if (card.deck.userId !== session.user.id) return forbiddenResponse();

    const { front, back, difficulty } = await req.json();

    const updated = await prisma.flashcard.update({
      where: { id: cardId },
      data: {
        ...(front !== undefined && { front }),
        ...(back !== undefined && { back }),
        ...(difficulty !== undefined && { difficulty }),
      },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[CARD_PUT]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { cardId } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const card = await prisma.flashcard.findUnique({
      where: { id: cardId },
      include: { deck: true },
    });

    if (!card) return notFoundResponse("Card");
    if (card.deck.userId !== session.user.id) return forbiddenResponse();

    await prisma.flashcard.delete({ where: { id: cardId } });

    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[CARD_DELETE]", err);
    return internalErrorResponse();
  }
}