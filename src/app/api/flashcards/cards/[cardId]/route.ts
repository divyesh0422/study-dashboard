// src/app/api/flashcards/cards/[cardId]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateDifficultySchema } from "@/lib/validations/flashcard.schema";
import { successResponse, handleZodError, unauthorizedResponse, notFoundResponse, forbiddenResponse, internalErrorResponse } from "@/lib/utils/api";

async function getCardAndVerify(cardId: string, userId: string) {
  const card = await prisma.flashcard.findUnique({ where: { id: cardId }, include: { deck: true } });
  if (!card) return { error: notFoundResponse("Card") };
  if (card.deck.userId !== userId) return { error: forbiddenResponse() };
  return { card };
}

export async function PATCH(req: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getCardAndVerify(params.cardId, session.user.id);
    if (error) return error;

    const body   = await req.json();
    const parsed = updateDifficultySchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.flashcard.update({
      where: { id: params.cardId },
      data:  { difficulty: parsed.data.difficulty },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[CARD_PATCH]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { cardId: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getCardAndVerify(params.cardId, session.user.id);
    if (error) return error;

    await prisma.flashcard.delete({ where: { id: params.cardId } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[CARD_DELETE]", err);
    return internalErrorResponse();
  }
}
