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
  source: "manual" | "vault";
  vault_path: string | null;
  vault_line: number | null;
  vault_hash: string | null;
  vault_synced_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: string;
  today?: boolean;
  project_id?: number;
  source?: "manual" | "vault" | "all";
}

export async function fetchTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.today) params.set("today", "1");
  if (filters.project_id) params.set("project_id", String(filters.project_id));
  if (filters.source && filters.source !== "all") params.set("source", filters.source);
  const url = `${API_BASE}/api/tasks${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchTasks failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function syncVaultTasks(): Promise<{
  upserted: number;
  created: number;
  updated: number;
  deleted: number;
  elapsed_s: number;
}> {
  const res = await fetch(`${API_BASE}/api/vault/sync-tasks`, { method: "POST" });
  if (!res.ok) throw new Error(`syncVaultTasks failed: ${res.status}`);
  return res.json();
}

export interface VaultSyncStatus {
  last_sync_at: string | null;
  watcher_active: boolean;
  watcher_stamp_age_s: number | null;
  vault_open_count: number;
}

export async function fetchVaultSyncStatus(): Promise<VaultSyncStatus> {
  const res = await fetch(`${API_BASE}/api/vault/sync-status`);
  if (!res.ok) throw new Error(`fetchVaultSyncStatus failed: ${res.status}`);
  return res.json();
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

// ===== Inbox =====

export interface InboxItem {
  slug: string;
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
  word_count: number;
  modified_at: string;
}

export async function fetchInbox(): Promise<InboxItem[]> {
  const res = await fetch(`${API_BASE}/api/inbox`);
  if (!res.ok) throw new Error(`fetchInbox failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export type InboxMoveType = "note" | "decision" | "feature" | "bug" | "idea";

export async function moveInboxItem(
  slug: string,
  project: string,
  type: InboxMoveType = "note"
): Promise<{ from: string; to: string }> {
  const res = await fetch(`${API_BASE}/api/inbox/${slug}/move`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ project, type }),
  });
  if (!res.ok) throw new Error(`moveInboxItem failed: ${res.status}`);
  return res.json();
}

export async function archiveInboxItem(slug: string): Promise<{ from: string; to: string }> {
  const res = await fetch(`${API_BASE}/api/inbox/${slug}/archive`, { method: "POST" });
  if (!res.ok) throw new Error(`archiveInboxItem failed: ${res.status}`);
  return res.json();
}

export async function deleteInboxItem(slug: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/inbox/${slug}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteInboxItem failed: ${res.status}`);
}

// ===== Properties (Notion-style) =====

export type PropertyType =
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "multi_select"
  | "date"
  | "url"
  | "status";

export interface PropertyDefinition {
  id: number;
  entity_type: "task" | "project";
  name: string;
  type: PropertyType;
  config: { options?: Array<{ label: string; color?: string }> } | null;
  order: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyEntry {
  definition: PropertyDefinition;
  value: unknown;
}

export async function fetchPropertyDefinitions(
  entity: "task" | "project" = "task"
): Promise<PropertyDefinition[]> {
  const res = await fetch(`${API_BASE}/api/properties/definitions?entity=${entity}`);
  if (!res.ok) throw new Error(`fetchPropertyDefinitions failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export interface CreateDefinitionInput {
  entity_type: "task" | "project";
  name: string;
  type: PropertyType;
  config?: { options?: Array<{ label: string; color?: string }> } | null;
  order?: number;
}

export async function createPropertyDefinition(
  input: CreateDefinitionInput
): Promise<PropertyDefinition> {
  const res = await fetch(`${API_BASE}/api/properties/definitions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`createPropertyDefinition failed: ${res.status}`);
  return res.json();
}

export async function deletePropertyDefinition(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/properties/definitions/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`deletePropertyDefinition failed: ${res.status}`);
}

export async function fetchEntityProperties(
  entityType: "task" | "project",
  entityId: number
): Promise<PropertyEntry[]> {
  const res = await fetch(`${API_BASE}/api/properties/${entityType}/${entityId}`);
  if (!res.ok) throw new Error(`fetchEntityProperties failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}

export async function setEntityPropertyValue(
  entityType: "task" | "project",
  entityId: number,
  definitionId: number,
  value: unknown
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/properties/${entityType}/${entityId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ definition_id: definitionId, value }),
  });
  if (!res.ok) throw new Error(`setEntityPropertyValue failed: ${res.status}`);
}

