// src/app/(dashboard)/analytics/page.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Flame, CheckSquare, TrendingUp } from "lucide-react";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { StudyHoursChart } from "@/components/analytics/StudyHoursChart";
import { SubjectProgressChart } from "@/components/analytics/SubjectProgressChart";
import { PageHeader } from "@/components/shared/PageHeader";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const RANGE_OPTIONS = [
  { value: 7,  label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data: analytics, isLoading } = useAnalytics(days);

  if (isLoading) return <PageLoader />;

  return (
    <div className="p-4 lg:p-8 space-y-8 animate-fade-in">
      <PageHeader
        title="Analytics"
        description="Track your study patterns and progress"
        action={
          <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  days === opt.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Study Hours"
          value={`${analytics?.totalStudyHours ?? 0}h`}
          subtitle={`Last ${days} days`}
          icon={Clock}
          color="purple"
          index={0}
        />
        <StatsCard
          title="Current Streak"
          value={analytics?.currentStreak ?? 0}
          subtitle="days"
          icon={Flame}
          color="orange"
          index={1}
        />
        <StatsCard
          title="Tasks Completed"
          value={analytics?.tasksCompleted ?? 0}
          subtitle={`of ${analytics?.tasksTotal} total`}
          icon={CheckSquare}
          color="green"
          index={2}
        />
        <StatsCard
          title="Completion Rate"
          value={`${Math.round((analytics?.taskCompletionRate ?? 0) * 100)}%`}
          subtitle="all time"
          icon={TrendingUp}
          color="blue"
          index={3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Hours Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 rounded-xl border bg-card p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Study Hours
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Daily study time over last {days} days</p>
          <StudyHoursChart data={analytics?.weeklyHours ?? []} />
        </motion.div>

        {/* Subject Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            By Subject
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Hours per subject</p>
          <SubjectProgressChart data={analytics?.subjectHours ?? []} />
        </motion.div>
      </div>

      {/* Subject Hours Detail */}
      {(analytics?.subjectHours ?? []).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border bg-card p-5 shadow-sm"
        >
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Subject Breakdown
          </h3>
          <div className="space-y-3">
            {analytics?.subjectHours.map((subject) => {
              const maxHours = Math.max(...(analytics.subjectHours.map((s) => s.hours)));
              const pct = maxHours > 0 ? (subject.hours / maxHours) * 100 : 0;
              return (
                <div key={subject.name} className="flex items-center gap-4">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span className="text-sm font-medium w-32 truncate">{subject.name}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: subject.color }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums w-12 text-right">
                    {subject.hours}h
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
