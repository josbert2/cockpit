import { useQuery } from "@tanstack/react-query";
import { fetchProjects, type ProjectFilters } from "@/lib/api";

export function useProjects(filters: ProjectFilters = {}) {
  return useQuery({
    queryKey: ["projects", filters],
    queryFn: () => fetchProjects(filters),
    staleTime: 60_000,
  });
}
