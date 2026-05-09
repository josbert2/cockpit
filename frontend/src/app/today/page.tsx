"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Check, X, Plus, Sparkles } from "lucide-react";
import {
  useTasks,
  useCompleteTask,
  useRemoveTaskFromToday,
  usePromoteTaskToToday,
  useCreateTask,
  PRIORITY_TONE,
  taskInSlot,
} from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/api";

export default function TodayPage() {
  const { data: today = [] } = useTasks({ today: true });
  const { data: backlog = [] } = useTasks({ status: "todo" });
  const promote = usePromoteTaskToToday();
  const remove = useRemoveTaskFromToday();
  const complete = useCompleteTask();
  const create = useCreateTask();

  const [newTitle, setNewTitle] = useState("");

  const backlogNotInToday = backlog.filter((t) => !t.today);

  return (
    <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_24rem] gap-6">
      {/* Today slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Hoy</h1>
            <p className="text-sm text-muted-fg mt-1">
              Las 3 cosas que mueven la aguja. Drag desde el backlog o usa los botones.
            </p>
          </div>
        </div>

        {[1, 2, 3].map((slot) => {
          const task = taskInSlot(today, slot);
          return <SlotCard key={slot} slot={slot} task={task} onComplete={(id) => complete.mutate(id)} onRemove={(id) => remove.mutate(id)} />;
        })}
      </div>

      {/* Backlog */}
      <div className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Backlog
          </h2>
          <p className="text-xs text-muted-fg mt-1">{backlogNotInToday.length} pendientes</p>
        </div>

        <Card className="p-3 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              create.mutate(
                { title: newTitle.trim(), priority: "med" },
                { onSuccess: () => setNewTitle("") }
              );
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Nueva tarea..."
              className="flex-1 h-9 px-3 rounded-xl bg-input border border-border text-sm placeholder:text-muted-fg focus:outline-none focus:border-primary/60"
            />
            <button
              type="submit"
              className="size-9 grid place-items-center rounded-xl bg-primary text-primary-fg hover:opacity-90"
              aria-label="Crear"
            >
              <Plus className="size-4" />
            </button>
          </form>
        </Card>

        <div className="space-y-2">
          {backlogNotInToday.length === 0 && (
            <p className="text-sm text-muted-fg text-center py-8">Backlog vacío.</p>
          )}
          {backlogNotInToday.map((task) => (
            <BacklogTask
              key={task.id}
              task={task}
              onPromote={() => promote.mutate({ id: task.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SlotCard({
  slot,
  task,
  onComplete,
  onRemove,
}: {
  slot: number;
  task?: Task;
  onComplete: (id: number) => void;
  onRemove: (id: number) => void;
}) {
  if (!task) {
    return (
      <Card className="border-dashed border-border bg-muted/20 p-5 flex items-center gap-4">
        <div className="size-10 shrink-0 rounded-2xl bg-muted/60 grid place-items-center text-muted-fg font-bold tabular-nums">
          {slot}
        </div>
        <div className="flex-1">
          <p className="text-muted-fg text-sm">Slot {slot} vacío</p>
          <p className="text-xs text-muted-fg/70 mt-0.5">
            Promové una tarea del backlog →
          </p>
        </div>
        <Sparkles className="size-4 text-muted-fg/50" />
      </Card>
    );
  }

  return (
    <Card className="p-5 flex items-start gap-4 group">
      <div className="size-10 shrink-0 rounded-2xl bg-primary text-primary-fg grid place-items-center font-bold tabular-nums">
        {slot}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <p className="font-medium text-fg flex-1">{task.title}</p>
          <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-fg">
          {task.project && (
            <span className="truncate">📦 {task.project.name}</span>
          )}
          {task.energy && (
            <span className="truncate">
              {task.energy === "deep" ? "🧠 deep" : task.energy === "admin" ? "📋 admin" : "🎨 creative"}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onComplete(task.id)}
          className="size-8 grid place-items-center rounded-xl text-success hover:bg-success/10"
          aria-label="Completar"
        >
          <Check className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(task.id)}
          className="size-8 grid place-items-center rounded-xl text-muted-fg hover:bg-muted hover:text-fg"
          aria-label="Sacar de hoy"
        >
          <X className="size-4" />
        </button>
      </div>
    </Card>
  );
}

function BacklogTask({ task, onPromote }: { task: Task; onPromote: () => void }) {
  return (
    <button
      type="button"
      onClick={onPromote}
      className={cn(
        "w-full text-left p-3 rounded-2xl border border-border bg-card",
        "hover:border-primary/60 hover:bg-muted/40 transition-colors"
      )}
    >
      <div className="flex items-start gap-2">
        <Badge tone={PRIORITY_TONE[task.priority]}>{task.priority}</Badge>
        <span className="text-sm text-fg flex-1">{task.title}</span>
      </div>
      {task.project && (
        <p className="text-xs text-muted-fg mt-1.5">📦 {task.project.name}</p>
      )}
    </button>
  );
}
