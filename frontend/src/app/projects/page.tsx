"use client";

import { useState } from "react";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProjects } from "@/hooks/useProjects";
import type { ProjectStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: Array<{ key: string; label: string; tone?: ProjectStatus }> = [
  { key: "", label: "Todos" },
  { key: "HOT", label: "Hot", tone: "HOT" },
  { key: "ACTIVE", label: "Active", tone: "ACTIVE" },
  { key: "PAUSED", label: "Paused", tone: "PAUSED" },
  { key: "IDLE", label: "Idle", tone: "IDLE" },
  { key: "STALE", label: "Stale", tone: "STALE" },
];

export default function ProjectListPage() {
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const { data: projects = [], isLoading, error } = useProjects({
    status: status || undefined,
    q: search || undefined,
    sort: "days_since_commit",
  });

  const totalByStatus = projects.reduce<Record<string, number>>((acc, p) => {
    acc[p.status] = (acc[p.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-12 py-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        emoji="📦"
        title="Proyectos"
        description={
          isLoading
            ? "Cargando..."
            : `${projects.length} repos en ~/root/. Datos en vivo.`
        }
      />

      <div className="flex flex-wrap items-center gap-1 ml-12">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatus(f.key)}
            className={cn(
              "px-2.5 py-1 rounded text-xs font-medium transition-colors",
              status === f.key
                ? "bg-hover text-fg"
                : "text-muted-fg hover:bg-hover hover:text-fg"
            )}
          >
            {f.label}
            {f.tone && totalByStatus[f.tone] ? (
              <span className="ml-1.5 text-[10px] tabular-nums opacity-70">
                {totalByStatus[f.tone]}
              </span>
            ) : null}
          </button>
        ))}
        <div className="ml-auto">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="h-7 px-2.5 rounded bg-input border-0 text-sm placeholder:text-muted-fg focus:outline-none focus:bg-hover w-48"
          />
        </div>
      </div>

      {error && (
        <div className="ml-12 p-3 rounded bg-danger/10 text-danger text-sm border border-danger/20">
          Error al cargar proyectos. Revisá que `php artisan serve` esté corriendo en :8000.
        </div>
      )}

      <div className="ml-12 border-t border-border">
        <div className="grid grid-cols-[6rem_1fr_5rem_5rem_10rem_2fr] text-[11px] font-semibold uppercase tracking-wider text-muted-fg/70 border-b border-border">
          <div className="px-2 py-2">Status</div>
          <div className="px-2 py-2">Repo</div>
          <div className="px-2 py-2 text-right">Días</div>
          <div className="px-2 py-2 text-right">30d</div>
          <div className="px-2 py-2">Stack</div>
          <div className="px-2 py-2">Último commit</div>
        </div>

        {isLoading && (
          <div className="px-2 py-8 text-center text-muted-fg text-sm">
            Cargando...
          </div>
        )}

        {!isLoading &&
          projects.map((p) => (
            <div
              key={p.id}
              className="grid grid-cols-[6rem_1fr_5rem_5rem_10rem_2fr] text-sm border-b border-border hover:bg-hover/60 transition-colors group cursor-pointer"
            >
              <div className="px-2 py-2.5">
                <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
              </div>
              <div className="px-2 py-2.5">
                <div className="font-medium text-fg">{p.name}</div>
                <div className="text-xs text-muted-fg mt-0.5 truncate font-mono">
                  {p.path.replace("/home/jos/", "~/")}
                </div>
              </div>
              <div className="px-2 py-2.5 text-right tabular-nums text-muted-fg">
                {p.days_since_commit}
              </div>
              <div className="px-2 py-2.5 text-right tabular-nums text-muted-fg">
                {p.commits_30d}
              </div>
              <div className="px-2 py-2.5">
                {p.stack ? (
                  <span className="text-xs text-muted-fg font-mono">{p.stack}</span>
                ) : (
                  <span className="text-muted-fg/50 text-xs">—</span>
                )}
              </div>
              <div className="px-2 py-2.5 text-muted-fg text-xs truncate">
                {p.last_commit_msg ?? "—"}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
