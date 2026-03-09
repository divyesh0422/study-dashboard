// src/components/dashboard/TaskProgressCard.tsx
"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface TaskProgressCardProps {
  completed: number;
  total: number;
}

export function TaskProgressCard({ completed, total }: TaskProgressCardProps) {
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const data = [
    { name: "Completed", value: completed, color: "hsl(var(--primary))" },
    { name: "Pending", value: pending, color: "hsl(var(--muted))" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Task Progress
        </h3>
        <span className="text-2xl font-bold">{rate}%</span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        {completed} of {total} tasks completed
      </p>

      <div className="flex items-center">
        <ResponsiveContainer width={120} height={120}>
          <PieChart>
            <Pie
              data={total === 0 ? [{ name: "None", value: 1, color: "hsl(var(--muted))" }] : data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              paddingAngle={total === 0 ? 0 : 3}
              dataKey="value"
            >
              {(total === 0 ? [{ color: "hsl(var(--muted))" }] : data).map((entry, i) => (
                <Cell key={i} fill={entry.color} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [v, ""]} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 ml-2 space-y-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground flex-1">{item.name}</span>
              <span className="text-xs font-semibold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
