// src/components/dashboard/StatsCard.tsx
"use client";

import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "purple" | "blue" | "green" | "orange" | "red";
  index?: number;
}

const colorMap = {
  purple: { bg: "bg-violet-100 dark:bg-violet-900/20", icon: "text-violet-600", border: "border-violet-200/50" },
  blue:   { bg: "bg-blue-100 dark:bg-blue-900/20",   icon: "text-blue-600",   border: "border-blue-200/50" },
  green:  { bg: "bg-emerald-100 dark:bg-emerald-900/20", icon: "text-emerald-600", border: "border-emerald-200/50" },
  orange: { bg: "bg-orange-100 dark:bg-orange-900/20", icon: "text-orange-600", border: "border-orange-200/50" },
  red:    { bg: "bg-red-100 dark:bg-red-900/20",     icon: "text-red-600",    border: "border-red-200/50" },
};

export function StatsCard({ title, value, subtitle, icon: Icon, trend, color = "purple", index = 0 }: StatsCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm",
        colors.border
      )}
    >
      {/* Background decoration */}
      <div className={cn("absolute right-0 top-0 h-20 w-20 rounded-bl-[2rem] opacity-50", colors.bg)} />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", colors.bg)}>
            <Icon className={cn("h-5 w-5", colors.icon)} />
          </div>
        </div>

        {trend && (
          <div className="mt-4 flex items-center gap-1.5">
            {trend.value >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-emerald-600" : "text-red-600")}>
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">{trend.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
