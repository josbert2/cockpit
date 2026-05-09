"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ProjectStatus } from "@/lib/api";

const STATUS_COLOR: Record<ProjectStatus, string> = {
  HOT: "var(--danger)",
  ACTIVE: "var(--success)",
  PAUSED: "var(--warning)",
  IDLE: "var(--muted-fg)",
  STALE: "var(--purple)",
};

interface Props {
  data: Record<ProjectStatus, number>;
}

export function StatusPie({ data }: Props) {
  const entries = (Object.entries(data) as Array<[ProjectStatus, number]>)
    .filter(([, n]) => n > 0)
    .map(([status, value]) => ({ name: status, value, color: STATUS_COLOR[status] }));

  const total = entries.reduce((s, e) => s + e.value, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[12rem_1fr] gap-6 items-center">
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={entries}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={0}
            >
              {entries.map((e) => (
                <Cell key={e.name} fill={e.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-1.5">
        {entries.map((e) => (
          <div key={e.name} className="flex items-center gap-2.5 text-sm">
            <span className="size-2.5 rounded-sm" style={{ background: e.color }} />
            <span className="text-fg font-medium w-16">{e.name}</span>
            <span className="text-muted-fg tabular-nums w-8 text-right">{e.value}</span>
            <div className="flex-1 bg-muted rounded-full h-1 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(e.value / total) * 100}%`,
                  background: e.color,
                }}
              />
            </div>
            <span className="text-xs text-muted-fg/70 tabular-nums w-10 text-right">
              {((e.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
