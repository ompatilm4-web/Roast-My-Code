"use client";

import { useState } from "react";
import { roastGithubRepo, ApiError, type RoastResponse } from "@/lib/api";

interface RepoFormProps {
  githubUsername?: string;
  onResult: (roast: RoastResponse) => void;
}

export default function RepoForm({ githubUsername, onResult }: RepoFormProps) {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repo.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const result = await roastGithubRepo(repo.trim(), githubUsername);
      onResult(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-3">
      <label htmlFor="repo" className="block text-sm font-medium text-gray-300">
        GitHub repo (owner/repo or full URL)
      </label>
      <div className="flex gap-2">
        <input
          id="repo"
          type="text"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="octocat/Hello-World"
          className="flex-1 rounded-lg border border-border bg-black/30 px-4 py-2 text-gray-200 placeholder-gray-500 outline-none focus:border-accent"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !repo.trim()}
          className="rounded-lg bg-accent px-6 py-2 font-semibold text-black transition hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Roasting..." : "Roast it"}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </form>
  );
}
