import { useMutation, useQueryClient } from "@tanstack/react-query";
import { syncVaultTasks } from "@/lib/api";

export function useVaultSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => syncVaultTasks(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
