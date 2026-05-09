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
