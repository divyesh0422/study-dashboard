// src/app/api/user/profile/route.ts
import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { successResponse, handleZodError, unauthorizedResponse, internalErrorResponse } from "@/lib/utils/api";

const profileSchema = z.object({
  name:           z.string().min(2).max(100).optional(),
  dailyGoalHours: z.number().min(1).max(24).optional(),
  pomodoroWork:   z.number().min(5).max(60).optional(),
  pomodoroBreak:  z.number().min(1).max(30).optional(),
  pomodoroLong:   z.number().min(5).max(60).optional(),
  theme:          z.enum(["system", "light", "dark"]).optional(),
  aiGuideEnabled: z.boolean().optional(),
  onboardingDone: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const user = await prisma.user.findUnique({
      where:  { id: session.user.id },
      select: {
        id: true, name: true, email: true, image: true,
        pomodoroWork: true, pomodoroBreak: true, pomodoroLong: true,
        dailyGoalHours: true, theme: true, onboardingDone: true,
        aiGuideEnabled: true, createdAt: true,
      },
    });

    return successResponse(user);
  } catch (err) {
    console.error("[PROFILE_GET]", err);
    return internalErrorResponse();
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const body   = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) return handleZodError(parsed.error);

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data:  {
        ...parsed.data,
        // Prisma schema uses Int for dailyGoalHours; slider allows 0.5 steps so round here
        ...(parsed.data.dailyGoalHours !== undefined && {
          dailyGoalHours: Math.round(parsed.data.dailyGoalHours),
        }),
      },
      select: {
        id: true, name: true, email: true, image: true,
        pomodoroWork: true, pomodoroBreak: true, pomodoroLong: true,
        dailyGoalHours: true, theme: true, onboardingDone: true,
        aiGuideEnabled: true, createdAt: true,
      },
    });

    return successResponse(user);
  } catch (err) {
    console.error("[PROFILE_PATCH]", err);
    return internalErrorResponse();
  }
}
