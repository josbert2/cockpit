"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useCreatePropertyDefinition } from "@/hooks/useProperties";
import type { PropertyType } from "@/lib/api";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS: Array<{ value: PropertyType; label: string; emoji: string }> = [
  { value: "text", label: "Text", emoji: "T" },
  { value: "number", label: "Number", emoji: "#" },
  { value: "select", label: "Select", emoji: "▾" },
  { value: "multi_select", label: "Multi-select", emoji: "▾▾" },
  { value: "checkbox", label: "Checkbox", emoji: "☑" },
  { value: "date", label: "Date", emoji: "📅" },
  { value: "url", label: "URL", emoji: "🔗" },
  { value: "status", label: "Status", emoji: "●" },
];

export function AddPropertyButton({
  entityType = "task",
  className,
}: {
  entityType?: "task" | "project";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("text");
  const [optionsRaw, setOptionsRaw] = useState("");
  const create = useCreatePropertyDefinition();

  const needsOptions = type === "select" || type === "multi_select" || type === "status";

  const handleCreate = () => {
    if (!name.trim()) return;
    const config = needsOptions
      ? {
          options: optionsRaw
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .map((label, i) => ({
              label,
              color: ["primary", "success", "warning", "danger", "purple"][i % 5],
            })),
        }
      : null;
    create.mutate(
      { entity_type: entityType, name: name.trim(), type, config },
      {
        onSuccess: () => {
          setName("");
          setOptionsRaw("");
          setType("text");
          setOpen(false);
        },
      }
    );
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1 px-2 h-7 rounded text-xs text-muted-fg hover:bg-hover hover:text-fg transition-colors",
          className
        )}
      >
        <Plus className="size-3.5" /> Add property
      </button>
    );
  }

  return (
    <div className="absolute z-20 mt-1 w-80 rounded-md border border-border bg-card shadow-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-fg">
          New property
        </h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="size-5 grid place-items-center rounded text-muted-fg hover:bg-hover"
          aria-label="Close"
        >
          <X className="size-3.5" />
        </button>
      </div>

      <input
        autoFocus
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Property name (ej: Effort)"
        className="w-full h-8 px-2 rounded bg-input border-0 text-sm focus:outline-none focus:bg-hover"
      />

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-fg mb-1">
          Type
        </p>
        <div className="grid grid-cols-2 gap-1">
          {TYPE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={cn(
                "flex items-center gap-2 px-2 h-7 rounded text-xs text-left transition-colors",
                type === opt.value
                  ? "bg-hover text-fg font-medium"
                  : "text-muted-fg hover:bg-hover/60"
              )}
            >
              <span className="w-4 text-center">{opt.emoji}</span>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {needsOptions && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-fg mb-1">
            Options (coma separadas)
          </p>
          <input
            type="text"
            value={optionsRaw}
            onChange={(e) => setOptionsRaw(e.target.value)}
            placeholder="Quick, Medium, Heavy"
            className="w-full h-8 px-2 rounded bg-input border-0 text-sm focus:outline-none focus:bg-hover"
          />
        </div>
      )}

      <button
        type="button"
        onClick={handleCreate}
        disabled={!name.trim() || (needsOptions && !optionsRaw.trim())}
        className="w-full h-8 rounded bg-primary text-primary-fg text-sm font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Create
      </button>
    </div>
  );
}
