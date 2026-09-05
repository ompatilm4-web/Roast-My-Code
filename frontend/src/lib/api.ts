/**
 * Typed fetch wrapper around the RoastMyCode FastAPI backend.
 * Set NEXT_PUBLIC_API_URL in .env.local (see .env.local.example).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface RoastResponse {
  id: string;
  target_type: "repo" | "resume";
  target_url_or_name: string;
  roast: string;
  code_quality_score: number;
  documentation_score: number;
  architecture_score: number;
  constructive_blueprint: string[];
  created_at: string;
}

export interface RoastListItem {
  id: string;
  target_type: "repo" | "resume";
  target_url_or_name: string;
  code_quality_score: number;
  documentation_score: number;
  architecture_score: number;
  created_at: string;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // response wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

export async function roastGithubRepo(
  repo: string,
  githubUsername?: string
): Promise<RoastResponse> {
  const res = await fetch(`${API_URL}/api/v1/roast/github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo, github_username: githubUsername || undefined }),
  });
  return handleResponse<RoastResponse>(res);
}

export async function roastResume(
  file: File,
  githubUsername?: string
): Promise<RoastResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (githubUsername) formData.append("github_username", githubUsername);

  const res = await fetch(`${API_URL}/api/v1/roast/resume`, {
    method: "POST",
    body: formData,
  });
  return handleResponse<RoastResponse>(res);
}

export async function getRoast(roastId: string): Promise<RoastResponse> {
  const res = await fetch(`${API_URL}/api/v1/roast/${roastId}`);
  return handleResponse<RoastResponse>(res);
}

export async function listUserRoasts(githubUsername: string): Promise<RoastListItem[]> {
  const res = await fetch(`${API_URL}/api/v1/roast/user/${githubUsername}`);
  return handleResponse<RoastListItem[]>(res);
}

export { ApiError };
