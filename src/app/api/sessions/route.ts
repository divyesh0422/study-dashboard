// src/app/api/sessions/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { startSessionSchema } from "@/lib/validations/session.schema";
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
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const sessions = await prisma.studySession.findMany({
      where: { userId: session.user.id },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: { startTime: "desc" },
      take: limit,
    });

    return successResponse(sessions);
  } catch (err) {
    console.error("[SESSIONS_GET]", err);
    return internalErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await req.json();
    const parsed = startSessionSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const studySession = await prisma.studySession.create({
      data: {
        ...parsed.data,
        startTime: new Date(),
        userId: session.user.id,
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(studySession, 201);
  } catch (err) {
    console.error("[SESSIONS_POST]", err);
    return internalErrorResponse();
  }
}
