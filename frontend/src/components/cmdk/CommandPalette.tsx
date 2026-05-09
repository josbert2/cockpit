"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Inbox,
  LayoutGrid,
  ListChecks,
  Plus,
  RefreshCw,
  Search,
  Sun,
  CalendarDays,
  Folder,
} from "lucide-react";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useVaultSync } from "@/hooks/useVaultSync";
import { useGenerateWeeklyReview } from "@/hooks/useWeekly";
import { useCompleteTask } from "@/hooks/useTasks";
import { fuzzyFilter } from "@/lib/fuzzy";
import { cn } from "@/lib/utils";

type Cmd = {
  id: string;
  label: string;
  hint?: string;
  group: "Navegación" | "Proyectos" | "Tareas" | "Acciones";
  icon: React.ReactNode;
  run: () => void | Promise<unknown>;
  keywords?: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: projects = [] } = useProjects();
  const { data: tasks = [] } = useTasks({ source: "manual" });
  const sync = useVaultSync();
  const generateWeekly = useGenerateWeeklyReview();
  const complete = useCompleteTask();

  const commands = useMemo<Cmd[]>(() => {
    const nav: Cmd[] = [
      { id: "nav:dashboard", label: "Ir a Dashboard", group: "Navegación", icon: <LayoutGrid className="size-3.5" />, run: () => router.push("/") },
      { id: "nav:today", label: "Ir a Hoy", group: "Navegación", icon: <Sun className="size-3.5" />, run: () => router.push("/today") },
      { id: "nav:projects", label: "Ir a Proyectos", group: "Navegación", icon: <Folder className="size-3.5" />, run: () => router.push("/projects") },
      { id: "nav:tasks", label: "Ir a Tareas", group: "Navegación", icon: <ListChecks className="size-3.5" />, run: () => router.push("/tasks") },
      { id: "nav:inbox", label: "Ir a Inbox", group: "Navegación", icon: <Inbox className="size-3.5" />, run: () => router.push("/inbox") },
      { id: "nav:weekly", label: "Ir a Weekly", group: "Navegación", icon: <CalendarDays className="size-3.5" />, run: () => router.push("/weekly") },
    ];

    const projectCmds: Cmd[] = projects.slice(0, 38).map((p) => ({
      id: `proj:${p.id}`,
      label: p.name,
      hint: `${p.status} · ${p.days_since_commit}d desde último commit`,
      group: "Proyectos",
      icon: <Folder className="size-3.5" />,
      run: () => router.push(`/projects/${p.id}`),
      keywords: `${p.path} ${p.stack ?? ""}`,
    }));

    const taskCmds: Cmd[] = tasks.slice(0, 50).map((t) => ({
      id: `task:${t.id}`,
      label: t.title,
      hint: `${t.priority}${t.project ? ` · ${t.project.name}` : ""}`,
      group: "Tareas",
      icon: <CheckCircle2 className="size-3.5" />,
      run: () => complete.mutate(t.id),
      keywords: t.project?.name ?? "",
    }));

    const actions: Cmd[] = [
      {
        id: "act:sync-vault",
        label: "Sync vault tasks",
        hint: "Re-escanear ~/vault/*.md",
        group: "Acciones",
        icon: <RefreshCw className="size-3.5" />,
        run: () => sync.mutate(),
      },
      {
        id: "act:generate-weekly",
        label: "Generate weekly review",
        hint: "Crea _weekly/YYYY-WXX.md",
        group: "Acciones",
        icon: <CalendarDays className="size-3.5" />,
        run: () => generateWeekly.mutate({}),
      },
      {
        id: "act:new-task",
        label: "Nueva tarea (ir a /tasks)",
        group: "Acciones",
        icon: <Plus className="size-3.5" />,
        run: () => router.push("/tasks"),
      },
    ];

    return [...nav, ...actions, ...projectCmds, ...taskCmds];
  }, [projects, tasks, router, sync, generateWeekly, complete]);

  const filtered = useMemo(() => {
    return fuzzyFilter(commands, query, (c) => `${c.label} ${c.keywords ?? ""}`).slice(0, 60);
  }, [commands, query]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 10);
    } else {
      setQuery("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const cmd = filtered[activeIdx];
        if (cmd) {
          cmd.run();
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, filtered, activeIdx, onClose]);

  if (!open) return null;

  // Group by group key, mantener orden por score (filtered ya está ordenado)
  const groups = filtered.reduce<Record<string, typeof filtered>>((acc, c) => {
    if (!acc[c.group]) acc[c.group] = [];
    acc[c.group].push(c);
    return acc;
  }, {});
  const groupOrder = ["Navegación", "Acciones", "Proyectos", "Tareas"];

  let runningIdx = 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 bg-fg/20 backdrop-blur-sm"
        aria-hidden
      />
      <div
        className="relative w-full max-w-xl rounded-md border border-border bg-card shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 h-12 border-b border-border">
          <Search className="size-4 text-muted-fg shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar proyecto, tarea, acción..."
            className="flex-1 h-full bg-transparent text-sm focus:outline-none text-fg placeholder:text-muted-fg/70"
          />
          <kbd className="text-[10px] font-mono text-muted-fg border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-muted-fg">
              Nada encontrado para “{query}”
            </div>
          )}
          {groupOrder.map((g) => {
            const items = groups[g];
            if (!items || items.length === 0) return null;
            return (
              <div key={g}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-fg/60">
                  {g}
                </div>
                {items.map((cmd) => {
                  const isActive = runningIdx === activeIdx;
                  const myIdx = runningIdx++;
                  return (
                    <button
                      key={cmd.id}
                      type="button"
                      onMouseEnter={() => setActiveIdx(myIdx)}
                      onClick={() => {
                        cmd.run();
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 h-9 text-sm transition-colors text-left",
                        isActive ? "bg-hover text-fg" : "text-muted-fg hover:bg-hover/60"
                      )}
                    >
                      <span
                        className={cn(
                          "size-5 grid place-items-center rounded shrink-0",
                          isActive ? "bg-primary/10 text-primary" : "text-muted-fg/70"
                        )}
                      >
                        {cmd.icon}
                      </span>
                      <span className="flex-1 truncate">
                        <span className="text-fg font-medium">{cmd.label}</span>
                        {cmd.hint && (
                          <span className="text-muted-fg ml-2 text-xs">{cmd.hint}</span>
                        )}
                      </span>
                      {isActive && <ArrowRight className="size-3.5 text-muted-fg" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="border-t border-border px-3 h-8 flex items-center gap-3 text-[10px] text-muted-fg">
          <span className="flex items-center gap-1">
            <kbd className="font-mono border border-border rounded px-1">↑↓</kbd>
            navegar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono border border-border rounded px-1">↵</kbd>
            ejecutar
          </span>
          <span className="flex items-center gap-1">
            <kbd className="font-mono border border-border rounded px-1">esc</kbd>
            cerrar
          </span>
          <span className="ml-auto">{filtered.length} resultados</span>
        </div>
      </div>
    </div>
  );
}
