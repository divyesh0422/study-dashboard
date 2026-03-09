// src/app/api/notes/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { noteSchema } from "@/lib/validations/note.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");
    const search = searchParams.get("search");
    const pinned = searchParams.get("pinned");

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        ...(subjectId && { subjectId }),
        ...(pinned === "true" && { isPinned: true }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
    });

    return successResponse(notes);
  } catch (err) {
    console.error("[NOTES_GET]", err);
    return internalErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await req.json();
    const parsed = noteSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const note = await prisma.note.create({
      data: { ...parsed.data, userId: session.user.id },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(note, 201);
  } catch (err) {
    console.error("[NOTES_POST]", err);
    return internalErrorResponse();
  }
}
