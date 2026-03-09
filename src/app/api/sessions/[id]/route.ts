// src/app/api/sessions/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { endSessionSchema } from "@/lib/validations/session.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const studySession = await prisma.studySession.findUnique({ where: { id } });
    if (!studySession) return notFoundResponse("Session");
    if (studySession.userId !== session.user.id) return forbiddenResponse();

    const body = await req.json();
    const parsed = endSessionSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - studySession.startTime.getTime()) / 1000);

    const updated = await prisma.studySession.update({
      where: { id },
      data: { endTime, duration, completed: parsed.data.completed },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[SESSION_PATCH]", err);
    return internalErrorResponse();
  }
}