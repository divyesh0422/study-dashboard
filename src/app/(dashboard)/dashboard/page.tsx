// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { Clock, Flame, CheckSquare, BookOpen } from "lucide-react";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { useTasks, useToggleTask, useDeleteTask } from "@/lib/hooks/useTasks";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudyStreakWidget } from "@/components/dashboard/StudyStreakWidget";
import { WeeklyHoursCard } from "@/components/dashboard/WeeklyHoursCard";
import { TaskProgressCard } from "@/components/dashboard/TaskProgressCard";
import { TaskItem } from "@/components/tasks/TaskItem";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { EmptyState } from "@/components/shared/EmptyState";
import { Task } from "@/lib/types";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics();
  const { data: tasks } = useTasks({ status: "PENDING" });
  const toggleTask = useToggleTask();
  const deleteTask = useDeleteTask();

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  if (analyticsLoading) return <PageLoader />;

  const upcomingTasks = (tasks ?? []).slice(0, 5);

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      <PageHeader
        title={`${greeting()}, ${session?.user?.name?.split(" ")[0] ?? "Student"} 👋`}
        description="Here's your study progress at a glance"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Study Hours"
          value={`${analytics?.totalStudyHours ?? 0}h`}
          subtitle="All time"
          icon={Clock}
          color="purple"
          index={0}
        />
        <StatsCard
          title="Study Streak"
          value={analytics?.currentStreak ?? 0}
          subtitle="days in a row"
          icon={Flame}
          color="orange"
          index={1}
        />
        <StatsCard
          title="Tasks Done"
          value={analytics?.tasksCompleted ?? 0}
          subtitle={`of ${analytics?.tasksTotal ?? 0} total`}
          icon={CheckSquare}
          color="green"
          index={2}
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round((analytics?.taskCompletionRate ?? 0) * 100)}%`}
          subtitle="tasks completed"
          icon={BookOpen}
          color="blue"
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <WeeklyHoursCard data={analytics?.weeklyHours ?? []} />
        </div>
        <TaskProgressCard
          completed={analytics?.tasksCompleted ?? 0}
          total={analytics?.tasksTotal ?? 0}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <StudyStreakWidget
            currentStreak={analytics?.currentStreak ?? 0}
            longestStreak={analytics?.longestStreak ?? 0}
          />
        </div>

        {/* Upcoming Tasks */}
        <div className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Upcoming Tasks
          </h3>
          {upcomingTasks.length === 0 ? (
            <EmptyState
              icon={CheckSquare}
              title="All caught up!"
              description="No pending tasks. Create some tasks to track your study work."
              className="py-8"
            />
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task: Task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={(t) => toggleTask.mutate({
                    id: t.id,
                    status: t.status === "COMPLETED" ? "PENDING" : "COMPLETED",
                  })}
                  onEdit={() => {}}
                  onDelete={(t) => deleteTask.mutate(t.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
