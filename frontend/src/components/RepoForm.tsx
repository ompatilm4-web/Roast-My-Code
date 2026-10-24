"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import GithubIcon from "./GithubIcon";
import { roastGithubRepo, ApiError, type RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface RepoFormProps {
  tone: string;
  onResult: (roast: RoastResponse) => void;
}

const POPULAR_REPOS = [
  "fastapi/fastapi",
  "shadcn-ui/ui",
  "pallets/flask",
  "facebook/react",
  "torvalds/linux",
];

export default function RepoForm({ tone, onResult }: RepoFormProps) {
  const { user, token, refreshUser } = useAuth();
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const PHASES = [
    "Connecting to repository...",
    "Indexing file tree & commit frequency...",
    "Analyzing README & architecture...",
    "Drafting blueprint...",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repo.trim()) return;

    setLoading(true);
    setError(null);
    setPhaseIndex(0);

    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 900);

    try {
      const result = await roastGithubRepo(
        repo.trim(),
        user?.github_username || undefined,
        tone,
        token
      );
      onResult(result);
      refreshUser();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to audit repository. Please check the repository name and try again."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      {/* Quick Suggestions */}
      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-medium uppercase tracking-wider text-zinc-500">Popular Repositories</span>
          <span>Click to select</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_REPOS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setRepo(sample);
                setError(null);
              }}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
            >
              <GithubIcon className="h-3 w-3 text-zinc-500" />
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div>
        <label htmlFor="repo" className="mb-1.5 block text-xs font-medium text-zinc-300">
          GitHub Repository
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
              <GithubIcon className="h-4 w-4" />
            </div>
            <input
              id="repo"
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="owner/repo or https://github.com/..."
              disabled={loading}
              className="w-full rounded-lg border border-border bg-surface pl-9 pr-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !repo.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-zinc-100 px-5 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <span>Audit Repo</span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-2.5 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
          <span>{PHASES[phaseIndex]}</span>
        </div>
      )}
    </form>
  );
}
