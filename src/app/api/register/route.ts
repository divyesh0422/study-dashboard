// src/app/api/register/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/prisma";
import { registerSchema } from "@/lib/validations/auth.schema";
import {
  successResponse,
  handleZodError,
  errorResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse("CONFLICT", "An account with this email already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    return successResponse(user, 201);
  } catch (err) {
    console.error("[REGISTER]", err);
    return internalErrorResponse();
  }
}
