// src/app/api/analytics/route.ts

import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { subDays, startOfDay, format } from "date-fns";
import {
  successResponse,
  unauthorizedResponse,
  internalErrorResponse,
} from "@/lib/utils/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorizedResponse();

    const userId = session.user.id;
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") ?? "30", 10);
    const since = subDays(new Date(), days);

    const [totalSessions, allTasks, completedTasks, subjects, recentSessions] =
      await Promise.all([
        prisma.studySession.aggregate({
          where: { userId, completed: true },
          _sum: { duration: true },
        }),
        prisma.task.count({ where: { userId } }),
        prisma.task.count({ where: { userId, status: "COMPLETED" } }),
        prisma.subject.findMany({
          where: { userId },
          include: {
            studySessions: {
              where: { completed: true, startTime: { gte: since } },
              select: { duration: true },
            },
          },
        }),
        prisma.studySession.findMany({
          where: {
            userId,
            completed: true,
            startTime: { gte: subDays(new Date(), 7) },
          },
          select: { startTime: true, duration: true },
          orderBy: { startTime: "asc" },
        }),
      ]);

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, "yyyy-MM-dd");
    });

    const weeklyMap: Record<string, number> = {};
    last7Days.forEach((d) => (weeklyMap[d] = 0));

    recentSessions.forEach((s) => {
      const day = format(s.startTime, "yyyy-MM-dd");
      if (weeklyMap[day] !== undefined) {
        weeklyMap[day] += (s.duration ?? 0) / 3600;
      }
    });

    const weeklyHours = last7Days.map((date) => ({
      date,
      hours: Math.round(weeklyMap[date] * 10) / 10,
    }));

    const subjectHours = subjects
      .map((s) => ({
        name: s.name,
        color: s.color,
        hours:
          Math.round(
            (s.studySessions.reduce((sum, ss) => sum + (ss.duration ?? 0), 0) /
              3600) *
              10
          ) / 10,
      }))
      .filter((s) => s.hours > 0)
      .sort((a, b) => b.hours - a.hours);

    const sessionDays = await prisma.studySession.findMany({
      where: { userId, completed: true },
      select: { startTime: true },
      orderBy: { startTime: "desc" },
    });

    const uniqueDays = [
      ...new Set(
        sessionDays.map((s) =>
          format(startOfDay(s.startTime), "yyyy-MM-dd")
        )
      ),
    ];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    if (uniqueDays.includes(today) || uniqueDays.includes(yesterday)) {
      for (let i = 0; i < uniqueDays.length; i++) {
        const expected = format(
          subDays(new Date(), i + (uniqueDays[0] === today ? 0 : 1)),
          "yyyy-MM-dd"
        );

        if (uniqueDays[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    for (let i = 0; i < uniqueDays.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(uniqueDays[i - 1]);
        const curr = new Date(uniqueDays[i]);

        const diff = Math.round(
          (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
        );

        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }

      longestStreak = Math.max(longestStreak, tempStreak);
    }

    const totalHours =
      Math.round(((totalSessions._sum.duration ?? 0) / 3600) * 10) / 10;

    const topSubject = subjectHours[0] ?? null;

    return successResponse({
      totalStudyHours: totalHours,
      currentStreak,
      longestStreak,
      tasksCompleted: completedTasks,
      tasksTotal: allTasks,
      taskCompletionRate:
        allTasks > 0
          ? Math.round((completedTasks / allTasks) * 100) / 100
          : 0,
      weeklyHours,
      subjectHours,
      topSubject,
    });
  } catch (err) {
    console.error("[ANALYTICS_GET]", err);
    return internalErrorResponse();
  }
}