"use client";

import { useEntityProperties, useSetEntityProperty } from "@/hooks/useProperties";
import { PropertyValueEditor } from "./PropertyValueEditor";
import type { PropertyDefinition } from "@/lib/api";

/**
 * Renderiza una celda por property definition para una task,
 * poblando con el valor actual y permitiendo editar inline.
 */
export function TaskPropertyCells({
  taskId,
  definitions,
}: {
  taskId: number;
  definitions: PropertyDefinition[];
}) {
  const { data: entries = [] } = useEntityProperties("task", taskId);
  const setProp = useSetEntityProperty("task", taskId);

  return (
    <>
      {definitions.map((def) => {
        const entry = entries.find((e) => e.definition.id === def.id);
        return (
          <div key={def.id} className="px-2 py-2 min-w-0">
            <PropertyValueEditor
              definition={def}
              value={entry?.value ?? null}
              onChange={(value) => setProp.mutate({ definitionId: def.id, value })}
            />
          </div>
        );
      })}
    </>
  );
}