// ===== Dashboard =====

export interface DashboardSummary {
  project_status_counts: Record<ProjectStatus, number>;
  tasks_open: number;
  tasks_manual_open: number;
  tasks_vault_open: number;
  tasks_today_count: number;
  tasks_done_this_week: number;
  inbox_pending_count: number;
  today_tasks: Task[];
  hot_projects: Project[];
  inbox_preview: InboxItem[];
  tasks_by_project: Array<{
    project: { id: number; name: string; status: string };
    count: number;
  }>;
}

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch(`${API_BASE}/api/dashboard/summary`);
  if (!res.ok) throw new Error(`fetchDashboardSummary failed: ${res.status}`);
  return res.json();
}

// ===== Project Deep Dive =====

export interface VaultFile {
  filename: string;
  title: string;
  frontmatter: Record<string, unknown>;
  preview: string;
  modified_at: string;
}

export interface VaultSectionRecord {
  decisions?: VaultFile[];
  features?: VaultFile[];
  bugs?: VaultFile[];
  glossary?: VaultFile[];
  people?: VaultFile[];
  research?: VaultFile[];
}

export interface VaultMdFile {
  path: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ProjectDeepDive {
  project: Project;
  tasks: Task[];
  task_stats: {
    total: number;
    open: number;
    done: number;
    today: number;
    manual: number;
    vault: number;
  };
  git: {
    available: boolean;
    branch?: string | null;
    commits?: Array<{
      sha: string;
      short_sha: string;
      author: string;
      date: string;
      message: string;
    }>;
    contributors?: Array<{ commits: number; name: string }>;
  };
  activity: Array<{ date: string; count: number }>;
  vault: {
    available: boolean;
    project_dir?: string;
    readme?: VaultMdFile | null;
    claude_md?: VaultMdFile | null;
    sections?: VaultSectionRecord;
  };
}

export async function fetchProjectDeepDive(id: number): Promise<ProjectDeepDive> {
  const res = await fetch(`${API_BASE}/api/projects/${id}/deep-dive`);
  if (!res.ok) throw new Error(`fetchProjectDeepDive failed: ${res.status}`);
  return res.json();
}

// ===== Weekly review =====

export interface WeeklySummary {
  year: number;
  week: number;
  start: string;
  end: string;
  label: string;
  tasks_done: number;
  tasks_done_by_project: Array<{
    project: { id: number; name: string; status: string } | null;
    count: number;
  }>;
  tasks_carry_over: Array<{
    id: number;
    title: string;
    priority: TaskPriority;
    due_date: string | null;
    project: { id: number; name: string; status: string } | null;
  }>;
  tasks_today_pending: number;
  commits_total: number;
  commits_by_repo: Array<{ name: string; count: number }>;
  commits_by_day: Array<{ date: string; count: number }>;
  inbox_pending: Array<{ slug: string; frontmatter: Record<string, unknown> }>;
  top_tags: Array<{ tag: string; count: number }>;
  hot_projects: Array<{ name: string; commits_30d: number; last_commit_at: string | null }>;
}

export async function fetchWeeklySummary(year?: number, week?: number): Promise<WeeklySummary> {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (week) params.set("week", String(week));
  const url = `${API_BASE}/api/weekly/summary${params.toString() ? `?${params}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetchWeeklySummary failed: ${res.status}`);
  return res.json();
}

export async function generateWeeklyReview(
  year?: number,
  week?: number
): Promise<{ path: string; preview: string; year: number; week: number }> {
  const res = await fetch(`${API_BASE}/api/weekly/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ year, week }),
  });
  if (!res.ok) throw new Error(`generateWeeklyReview failed: ${res.status}`);
  return res.json();
}

export async function fetchWeeklyList(): Promise<
  Array<{ year: number; week: number; path: string; modified_at: string }>
> {
  const res = await fetch(`${API_BASE}/api/weekly/list`);
  if (!res.ok) throw new Error(`fetchWeeklyList failed: ${res.status}`);
  const json = await res.json();
  return json.data;
}
