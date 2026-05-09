"use client";

import { Trash2 } from "lucide-react";
import {
  useEntityProperties,
  useSetEntityProperty,
  usePropertyDefinitions,
  useDeletePropertyDefinition,
} from "@/hooks/useProperties";
import { PropertyValueEditor } from "./PropertyValueEditor";
import { AddPropertyButton } from "./AddPropertyButton";

/**
 * Panel completo de properties Notion-style para una entidad.
 * Renderiza definitions + editor inline + botón add.
 */
export function PropertiesPanel({
  entityType,
  entityId,
  className,
}: {
  entityType: "task" | "project";
  entityId: number;
  className?: string;
}) {
  const { data: definitions = [] } = usePropertyDefinitions(entityType);
  const { data: entries = [] } = useEntityProperties(entityType, entityId);
  const setProp = useSetEntityProperty(entityType, entityId);
  const deleteDef = useDeletePropertyDefinition();

  return (
    <div className={className}>
      <div className="space-y-1">
        {definitions.map((def) => {
          const entry = entries.find((e) => e.definition.id === def.id);
          return (
            <div
              key={def.id}
              className="grid grid-cols-[10rem_1fr_1.5rem] items-center gap-3 py-1 group hover:bg-hover/50 rounded -mx-2 px-2"
            >
              <span className="text-xs text-muted-fg font-medium uppercase tracking-wider truncate">
                {def.name}
              </span>
              <div className="min-w-0">
                <PropertyValueEditor
                  definition={def}
                  value={entry?.value ?? null}
                  onChange={(value) =>
                    setProp.mutate({ definitionId: def.id, value })
                  }
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`¿Borrar la propiedad "${def.name}"?`))
                    deleteDef.mutate(def.id);
                }}
                className="opacity-0 group-hover:opacity-100 size-5 grid place-items-center rounded text-danger hover:bg-danger/10 transition-opacity"
                aria-label="Borrar property"
              >
                <Trash2 className="size-3" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-2 relative">
        <AddPropertyButton entityType={entityType} />
      </div>
    </div>
  );
}
