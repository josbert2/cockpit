"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  Folder,
  GitBranch,
  GitCommit,
  ListChecks,
  StickyNote,
  Users,
} from "lucide-react";
import { useProjectDeepDive } from "@/hooks/useProjectDeepDive";
import { Badge, STATUS_TONE } from "@/components/ui/Badge";
import { ActivityHeatmap } from "@/components/project/ActivityHeatmap";
import { MarkdownView } from "@/components/project/MarkdownView";
import { PRIORITY_TONE } from "@/hooks/useTasks";
import { cn } from "@/lib/utils";
import type { VaultSectionRecord } from "@/lib/api";

type Tab = "overview" | "vault" | "git" | "tasks";

const TABS: Array<{ key: Tab; label: string; icon: typeof Folder }> = [
  { key: "overview", label: "Overview", icon: Folder },
  { key: "vault", label: "Vault", icon: StickyNote },
  { key: "git", label: "Git log", icon: GitBranch },
  { key: "tasks", label: "Tasks", icon: ListChecks },
];

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = Number(id);
  const { data, isLoading } = useProjectDeepDive(projectId);
  const [tab, setTab] = useState<Tab>("overview");

  if (isLoading || !data) {
    return (
      <div className="px-12 py-8 max-w-6xl mx-auto space-y-6">
        <div className="h-4 w-40 bg-muted rounded animate-pulse" />
        <div className="h-10 w-72 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { project, tasks, task_stats, git, activity, vault } = data;

  return (
    <div className="px-12 py-8 max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/projects"
        className="flex items-center gap-1 text-xs text-muted-fg hover:text-fg w-fit"
      >
        <ArrowLeft className="size-3.5" /> Proyectos
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <span className="text-4xl leading-none select-none">📦</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-fg">
                {project.name}
              </h1>
              <Badge tone={STATUS_TONE[project.status]}>{project.status}</Badge>
            </div>
            <p className="text-sm text-muted-fg font-mono truncate">
              {project.path.replace("/home/jos/", "~/")}
            </p>
          </div>
          <a
            href={`vscode://file${project.path}`}
            className="flex items-center gap-1.5 px-3 h-8 rounded text-xs text-muted-fg hover:bg-hover hover:text-fg transition-colors border border-border"
          >
            <ExternalLink className="size-3.5" />
            VSCode
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label="Días" value={project.days_since_commit} hint="desde último commit" />
        <Stat label="Commits 30d" value={project.commits_30d} />
        <Stat label="Tasks abiertas" value={task_stats.open} hint={`${task_stats.manual} m · ${task_stats.vault} v`} />
        <Stat label="En hoy" value={task_stats.today} hint="slots usados" tone={task_stats.today > 0 ? "primary" : "muted"} />
      </div>

      {/* Tabs */}
      <div className="border-b border-border flex gap-1">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-9 text-sm transition-colors relative",
              tab === key
                ? "text-fg font-medium"
                : "text-muted-fg hover:text-fg"
            )}
          >
            <Icon className="size-3.5" />
            {label}
            {tab === key && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <OverviewTab activity={activity} project={project} vault={vault} git={git} />
      )}
      {tab === "vault" && <VaultTab vault={vault} />}
      {tab === "git" && <GitTab git={git} />}
      {tab === "tasks" && <TasksTab tasks={tasks} />}
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "default" | "primary" | "muted";
}) {
  const toneCls =
    tone === "primary" ? "bg-primary/5" : tone === "muted" ? "bg-muted/40" : "bg-card";
  return (
    <div className={cn("rounded-md border border-border p-3", toneCls)}>
      <p className="text-[11px] uppercase tracking-wider text-muted-fg/70 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold tabular-nums mt-1 text-fg">{value}</p>
      {hint && <p className="text-xs text-muted-fg mt-0.5">{hint}</p>}
    </div>
  );
}

