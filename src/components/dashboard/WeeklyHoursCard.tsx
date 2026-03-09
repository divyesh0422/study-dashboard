// src/components/dashboard/WeeklyHoursCard.tsx
"use client";

import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { format, parseISO } from "date-fns";

interface WeeklyHoursCardProps {
  data: { date: string; hours: number }[];
  dailyGoal?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-sm">
        <p className="font-medium">{format(parseISO(label), "EEE, MMM d")}</p>
        <p className="text-primary font-semibold">{payload[0].value}h studied</p>
      </div>
    );
  }
  return null;
};

export function WeeklyHoursCard({ data, dailyGoal = 4 }: WeeklyHoursCardProps) {
  const totalHours = data.reduce((sum, d) => sum + d.hours, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Weekly Study Hours
        </h3>
        <span className="text-2xl font-bold">{totalHours.toFixed(1)}h</span>
      </div>
      <p className="text-xs text-muted-foreground mb-5">Last 7 days</p>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tickFormatter={(v) => format(parseISO(v), "EEE")}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
          <Bar dataKey="hours" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.hours >= dailyGoal ? "hsl(var(--primary))" : "hsl(var(--primary) / 0.4)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
