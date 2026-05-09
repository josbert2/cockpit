export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export type ProjectStatus = "HOT" | "ACTIVE" | "PAUSED" | "IDLE" | "STALE";

export interface Project {
  id: number;
  path: string;
  name: string;
  status: ProjectStatus;
  last_commit_at: string | null;
  last_commit_msg: string | null;
  commits_30d: number;
  stack: string | null;
  days_since_commit: number;
  notes: string | null;
  pinned: boolean;
  archived: boolean;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectFilters {
  status?: string;
  stack?: string;
  q?: string;
  sort?: string;
  desc?: boolean;
}

export async function fetchProjects(filters: ProjectFilters = {}): Promise<Project[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.stack) params.set("stack", filters.stack);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.desc) params.set("desc", "1");

  const url = `${API_BASE}/api/projects${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchProjects failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

// ===== Tasks =====

export type TaskStatus = "todo" | "doing" | "done" | "canceled";
export type TaskPriority = "urgent" | "high" | "med" | "low";

export interface Task {
  id: number;
  title: string;
  notes: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  effort: "S" | "M" | "L" | null;
  energy: "deep" | "admin" | "creative" | null;
  tags: string[] | null;
  due_date: string | null;
  today: boolean;
  today_slot: number | null;
  project_id: number | null;
  project: { id: number; name: string; status: string } | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: string;
  today?: boolean;
  project_id?: number;
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.today) params.set("today", "1");
  if (filters.project_id) params.set("project_id", String(filters.project_id));
  const url = `${API_BASE}/api/tasks${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchTasks failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export interface CreateTaskInput {
  title: string;
  project_id?: number | null;
  priority?: TaskPriority;
  due_date?: string | null;
  effort?: "S" | "M" | "L" | null;
  energy?: "deep" | "admin" | "creative" | null;
  tags?: string[] | null;
  notes?: string | null;
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`createTask failed: ${res.status}`);
  return res.json();
}

export async function updateTask(
  id: number,
  patch: Partial<CreateTaskInput & { status: TaskStatus }>
): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`updateTask failed: ${res.status}`);
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteTask failed: ${res.status}`);
}

export async function promoteTaskToToday(id: number, slot?: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}/today`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(slot ? { slot } : {}),
  });
  if (!res.ok) throw new Error(`promoteTaskToToday failed: ${res.status}`);
  return res.json();
}

export async function removeTaskFromToday(id: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}/today`, { method: "DELETE" });
  if (!res.ok) throw new Error(`removeTaskFromToday failed: ${res.status}`);
  return res.json();
}

export async function completeTask(id: number): Promise<Task> {
  const res = await fetch(`${API_BASE}/api/tasks/${id}/complete`, { method: "POST" });
  if (!res.ok) throw new Error(`completeTask failed: ${res.status}`);
  return res.json();
}
