"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Proyectos</h1>
        <p className="text-sm text-muted-fg mt-1">
          {isLoading
            ? "Cargando..."
            : `${projects.length} repos en ~/root/. Datos en vivo desde la API.`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setStatus(f.key)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              status === f.key
                ? "bg-primary text-primary-fg border-primary"
                : "bg-card border-border text-muted-fg hover:text-fg"
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
            placeholder="Buscar repo..."
            className="h-8 px-3 rounded-xl bg-input border border-border text-sm placeholder:text-muted-fg focus:outline-none focus:border-primary/60"
          />
        </div>
      </div>

      {error && (
        <Card className="bg-danger/10 text-danger border-danger/30">
          Error al cargar proyectos. Revisá que `php artisan serve` esté corriendo en :8000.
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-fg text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Repo</th>
              <th className="text-right p-3 font-medium">Días</th>
              <th className="text-right p-3 font-medium">30d</th>
              <th className="text-left p-3 font-medium">Stack</th>
              <th className="text-left p-3 font-medium">Último commit</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-fg">
                  Cargando...
                </td>
              </tr>
            )}
            {!isLoading && projects.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-fg">
                  Sin proyectos. Corré <code className="bg-muted px-1.5 py-0.5 rounded">php artisan cockpit:scan</code>.
                </td>
              </tr>
            )}
            {projects.map((p) => (
              <tr
                key={p.id}
                className="border-t border-border hover:bg-muted/40 transition-colors"
              >
                <td className="p-3">
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                </td>
                <td className="p-3 font-medium">
                  {p.name}
                  <div className="text-xs text-muted-fg font-normal mt-0.5 truncate max-w-md">
                    {p.path.replace("/home/jos/", "~/")}
                  </div>
                </td>
                <td className="p-3 text-right tabular-nums text-muted-fg">
                  {p.days_since_commit}
                </td>
                <td className="p-3 text-right tabular-nums text-muted-fg">
                  {p.commits_30d}
                </td>
                <td className="p-3">
                  {p.stack ? (
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                      {p.stack}
                    </code>
                  ) : (
                    <span className="text-muted-fg text-xs">—</span>
                  )}
                </td>
                <td className="p-3 text-muted-fg truncate max-w-md">
                  {p.last_commit_msg ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
