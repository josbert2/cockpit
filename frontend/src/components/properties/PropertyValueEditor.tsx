"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import type { PropertyDefinition } from "@/lib/api";
import { cn } from "@/lib/utils";

type Tone = "primary" | "success" | "warning" | "danger" | "purple" | "muted";

interface Props {
  definition: PropertyDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  className?: string;
}

export function PropertyValueEditor({ definition, value, onChange, className }: Props) {
  const [editing, setEditing] = useState(false);

  switch (definition.type) {
    case "text":
      return editing ? (
        <input
          autoFocus
          type="text"
          defaultValue={(value as string) ?? ""}
          onBlur={(e) => {
            onChange(e.target.value || null);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditing(false);
          }}
          className={cn(
            "h-6 px-1.5 rounded bg-input border-0 text-xs w-full focus:outline-none focus:bg-hover",
            className
          )}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={cn("text-xs text-muted-fg hover:text-fg text-left", className)}
        >
          {value ? String(value) : <span className="opacity-50">empty</span>}
        </button>
      );

    case "number":
      return editing ? (
        <input
          autoFocus
          type="number"
          defaultValue={(value as number) ?? ""}
          onBlur={(e) => {
            onChange(e.target.value === "" ? null : Number(e.target.value));
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-6 px-1.5 rounded bg-input border-0 text-xs w-20 focus:outline-none focus:bg-hover tabular-nums"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs tabular-nums text-muted-fg hover:text-fg"
        >
          {value !== null && value !== undefined ? String(value) : <span className="opacity-50">—</span>}
        </button>
      );

    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
      );

    case "url":
      return editing ? (
        <input
          autoFocus
          type="url"
          defaultValue={(value as string) ?? ""}
          onBlur={(e) => {
            onChange(e.target.value || null);
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setEditing(false);
          }}
          className="h-6 px-1.5 rounded bg-input border-0 text-xs w-full focus:outline-none focus:bg-hover"
        />
      ) : value ? (
        <div className="flex items-center gap-1 text-xs">
          <a
            href={String(value)}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {String(value)}
          </a>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-fg/60 hover:text-fg"
            aria-label="Edit"
          >
            <ExternalLink className="size-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-muted-fg/50 hover:text-fg"
        >
          add link
        </button>
      );

    case "select":
    case "status": {
      const options = definition.config?.options ?? [];
      const current = options.find((o) => o.label === value);
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className={cn(
            "h-6 px-1.5 rounded bg-transparent border-0 text-xs focus:outline-none focus:bg-hover",
            current && `bg-${current.color ?? "muted"}/15`
          )}
        >
          <option value="">—</option>
          {options.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    case "date":
      return (
        <input
          type="date"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="h-6 px-1.5 rounded bg-input border-0 text-xs focus:outline-none focus:bg-hover"
        />
      );

    case "multi_select": {
      const opts = definition.config?.options ?? [];
      const current = (value as string[]) ?? [];
      return (
        <div className="flex flex-wrap gap-1">
          {opts.map((o) => {
            const active = current.includes(o.label);
            return (
              <button
                key={o.label}
                type="button"
                onClick={() => {
                  const next = active
                    ? current.filter((v) => v !== o.label)
                    : [...current, o.label];
                  onChange(next.length ? next : null);
                }}
              >
                <Badge tone={active ? ((o.color as Tone) ?? "primary") : "muted"}>
                  {o.label}
                </Badge>
              </button>
            );
          })}
        </div>
      );
    }

    default:
      return <span className="text-xs text-muted-fg/50">unsupported</span>;
  }
}
