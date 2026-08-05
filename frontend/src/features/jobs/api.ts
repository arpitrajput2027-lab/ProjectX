const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Job {
  id: string;
  job_title: string;
  company?: string;
  location?: string;
  work_mode: string;
  seniority: string;
  tags: string[];
  match_score: number;
  match_label: string;
  match_reason?: string;
  source_platform?: string;
  source_url?: string;
  posted_relative: string;
  saved: boolean;
  applied: boolean;
  apply_mode?: "manual" | "agentic" | null;
}

export interface FetchJobsParams {
  keyword?: string;
  location?: string;
  workMode?: string;
  minScore?: number;
  sortBy?: string;
}

export interface RefreshParams {
  resumeText?: string;
  jobRoles?: string[];
  location?: string;
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${body}`);
  }
  return res.json();
}

export function fetchJobs({ keyword, location, workMode, minScore, sortBy }: FetchJobsParams = {}): Promise<Job[]> {
  const params = new URLSearchParams();
  if (keyword) params.set("keyword", keyword);
  if (location) params.set("location", location);
  if (workMode && workMode !== "any") params.set("work_mode", workMode);
  if (minScore) params.set("min_score", String(minScore));
  if (sortBy) params.set("sort_by", sortBy === "best_match" ? "score" : "latest");
  const qs = params.toString();
  return request(`/api/jobs${qs ? `?${qs}` : ""}`);
}

export function toggleSave(jobId: string): Promise<Job> {
  return request(`/api/jobs/${jobId}/save`, { method: "POST" });
}

export function applyToJob(jobId: string, mode: "manual" | "agentic" = "manual"): Promise<Job> {
  return request(`/api/jobs/${jobId}/apply?mode=${encodeURIComponent(mode)}`, { method: "POST" });
}

export function refreshJobs({ resumeText, jobRoles = [], location = "" }: RefreshParams = {}): Promise<{ added: number; total: number; message: string }> {
  const params = new URLSearchParams();
  if (resumeText) params.set("resume_text", resumeText);
  if (location) params.set("location", location);
  jobRoles.forEach((r) => params.append("job_roles", r));
  const qs = params.toString();
  return request(`/api/jobs/refresh${qs ? `?${qs}` : ""}`, { method: "POST" });
}

export async function parseResume(file: File): Promise<{ suggested_roles: string[]; suggested_location: string; suggested_work_mode: string; resume_text: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/jobs/parse-resume`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} — ${body}`);
  }
  return res.json();
}
