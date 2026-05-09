"use client";

import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  Inbox,
  ListTodo,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import { Hero } from "@/components/dashboard/Hero";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusPie } from "@/components/dashboard/StatusPie";
import { TasksByProjectChart } from "@/components/dashboard/TasksByProjectChart";
import { Badge } from "@/components/ui/Badge";
import { PRIORITY_TONE } from "@/hooks/useTasks";
import { STATUS_TONE } from "@/components/ui/Badge";

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) {
    return (
      <div className="px-12 py-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-3">
          <div className="h-4 w-40 bg-muted rounded animate-pulse" />
          <div className="h-10 w-72 bg-muted rounded animate-pulse" />
          <div className="h-4 w-96 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-72 bg-muted rounded-md animate-pulse lg:col-span-2" />
          <div className="h-72 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  const totalProjects = Object.values(data.project_status_counts).reduce((s, n) => s + n, 0);
  const todayUsed = data.today_tasks.length;

  return (
    <div className="px-12 py-8 max-w-7xl mx-auto space-y-8">
      <Hero
        todaySlots={todayUsed}
        hotCount={data.project_status_counts.HOT}
        manualOpen={data.tasks_manual_open}
        vaultOpen={data.tasks_vault_open}
      />

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Proyectos"
          value={totalProjects}
          icon={Flame}
          hint={`${data.project_status_counts.HOT} hot · ${data.project_status_counts.ACTIVE} active`}
          href="/projects"
          tone="primary"
        />
        <StatCard
          label="Tareas abiertas"
          value={data.tasks_open}
          icon={ListTodo}
          hint={`${data.tasks_manual_open} manual · ${data.tasks_vault_open} vault`}
          href="/tasks"
        />
        <StatCard
          label="Inbox"
          value={data.inbox_pending_count}
          icon={Inbox}
          hint={data.inbox_pending_count > 0 ? "Pendientes de procesar" : "Vacío"}
          href="/inbox"
          tone={data.inbox_pending_count > 3 ? "warning" : "default"}
        />
        <StatCard
          label="Done esta semana"
          value={data.tasks_done_this_week}
          icon={CheckCircle2}
          hint="Últimos 7 días"
          tone="success"
        />
      </div>

      {/* Today + Hot projects */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-6">
        {/* Today widget */}
        <div className="rounded-md border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg flex items-center gap-2">
              <Sparkles className="size-3.5" strokeWidth={2} />
              Hoy
            </h2>
            <Link
              href="/today"
              className="text-xs text-muted-fg hover:text-fg flex items-center gap-1"
            >
              Ver todas <ArrowRight className="size-3" />
            </Link>
          </div>
          {[1, 2, 3].map((slot) => {
            const task = data.today_tasks.find((t) => t.today_slot === slot);
            return (
              <div
                key={slot}
                className="flex items-start gap-4 p-3 rounded-md border border-border bg-bg/50 hover:bg-hover/40 transition-colors"
              >
                <div
                  className={`size-9 shrink-0 rounded-md grid place-items-center font-bold tabular-nums ${
                    task ? "bg-primary text-primary-fg" : "bg-muted text-muted-fg"
                  }`}
                >
                  {slot}
                </div>
                <div className="flex-1 min-w-0">
                  {task ? (
                    <>
                      <div className="flex items-start gap-2">
                        <p className="text-fg font-medium flex-1">{task.title}</p>
                        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                      </div>
                      {task.project && (
                        <p className="text-xs text-muted-fg mt-1.5">
                          📦 {task.project.name}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-muted-fg text-sm">Slot vacío</p>
                      <p className="text-xs text-muted-fg/70 mt-0.5">
                        Promové una tarea del backlog
                      </p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hot projects */}
        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg flex items-center gap-2">
              <Flame className="size-3.5 text-danger" strokeWidth={2.5} />
              Hot ({data.hot_projects.length})
            </h2>
            <Link
              href="/projects"
              className="text-xs text-muted-fg hover:text-fg flex items-center gap-1"
            >
              Todos <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-1">
            {data.hot_projects.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-2 py-2 rounded hover:bg-hover/60 transition-colors text-sm"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-fg truncate">{p.name}</p>
                  <p className="text-xs text-muted-fg truncate">
                    {p.last_commit_msg}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-fg shrink-0">
                  <span className="tabular-nums" title={`${p.commits_30d} commits 30d`}>
                    <TrendingUp className="size-3 inline mr-0.5" />
                    {p.commits_30d}
                  </span>
                  <span className="tabular-nums">
                    {p.days_since_commit === 0 ? "hoy" : `${p.days_since_commit}d`}
                  </span>
                </div>
              </div>
            ))}
            {data.hot_projects.length === 0 && (
              <p className="text-sm text-muted-fg text-center py-4">
                Ningún proyecto hot ahora.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Inbox + tasks chart */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
        {/* Inbox preview */}
        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg flex items-center gap-2">
              <Inbox className="size-3.5" strokeWidth={2} />
              Inbox
            </h2>
            <Link
              href="/inbox"
              className="text-xs text-muted-fg hover:text-fg flex items-center gap-1"
            >
              Procesar <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {data.inbox_preview.map((item) => {
              const fmType = item.frontmatter.type as string | undefined;
              const fmProject = item.frontmatter.project as string | undefined;
              const title = String(item.frontmatter.id ?? item.slug)
                .replace(/^\d{4}-\d{2}-\d{2}-/, "")
                .replace(/-/g, " ");
              return (
                <div
                  key={item.slug}
                  className="p-3 rounded border border-border bg-bg/50 hover:bg-hover/40 transition-colors"
                >
                  <div className="flex items-start gap-2 mb-1.5">
                    {fmType && <Badge tone="primary">{fmType}</Badge>}
                    {fmProject && <Badge tone="purple">{fmProject}</Badge>}
                  </div>
                  <p className="text-sm font-medium text-fg capitalize">{title}</p>
                  <p className="text-xs text-muted-fg mt-1 line-clamp-2">
                    {item.body.slice(0, 120)}
                  </p>
                </div>
              );
            })}
            {data.inbox_preview.length === 0 && (
              <p className="text-sm text-muted-fg text-center py-4">Inbox vacío.</p>
            )}
          </div>
        </div>

        {/* Tasks by project chart */}
        <div className="rounded-md border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg flex items-center gap-2">
              <ListTodo className="size-3.5" strokeWidth={2} />
              Tasks por proyecto
            </h2>
            <span className="text-xs text-muted-fg">Top 10 con tareas abiertas</span>
          </div>
          <TasksByProjectChart data={data.tasks_by_project} />
        </div>
      </div>

      {/* Status distribution */}
      <div className="rounded-md border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Distribución de proyectos por estado
          </h2>
          <span className="text-xs text-muted-fg tabular-nums">{totalProjects} repos</span>
        </div>
        <StatusPie data={data.project_status_counts} />
      </div>
    </div>
  );
}
