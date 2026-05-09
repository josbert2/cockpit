"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Props {
  data: Array<{
    project: { id: number; name: string; status: string };
    count: number;
  }>;
}

const STATUS_COLOR: Record<string, string> = {
  HOT: "var(--danger)",
  ACTIVE: "var(--success)",
  PAUSED: "var(--warning)",
  IDLE: "var(--muted-fg)",
  STALE: "var(--purple)",
};

export function TasksByProjectChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-fg py-8">
        Sin tasks asociadas a proyectos todavía.
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.project.name,
    count: d.count,
    color: STATUS_COLOR[d.project.status] ?? "var(--primary)",
  }));

  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 24 }}>
          <XAxis
            type="number"
            tick={{ fill: "var(--muted-fg)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={100}
            tick={{ fill: "var(--fg)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "var(--hover)" }}
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
