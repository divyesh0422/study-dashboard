// src/components/analytics/StudyHoursChart.tsx
"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

interface StudyHoursChartProps {
  data: { date: string; hours: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-sm">
        <p className="text-muted-foreground">{format(parseISO(label), "EEE, MMM d")}</p>
        <p className="font-semibold text-primary">{payload[0].value}h</p>
      </div>
    );
  }
  return null;
};

export function StudyHoursChart({ data }: StudyHoursChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(v) => format(parseISO(v), "MMM d")}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="hours"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#hoursGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
