import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPropertyDefinition,
  deletePropertyDefinition,
  fetchEntityProperties,
  fetchPropertyDefinitions,
  setEntityPropertyValue,
  type CreateDefinitionInput,
} from "@/lib/api";

export function usePropertyDefinitions(entity: "task" | "project" = "task") {
  return useQuery({
    queryKey: ["property-definitions", entity],
    queryFn: () => fetchPropertyDefinitions(entity),
    staleTime: 60_000,
  });
}

export function useCreatePropertyDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateDefinitionInput) => createPropertyDefinition(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["property-definitions"] }),
  });
}

export function useDeletePropertyDefinition() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePropertyDefinition(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["property-definitions"] });
      qc.invalidateQueries({ queryKey: ["entity-properties"] });
    },
  });
}

export function useEntityProperties(
  entityType: "task" | "project",
  entityId: number
) {
  return useQuery({
    queryKey: ["entity-properties", entityType, entityId],
    queryFn: () => fetchEntityProperties(entityType, entityId),
    staleTime: 30_000,
    enabled: entityId > 0,
  });
}

export function useSetEntityProperty(
  entityType: "task" | "project",
  entityId: number
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ definitionId, value }: { definitionId: number; value: unknown }) =>
      setEntityPropertyValue(entityType, entityId, definitionId, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["entity-properties", entityType, entityId] });
    },
  });
}
