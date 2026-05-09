import { useQuery } from "@tanstack/react-query";
import { fetchProjectDeepDive } from "@/lib/api";

export function useProjectDeepDive(id: number) {
  return useQuery({
    queryKey: ["project-deep-dive", id],
    queryFn: () => fetchProjectDeepDive(id),
    staleTime: 30_000,
    enabled: id > 0,
  });
}