function OverviewTab({
  activity,
  project,
  vault,
  git,
}: {
  activity: Array<{ date: string; count: number }>;
  project: { stack: string | null; last_commit_msg: string | null };
  vault: { available: boolean; readme?: { body: string } | null };
  git: { commits?: Array<{ short_sha: string; author: string; date: string; message: string }> };
}) {
  const totalCommits = activity.reduce((s, d) => s + d.count, 0);
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg">
            Actividad (60 días)
          </h2>
          <span className="text-xs text-muted-fg">
            {totalCommits} commits totales
          </span>
        </div>
        <ActivityHeatmap data={activity} />
      </div>

      {project.stack && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-2">
            Stack
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {project.stack.split(/\s+/).filter(Boolean).map((s) => (
              <Badge key={s} tone="primary">
                {s}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {vault.available && vault.readme?.body && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3">
            README del vault
          </h2>
          <MarkdownView source={vault.readme.body} />
        </div>
      )}

      {git.commits && git.commits.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3">
            Últimos commits
          </h2>
          <div className="space-y-1.5">
            {git.commits.slice(0, 5).map((c) => (
              <CommitRow key={c.short_sha} commit={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function VaultTab({ vault }: { vault: { available: boolean; readme?: { body: string } | null; sections?: VaultSectionRecord; project_dir?: string } }) {
  if (!vault.available) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center text-muted-fg text-sm">
        Este proyecto no tiene carpeta en el vault todavía.
        <br />
        <span className="text-xs">
          Creá <code className="bg-muted px-1.5 py-0.5 rounded">~/vault/01-Projects/&lt;name&gt;/</code> con un README.md.
        </span>
      </div>
    );
  }

  const sectionLabels: Record<string, { label: string; emoji: string }> = {
    decisions: { label: "Decisions", emoji: "⚖" },
    features: { label: "Features", emoji: "✨" },
    bugs: { label: "Bugs", emoji: "🐛" },
    glossary: { label: "Glossary", emoji: "📖" },
    people: { label: "People", emoji: "👥" },
    research: { label: "Research", emoji: "🔬" },
  };

  return (
    <div className="space-y-6">
      {vault.readme?.body && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3">
            README
          </h2>
          <MarkdownView source={vault.readme.body} />
        </div>
      )}

      {Object.entries(vault.sections ?? {}).map(([key, files]) => {
        if (!files || files.length === 0) return null;
        const meta = sectionLabels[key] ?? { label: key, emoji: "📄" };
        return (
          <div key={key} className="rounded-md border border-border bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg mb-3 flex items-center gap-2">
              <span>{meta.emoji}</span>
              {meta.label}
              <span className="text-xs text-muted-fg/60 font-normal normal-case tracking-normal">
                · {files.length}
              </span>
            </h2>
            <div className="space-y-2">
              {files.map((f) => (
                <div
                  key={f.filename}
                  className="p-3 rounded border border-border bg-bg/40 hover:bg-hover/40 transition-colors"
                >
                  <p className="font-medium text-sm text-fg">{f.title}</p>
                  <p className="text-xs text-muted-fg mt-1 line-clamp-2">
                    {f.preview}
                  </p>
                  <p className="text-[10px] text-muted-fg/70 font-mono mt-1.5">
                    {f.filename} · {new Date(f.modified_at).toLocaleDateString("es-CL")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GitTab({
  git,
}: {
  git: {
    available: boolean;
    branch?: string | null;
    commits?: Array<{ short_sha: string; author: string; date: string; message: string }>;
    contributors?: Array<{ commits: number; name: string }>;
  };
}) {
  if (!git.available) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center text-muted-fg text-sm">
        Este proyecto no es un repo git.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg flex items-center gap-2">
            <GitBranch className="size-3.5" />
            Branch · {git.branch ?? "—"}
          </h2>
          <span className="text-xs text-muted-fg">{git.commits?.length ?? 0} commits visibles</span>
        </div>
        <div className="space-y-1.5">
          {git.commits?.map((c) => (
            <CommitRow key={c.short_sha} commit={c} />
          ))}
        </div>
      </div>

      {git.contributors && git.contributors.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-fg flex items-center gap-2 mb-3">
            <Users className="size-3.5" />
            Contributors
          </h2>
          <div className="space-y-1">
            {git.contributors.map((c) => (
              <div
                key={c.name}
                className="flex items-center justify-between text-sm py-1"
              >
                <span className="text-fg">{c.name}</span>
                <span className="text-muted-fg tabular-nums">{c.commits} commits</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TasksTab({ tasks }: { tasks: Array<{
  id: number;
  title: string;
  status: string;
  priority: "urgent" | "high" | "med" | "low";
  source: string;
  today: boolean;
  today_slot: number | null;
  vault_path: string | null;
}> }) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-md border border-border bg-card p-8 text-center text-muted-fg text-sm">
        Este proyecto no tiene tareas asociadas.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <div className="space-y-1">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-3 px-2 py-2 rounded hover:bg-hover/60 transition-colors"
          >
            <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm",
                  t.status === "done" || t.status === "canceled"
                    ? "text-muted-fg line-through"
                    : "text-fg"
                )}
              >
                {t.title}
              </p>
              {t.vault_path && (
                <p className="text-[10px] text-muted-fg font-mono mt-0.5 truncate">
                  📝 {t.vault_path}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-fg shrink-0">
              {t.source === "vault" && (
                <span className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px]">vault</span>
              )}
              {t.today && <span className="text-primary">slot {t.today_slot}</span>}
              <span className="text-muted-fg/60">{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CommitRow({
  commit,
}: {
  commit: { short_sha: string; author: string; date: string; message: string };
}) {
  return (
    <div className="flex items-start gap-3 px-2 py-2 rounded hover:bg-hover/60 transition-colors">
      <GitCommit className="size-3.5 text-muted-fg mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-fg truncate">{commit.message}</p>
        <p className="text-[11px] text-muted-fg mt-0.5">
          {commit.author} · {new Date(commit.date).toLocaleString("es-CL", { day: "2-digit", month: "short", year: "numeric" })}
        </p>
      </div>
      <code className="text-[10px] text-muted-fg/70 font-mono shrink-0">
        {commit.short_sha}
      </code>
    </div>
  );
}
