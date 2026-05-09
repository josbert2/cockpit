"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PageHeader } from "@/components/ui/PageHeader";
import { Archive, Trash2, ArrowRight, FileText } from "lucide-react";
import {
  useInbox,
  useMoveInbox,
  useArchiveInbox,
  useDeleteInbox,
} from "@/hooks/useInbox";
import { useProjects } from "@/hooks/useProjects";
import type { InboxItem, InboxMoveType } from "@/lib/api";

const TYPE_OPTIONS: Array<{ value: InboxMoveType; label: string; emoji: string }> = [
  { value: "note", label: "Nota", emoji: "📝" },
  { value: "decision", label: "Decision", emoji: "⚖" },
  { value: "feature", label: "Feature", emoji: "✨" },
  { value: "bug", label: "Bug", emoji: "🐛" },
  { value: "idea", label: "Idea", emoji: "💡" },
];

export default function InboxPage() {
  const { data: items = [], isLoading } = useInbox();
  const { data: projects = [] } = useProjects();
  const move = useMoveInbox();
  const archive = useArchiveInbox();
  const del = useDeleteInbox();

  return (
    <div className="px-12 py-8 max-w-3xl mx-auto space-y-6">
      <PageHeader
        emoji="📥"
        title="Inbox"
        description={
          isLoading
            ? "Cargando..."
            : `${items.length} captura${items.length === 1 ? "" : "s"} pendiente${
                items.length === 1 ? "" : "s"
              }. Real-time activo (Reverb).`
        }
      />

      {items.length === 0 && !isLoading && (
        <Card className="text-center py-16">
          <FileText className="size-8 mx-auto text-muted-fg mb-3" />
          <p className="text-muted-fg">Inbox vacío.</p>
          <p className="text-xs text-muted-fg mt-2">
            Capturas viven en <code className="text-xs bg-muted px-1.5 py-0.5 rounded">~/vault/_inbox/</code>.
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <InboxCard
            key={item.slug}
            item={item}
            projects={projects.map((p) => p.name)}
            onMove={(project, type) =>
              move.mutate({ slug: item.slug, project, type })
            }
            onArchive={() => archive.mutate(item.slug)}
            onDelete={() => {
              if (confirm("¿Borrar esta captura del inbox?")) del.mutate(item.slug);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function InboxCard({
  item,
  projects,
  onMove,
  onArchive,
  onDelete,
}: {
  item: InboxItem;
  projects: string[];
  onMove: (project: string, type: InboxMoveType) => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const [project, setProject] = useState(
    String(item.frontmatter.project ?? "")
  );
  const [type, setType] = useState<InboxMoveType>(
    (item.frontmatter.type as InboxMoveType) ?? "note"
  );

  const fmType = item.frontmatter.type as string | undefined;
  const fmProject = item.frontmatter.project as string | undefined;
  const title = String(item.frontmatter.id ?? item.slug)
    .replace(/^\d{4}-\d{2}-\d{2}-/, "")
    .replace(/-/g, " ");

  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-fg capitalize">{title}</h3>
          <div className="flex items-center gap-2 mt-1.5">
            {fmType && <Badge tone="primary">{fmType}</Badge>}
            {fmProject && <Badge tone="purple">{fmProject}</Badge>}
            <span className="text-xs text-muted-fg">
              {item.word_count}w · {new Date(item.modified_at).toLocaleString("es-CL", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-fg leading-relaxed whitespace-pre-line">
        {item.body.slice(0, 280)}
        {item.body.length > 280 && "…"}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_10rem_auto_auto_auto] gap-2 pt-2 border-t border-border">
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="h-9 px-3 rounded-xl bg-input border border-border text-sm focus:outline-none focus:border-primary/60"
        >
          <option value="">— elegir proyecto —</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as InboxMoveType)}
          className="h-9 px-3 rounded-xl bg-input border border-border text-sm focus:outline-none focus:border-primary/60"
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.emoji} {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => project && onMove(project, type)}
          disabled={!project}
          className="h-9 px-3 rounded-xl bg-primary text-primary-fg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          Mover <ArrowRight className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onArchive}
          className="h-9 w-9 grid place-items-center rounded-xl text-muted-fg border border-border hover:bg-muted hover:text-fg"
          aria-label="Archivar"
        >
          <Archive className="size-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="h-9 w-9 grid place-items-center rounded-xl text-danger border border-danger/30 hover:bg-danger/10"
          aria-label="Borrar"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
    </Card>
  );
}
