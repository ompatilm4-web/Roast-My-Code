/**
 * Typed API Client for RoastMyCode FastAPI Backend.
 * Handles Authentication, Roasts (Repo, Snippet, Resume), History, and Platform Stats.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface UserResponse {
  id: string;
  username: string;
  email?: string | null;
  full_name?: string | null;
  github_username?: string | null;
  avatar_url?: string | null;
  custom_api_key_set: boolean;
  created_at: string;
  roast_count: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export interface RoastResponse {
  id: string;
  target_type: "repo" | "resume" | "snippet";
  target_url_or_name: string;
  code_snippet?: string | null;
  roast: string;
  code_quality_score: number;
  documentation_score: number;
  architecture_score: number;
  constructive_blueprint: string[];
  language?: string | null;
  tone?: string | null;
  is_public: boolean;
  created_at: string;
  author_username?: string | null;
}

export interface RoastListItem {
  id: string;
  target_type: "repo" | "resume" | "snippet";
  target_url_or_name: string;
  code_quality_score: number;
  documentation_score: number;
  architecture_score: number;
  roast_preview?: string | null;
  language?: string | null;
  tone?: string | null;
  created_at: string;
  author_username?: string | null;
}

export interface PlatformStats {
  total_roasts: number;
  avg_code_quality: number;
  avg_documentation: number;
  avg_architecture: number;
  repo_roasts: number;
  resume_roasts: number;
  snippet_roasts: number;
}

export class ApiError extends Error {
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
      // response wasn't JSON
    }
    throw new ApiError(res.status, detail);
  }
  return res.json() as Promise<T>;
}

function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// ---------- Authentication Endpoints ----------

export async function registerUser(data: {
  username: string;
  password: string;
  email?: string;
  full_name?: string;
  github_username?: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<TokenResponse>(res);
}

export async function loginUser(credentials: {
  username_or_email: string;
  password: string;
}): Promise<TokenResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return handleResponse<TokenResponse>(res);
}

export async function getCurrentUser(token: string): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse<UserResponse>(res);
}

export async function updateUserProfile(
  data: {
    full_name?: string;
    github_username?: string;
    avatar_url?: string;
    custom_api_key?: string;
  },
  token: string
): Promise<UserResponse> {
  const res = await fetch(`${API_URL}/api/v1/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<UserResponse>(res);
}

export async function getMyRoasts(token: string): Promise<RoastResponse[]> {
  const res = await fetch(`${API_URL}/api/v1/auth/me/roasts`, {
    headers: getAuthHeaders(token),
  });
  return handleResponse<RoastResponse[]>(res);
}

// ---------- Roast Endpoints ----------

export async function roastGithubRepo(
  repo: string,
  githubUsername?: string,
  tone: string = "senior_dev",
  token?: string | null
): Promise<RoastResponse> {
  const res = await fetch(`${API_URL}/api/v1/roast/github`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify({
      repo,
      github_username: githubUsername || undefined,
      tone,
    }),
  });
  return handleResponse<RoastResponse>(res);
}

export async function roastSnippet(
  code: string,
  language: string = "auto",
  title?: string,
  tone: string = "senior_dev",
  token?: string | null
): Promise<RoastResponse> {
  const res = await fetch(`${API_URL}/api/v1/roast/snippet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(token),
    },
    body: JSON.stringify({
      code,
      language,
      title: title || undefined,
      tone,
    }),
  });
  return handleResponse<RoastResponse>(res);
}

export async function roastResume(
  file: File,
  githubUsername?: string,
  tone: string = "recruiter",
  token?: string | null
): Promise<RoastResponse> {
  const formData = new FormData();
  formData.append("file", file);
  if (githubUsername) formData.append("github_username", githubUsername);
  if (tone) formData.append("tone", tone);

  const res = await fetch(`${API_URL}/api/v1/roast/resume`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: formData,
  });
  return handleResponse<RoastResponse>(res);
}

// ---------- History & Stats Endpoints ----------

export async function getRoast(roastId: string): Promise<RoastResponse> {
  const res = await fetch(`${API_URL}/api/v1/roast/${roastId}`);
  return handleResponse<RoastResponse>(res);
}

export async function getRecentRoasts(
  limit: number = 12,
  targetType?: string
): Promise<RoastListItem[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (targetType && targetType !== "all") {
    params.set("target_type", targetType);
  }
  const res = await fetch(`${API_URL}/api/v1/roast/recent?${params.toString()}`);
  return handleResponse<RoastListItem[]>(res);
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const res = await fetch(`${API_URL}/api/v1/roast/stats`);
  return handleResponse<PlatformStats>(res);
}

export async function listUserRoasts(githubUsername: string): Promise<RoastListItem[]> {
  const res = await fetch(`${API_URL}/api/v1/roast/user/${githubUsername}`);
  return handleResponse<RoastListItem[]>(res);
}

export async function deleteRoast(
  roastId: string,
  token?: string | null
): Promise<{ status: string; id: string }> {
  const res = await fetch(`${API_URL}/api/v1/roast/${roastId}`, {
    method: "DELETE",
    headers: getAuthHeaders(token),
  });
  return handleResponse<{ status: string; id: string }>(res);
}
