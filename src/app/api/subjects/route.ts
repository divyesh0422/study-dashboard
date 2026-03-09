// src/app/api/subjects/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { subjectSchema } from "@/lib/validations/subject.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const subjects = await prisma.subject.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
      include: {
        _count: { select: { tasks: true, notes: true, studySessions: true } },
      },
    });

    // Enrich with computed stats
    const enriched = await Promise.all(
      subjects.map(async (s) => {
        const completedTasks = await prisma.task.count({
          where: { subjectId: s.id, status: "COMPLETED" },
        });
        const sessions = await prisma.studySession.aggregate({
          where: { subjectId: s.id, completed: true },
          _sum: { duration: true },
        });

        return {
          ...s,
          stats: {
            totalTasks: s._count.tasks,
            completedTasks,
            totalNotes: s._count.notes,
            totalStudyHours: Math.round(((sessions._sum.duration ?? 0) / 3600) * 10) / 10,
          },
        };
      })
    );

    return successResponse(enriched);
  } catch (err) {
    console.error("[SUBJECTS_GET]", err);
    return internalErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await req.json();
    const parsed = subjectSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const subject = await prisma.subject.create({
      data: { ...parsed.data, userId: session.user.id },
      include: { _count: { select: { tasks: true, notes: true, studySessions: true } } },
    });

    return successResponse(subject, 201);
  } catch (err) {
    console.error("[SUBJECTS_POST]", err);
    return internalErrorResponse();
  }
}
