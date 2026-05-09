import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeTask,
  createTask,
  deleteTask,
  fetchTasks,
  promoteTaskToToday,
  removeTaskFromToday,
  updateTask,
  type CreateTaskInput,
  type Task,
  type TaskFilters,
  type TaskStatus,
} from "@/lib/api";

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 30_000,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["tasks"] });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: number } & Partial<CreateTaskInput & { status: TaskStatus }>) =>
      updateTask(id, patch),
    onSuccess: () => invalidate(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => invalidate(qc),
  });
}

export function usePromoteTaskToToday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, slot }: { id: number; slot?: number }) => promoteTaskToToday(id, slot),
    onSuccess: () => invalidate(qc),
  });
}

export function useRemoveTaskFromToday() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => removeTaskFromToday(id),
    onSuccess: () => invalidate(qc),
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => completeTask(id),
    onSuccess: () => invalidate(qc),
  });
}

export const PRIORITY_TONE = {
  urgent: "danger",
  high: "warning",
  med: "primary",
  low: "muted",
} as const;

export function taskInSlot(tasks: Task[], slot: number): Task | undefined {
  return tasks.find((t) => t.today_slot === slot);
}
