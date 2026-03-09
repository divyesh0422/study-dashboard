// src/app/api/notes/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateNoteSchema } from "@/lib/validations/note.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

type RouteContext = { params: Promise<{ id: string }> };

async function getNoteOrFail(id: string, userId: string) {
  const note = await prisma.note.findUnique({ where: { id } });
  if (!note) return { error: notFoundResponse("Note") };
  if (note.userId !== userId) return { error: forbiddenResponse() };
  return { note };
}

export async function GET(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getNoteOrFail(id, session.user.id);
    if (error) return error;

    const note = await prisma.note.findUnique({
      where: { id },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(note);
  } catch (err) {
    console.error("[NOTE_GET]", err);
    return internalErrorResponse();
  }
}

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getNoteOrFail(id, session.user.id);
    if (error) return error;

    const body = await req.json();
    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.note.update({
      where: { id },
      data: parsed.data,
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[NOTE_PUT]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getNoteOrFail(id, session.user.id);
    if (error) return error;

    await prisma.note.delete({ where: { id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[NOTE_DELETE]", err);
    return internalErrorResponse();
  }
}