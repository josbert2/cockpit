"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import {
  CheckCircle2,
  Download,
  FileText,
  Flame,
  GitCommit,
  ListTodo,
  Inbox,
  Hash,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { MarkdownView } from "@/components/project/MarkdownView";
import {
  useWeeklySummary,
  useWeeklyList,
  useGenerateWeeklyReview,
} from "@/hooks/useWeekly";
import { PRIORITY_TONE } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";

export default function WeeklyPage() {
  const { data: summary, isLoading } = useWeeklySummary();
  const { data: existing = [] } = useWeeklyList();
  const generate = useGenerateWeeklyReview();
  const [preview, setPreview] = useState<string | null>(null);

  if (isLoading || !summary) {
    return (
      <div className="px-12 py-8 max-w-6xl mx-auto space-y-6">
        <div className="h-10 w-72 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const handleGenerate = () => {
    generate.mutate(
      { year: summary.year, week: summary.week },
      { onSuccess: (res) => setPreview(res.preview) }
    );
  };

  const days = summary.commits_by_day.map((d) => ({
    label: new Date(d.date).toLocaleDateString("es-CL", { weekday: "short" }).slice(0, 3),
    count: d.count,
  }));

  return (
    <div className="px-12 py-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        emoji="📅"
        title={`Semana ${summary.week}`}
        description={`${summary.label} · año ${summary.year}`}
        action={
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generate.isPending}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded text-xs bg-primary text-primary-fg hover:opacity-90 transition-opacity disabled:opacity-50",
              generate.isPending && "opacity-60"
            )}
          >
            <Download className="size-3.5" />
            {generate.isPending ? "Generando..." : "Generate review"}
          </button>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={<CheckCircle2 className="size-3.5" />}
          label="Tasks done"
          value={summary.tasks_done}
          tone="success"
        />
        <Stat
          icon={<GitCommit className="size-3.5" />}
          label="Commits"
          value={summary.commits_total}
          tone="primary"
        />
        <Stat
          icon={<ListTodo className="size-3.5" />}
          label="Carry over"
          value={summary.tasks_carry_over.length}
          tone={summary.tasks_carry_over.length > 5 ? "warning" : "default"}
        />
        <Stat
          icon={<Inbox className="size-3.5" />}
          label="Inbox pending"
          value={summary.inbox_pending.length}
          tone={summary.inbox_pending.length > 3 ? "warning" : "default"}
        />
      </div>

      {/* Activity bar chart */}
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Commits por día (semana actual)
          </h2>
          <span className="text-xs text-muted-fg">{summary.commits_total} total</span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={days}>
              <XAxis
                dataKey="label"
                tick={{ fill: "var(--muted-fg)", fontSize: 11 }}
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
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {days.map((d, i) => (
                  <Cell
                    key={i}
                    fill={d.count > 0 ? "var(--primary)" : "var(--muted)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two columns: by repo + by project */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-2">
            <Flame className="size-3.5 text-danger" />
            Commits por repo (top 10)
          </h2>
          {summary.commits_by_repo.length === 0 ? (
            <p className="text-sm text-muted-fg">Sin commits esta semana.</p>
          ) : (
            <div className="space-y-1">
              {summary.commits_by_repo.map((r) => {
                const pct = (r.count / summary.commits_by_repo[0].count) * 100;
                return (
                  <div key={r.name} className="flex items-center gap-3 text-sm py-1">
                    <span className="font-medium text-fg w-32 truncate">{r.name}</span>
                    <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="tabular-nums text-muted-fg w-10 text-right">
                      {r.count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-2">
            <CheckCircle2 className="size-3.5 text-success" />
            Tasks done por proyecto
          </h2>
          {summary.tasks_done_by_project.length === 0 ? (
            <p className="text-sm text-muted-fg">Sin tasks completadas asociadas a proyecto.</p>
          ) : (
            <div className="space-y-1">
              {summary.tasks_done_by_project.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-1">
                  <span className="font-medium text-fg">
                    {row.project?.name ?? "—"}
                  </span>
                  <span className="tabular-nums text-muted-fg">{row.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Carry over */}
      <div className="rounded-md border border-border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-2">
          <ListTodo className="size-3.5" />
          Carry over a la próxima semana
        </h2>
        {summary.tasks_carry_over.length === 0 ? (
          <p className="text-sm text-muted-fg">Nada quedó pendiente con due esta semana ✨</p>
        ) : (
          <div className="space-y-1">
            {summary.tasks_carry_over.map((t) => (
              <div
                key={t.id}
                className="flex items-start gap-3 px-2 py-2 rounded hover:bg-hover/60 transition-colors"
              >
                <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                <span className="text-sm text-fg flex-1">{t.title}</span>
                {t.project && (
                  <span className="text-xs text-muted-fg">{t.project.name}</span>
                )}
                {t.due_date && (
                  <span className="text-xs text-muted-fg/70">
                    {new Date(t.due_date).toLocaleDateString("es-CL")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top tags */}
      {summary.top_tags.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-2">
            <Hash className="size-3.5" />
            Tags más usados
          </h2>
          <div className="flex flex-wrap gap-2">
            {summary.top_tags.map((t) => (
              <span
                key={t.tag}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-muted text-sm"
              >
                <span className="text-muted-fg">#</span>
                <span className="text-fg font-medium">{t.tag}</span>
                <span className="text-xs text-muted-fg tabular-nums">{t.count}×</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Existing weeklies */}
      {existing.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-2">
            <FileText className="size-3.5" />
            Weeklies anteriores ({existing.length})
          </h2>
          <div className="space-y-1">
            {existing.slice(0, 8).map((w) => (
              <div
                key={w.path}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-hover/60 text-sm"
              >
                <span className="font-medium text-fg">
                  {w.year} · semana {w.week}
                </span>
                <span className="text-xs text-muted-fg font-mono">
                  {new Date(w.modified_at).toLocaleString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview after generate */}
      {preview && (
        <div className="rounded-md border border-success/40 bg-success/5 p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-success flex items-center gap-2">
              <CheckCircle2 className="size-3.5" />
              Generado en `~/vault/_weekly/`
            </h2>
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="text-xs text-muted-fg hover:text-fg"
            >
              Cerrar preview
            </button>
          </div>
          <div className="bg-card rounded p-4 max-h-[40rem] overflow-y-auto">
            <MarkdownView source={preview} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
}) {
  const toneCls = {
    default: "bg-card",
    primary: "bg-primary/5",
    success: "bg-success/5",
    warning: "bg-warning/5",
    danger: "bg-danger/5",
  }[tone];
  return (
    <div className={cn("rounded-md border border-border p-4", toneCls)}>
      <div className="flex items-center gap-2 text-xs text-muted-fg font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="text-3xl font-bold tabular-nums mt-2 text-fg">{value}</p>
    </div>
  );
}
