// src/app/api/subjects/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateSubjectSchema } from "@/lib/validations/subject.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

async function getSubjectOrFail(id: string, userId: string) {
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) return { error: notFoundResponse("Subject") };
  if (subject.userId !== userId) return { error: forbiddenResponse() };
  return { subject };
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { subject, error } = await getSubjectOrFail(params.id, session.user.id);
    if (error) return error;

    const [completedTasks, allTasks, sessions, notes] = await Promise.all([
      prisma.task.count({ where: { subjectId: params.id, status: "COMPLETED" } }),
      prisma.task.count({ where: { subjectId: params.id } }),
      prisma.studySession.aggregate({
        where: { subjectId: params.id, completed: true },
        _sum: { duration: true },
      }),
      prisma.note.count({ where: { subjectId: params.id } }),
    ]);

    return successResponse({
      ...subject,
      stats: {
        totalTasks: allTasks,
        completedTasks,
        totalNotes: notes,
        totalStudyHours: Math.round(((sessions._sum.duration ?? 0) / 3600) * 10) / 10,
      },
    });
  } catch (err) {
    console.error("[SUBJECT_GET]", err);
    return internalErrorResponse();
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getSubjectOrFail(params.id, session.user.id);
    if (error) return error;

    const body = await req.json();
    const parsed = updateSubjectSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.subject.update({
      where: { id: params.id },
      data: parsed.data,
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[SUBJECT_PUT]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getSubjectOrFail(params.id, session.user.id);
    if (error) return error;

    await prisma.subject.delete({ where: { id: params.id } });

    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[SUBJECT_DELETE]", err);
    return internalErrorResponse();
  }
}
