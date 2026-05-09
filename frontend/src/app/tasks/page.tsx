"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Plus, Trash2, Check } from "lucide-react";
import {
  useTasks,
  useCreateTask,
  useDeleteTask,
  useCompleteTask,
  usePromoteTaskToToday,
  PRIORITY_TONE,
} from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const create = useCreateTask();
  const del = useDeleteTask();
  const complete = useCompleteTask();
  const promote = usePromoteTaskToToday();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [priority, setPriority] = useState<"urgent" | "high" | "med" | "low">("med");

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tareas</h1>
        <p className="text-sm text-muted-fg mt-1">
          {isLoading ? "Cargando..." : `${tasks.length} tareas abiertas.`}
        </p>
      </div>

      {/* Create form */}
      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim()) return;
            create.mutate(
              {
                title: title.trim(),
                project_id: projectId === "" ? null : Number(projectId),
                priority,
              },
              {
                onSuccess: () => {
                  setTitle("");
                },
              }
            );
          }}
          className="grid grid-cols-1 md:grid-cols-[1fr_12rem_8rem_auto] gap-2"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué hay que hacer?"
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm placeholder:text-muted-fg focus:outline-none focus:border-primary/60"
          />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value === "" ? "" : Number(e.target.value))}
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm focus:outline-none focus:border-primary/60"
          >
            <option value="">— Sin proyecto —</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.status})
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="h-10 px-3 rounded-xl bg-input border border-border text-sm focus:outline-none focus:border-primary/60"
          >
            <option value="urgent">urgent</option>
            <option value="high">high</option>
            <option value="med">med</option>
            <option value="low">low</option>
          </select>
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-primary text-primary-fg text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Crear
          </button>
        </form>
      </Card>

      {/* Tasks list */}
      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-fg text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3 font-medium">Prio</th>
              <th className="text-left p-3 font-medium">Tarea</th>
              <th className="text-left p-3 font-medium">Proyecto</th>
              <th className="text-left p-3 font-medium">Hoy</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-fg">
                  Sin tareas. Crea una arriba ↑
                </td>
              </tr>
            )}
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-t border-border hover:bg-muted/40 transition-colors group"
              >
                <td className="p-3">
                  <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
                </td>
                <td className="p-3 font-medium">{task.title}</td>
                <td className="p-3 text-muted-fg text-xs">
                  {task.project?.name ?? "—"}
                </td>
                <td className="p-3">
                  {task.today ? (
                    <Badge tone="primary">Slot {task.today_slot}</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => promote.mutate({ id: task.id })}
                      className="text-xs text-muted-fg hover:text-primary"
                    >
                      → Hoy
                    </button>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => complete.mutate(task.id)}
                      className="size-8 grid place-items-center rounded-xl text-success hover:bg-success/10"
                      aria-label="Completar"
                    >
                      <Check className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => del.mutate(task.id)}
                      className="size-8 grid place-items-center rounded-xl text-danger hover:bg-danger/10"
                      aria-label="Borrar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
