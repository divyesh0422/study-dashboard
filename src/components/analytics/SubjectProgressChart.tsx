// src/components/analytics/SubjectProgressChart.tsx
"use client";

import {
  BarChart, Bar, XAxis, YAxis, Cell,
  ResponsiveContainer, Tooltip,
} from "recharts";

interface SubjectProgressChartProps {
  data: { name: string; hours: number; color: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-sm">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-muted-foreground">{payload[0].value}h studied</p>
      </div>
    );
  }
  return null;
};

export function SubjectProgressChart({ data }: SubjectProgressChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        No study sessions recorded yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis
          dataKey="name"
          type="category"
          width={90}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
        <Bar dataKey="hours" radius={[0, 6, 6, 0]} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
