// src/app/api/tasks/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { updateTaskSchema, toggleTaskSchema } from "@/lib/validations/task.schema";
import {
  successResponse,
  handleZodError,
  unauthorizedResponse,
  notFoundResponse,
  forbiddenResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

async function getTaskOrFail(id: string, userId: string) {
  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return { error: notFoundResponse("Task") };
  if (task.userId !== userId) return { error: forbiddenResponse() };
  return { task };
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getTaskOrFail(params.id, session.user.id);
    if (error) return error;

    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        ...(parsed.data.dueDate !== undefined && {
          dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        }),
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[TASK_PUT]", err);
    return internalErrorResponse();
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { task, error } = await getTaskOrFail(params.id, session.user.id);
    if (error) return error;

    const body = await req.json();
    const parsed = toggleTaskSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const isCompleting = parsed.data.status === "COMPLETED" && task!.status !== "COMPLETED";

    const updated = await prisma.task.update({
      where: { id: params.id },
      data: {
        status: parsed.data.status,
        completedAt: isCompleting ? new Date() : null,
      },
      include: { subject: { select: { id: true, name: true, color: true } } },
    });

    return successResponse(updated);
  } catch (err) {
    console.error("[TASK_PATCH]", err);
    return internalErrorResponse();
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const { error } = await getTaskOrFail(params.id, session.user.id);
    if (error) return error;

    await prisma.task.delete({ where: { id: params.id } });
    return successResponse({ deleted: true });
  } catch (err) {
    console.error("[TASK_DELETE]", err);
    return internalErrorResponse();
  }
}
