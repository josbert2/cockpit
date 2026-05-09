"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
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
import {
  usePropertyDefinitions,
  useDeletePropertyDefinition,
} from "@/hooks/useProperties";
import { AddPropertyButton } from "@/components/properties/AddPropertyButton";
import { TaskPropertyCells } from "@/components/properties/TaskPropertyCells";

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: projects = [] } = useProjects();
  const { data: propDefs = [] } = usePropertyDefinitions("task");
  const create = useCreateTask();
  const del = useDeleteTask();
  const complete = useCompleteTask();
  const promote = usePromoteTaskToToday();
  const deleteProp = useDeletePropertyDefinition();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [priority, setPriority] = useState<"urgent" | "high" | "med" | "low">("med");

  // Build dynamic grid template: fixed cols + properties + actions
  const gridTemplate = `4rem 1fr 8rem 4rem ${propDefs.map(() => "8rem").join(" ")} 4rem`;

  return (
    <div className="px-12 py-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        emoji="✓"
        title="Tareas"
        description={isLoading ? "Cargando..." : `${tasks.length} tareas abiertas.`}
      />

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
              { onSuccess: () => setTitle("") }
            );
          }}
          className="grid grid-cols-1 md:grid-cols-[1fr_12rem_8rem_auto] gap-2"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué hay que hacer?"
            className="h-9 px-3 rounded bg-input border-0 text-sm placeholder:text-muted-fg focus:outline-none focus:bg-hover"
          />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value === "" ? "" : Number(e.target.value))}
            className="h-9 px-3 rounded bg-input border-0 text-sm focus:outline-none focus:bg-hover"
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
            className="h-9 px-3 rounded bg-input border-0 text-sm focus:outline-none focus:bg-hover"
          >
            <option value="urgent">urgent</option>
            <option value="high">high</option>
            <option value="med">med</option>
            <option value="low">low</option>
          </select>
          <button
            type="submit"
            className="h-9 px-4 rounded bg-primary text-primary-fg text-sm font-medium hover:opacity-90 flex items-center gap-1.5"
          >
            <Plus className="size-4" />
            Crear
          </button>
        </form>
      </Card>

      {/* Notion-style database table with dynamic properties */}
      <div className="border-t border-border relative">
        <div
          className="grid text-[11px] font-semibold uppercase tracking-wider text-muted-fg/70 border-b border-border"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          <div className="px-2 py-2">Prio</div>
          <div className="px-2 py-2">Tarea</div>
          <div className="px-2 py-2">Proyecto</div>
          <div className="px-2 py-2">Hoy</div>
          {propDefs.map((d) => (
            <div
              key={d.id}
              className="px-2 py-2 group flex items-center gap-1 truncate"
              title={d.name}
            >
              <span className="truncate">{d.name}</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Borrar la propiedad "${d.name}"?`)) deleteProp.mutate(d.id);
                }}
                className="opacity-0 group-hover:opacity-100 size-4 grid place-items-center rounded text-danger hover:bg-danger/10"
                aria-label="Borrar property"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          ))}
          <div className="px-2 py-2" />
        </div>

        {tasks.length === 0 && !isLoading && (
          <div className="px-2 py-8 text-center text-muted-fg text-sm">
            Sin tareas. Crea una arriba ↑
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task.id}
            className="grid text-sm border-b border-border hover:bg-hover/60 transition-colors group"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            <div className="px-2 py-2.5">
              <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
            </div>
            <div className="px-2 py-2.5 font-medium text-fg">{task.title}</div>
            <div className="px-2 py-2.5 text-muted-fg text-xs truncate">
              {task.project?.name ?? "—"}
            </div>
            <div className="px-2 py-2.5">
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
            </div>
            <TaskPropertyCells taskId={task.id} definitions={propDefs} />
            <div className="px-2 py-2.5 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={() => complete.mutate(task.id)}
                className="size-6 grid place-items-center rounded text-success hover:bg-success/10"
                aria-label="Completar"
              >
                <Check className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => del.mutate(task.id)}
                className="size-6 grid place-items-center rounded text-danger hover:bg-danger/10"
                aria-label="Borrar"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ))}

        <div className="px-2 py-2 relative">
          <AddPropertyButton entityType="task" />
        </div>
      </div>
    </div>
  );
}
