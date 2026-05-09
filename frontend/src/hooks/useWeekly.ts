import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchWeeklyList,
  fetchWeeklySummary,
  generateWeeklyReview,
} from "@/lib/api";

export function useWeeklySummary(year?: number, week?: number) {
  return useQuery({
    queryKey: ["weekly-summary", year, week],
    queryFn: () => fetchWeeklySummary(year, week),
    staleTime: 60_000,
  });
}

export function useWeeklyList() {
  return useQuery({
    queryKey: ["weekly-list"],
    queryFn: fetchWeeklyList,
    staleTime: 60_000,
  });
}

export function useGenerateWeeklyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ year, week }: { year?: number; week?: number } = {}) =>
      generateWeeklyReview(year, week),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weekly-list"] }),
  });
}
