import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  archiveInboxItem,
  deleteInboxItem,
  fetchInbox,
  moveInboxItem,
  type InboxMoveType,
} from "@/lib/api";

export function useInbox() {
  return useQuery({
    queryKey: ["inbox"],
    queryFn: fetchInbox,
    staleTime: 30_000,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["inbox"] });
}

export function useMoveInbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, project, type }: { slug: string; project: string; type?: InboxMoveType }) =>
      moveInboxItem(slug, project, type),
    onSuccess: () => invalidate(qc),
  });
}

export function useArchiveInbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => archiveInboxItem(slug),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteInbox() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteInboxItem(slug),
    onSuccess: () => invalidate(qc),
  });
}
