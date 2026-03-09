// src/app/api/tasks/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { taskSchema } from "@/lib/validations/task.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  internalErrorResponse,
} from "@/lib/utils/api";
import { TaskStatus, TaskPriority } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") as TaskStatus | null;
    const priority = searchParams.get("priority") as TaskPriority | null;
    const subjectId = searchParams.get("subjectId");
    const search = searchParams.get("search");

    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status }),
        ...(priority && { priority }),
        ...(subjectId && { subjectId }),
        ...(search && { title: { contains: search, mode: "insensitive" } }),
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    });

    return successResponse(tasks);
  } catch (err) {
    console.error("[TASKS_GET]", err);
    return internalErrorResponse();
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body = await req.json();
    const parsed = taskSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const task = await prisma.task.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(task, 201);
  } catch (err) {
    console.error("[TASKS_POST]", err);
    return internalErrorResponse();
  }
}
