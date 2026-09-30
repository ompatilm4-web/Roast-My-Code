"use client";

import React, { useState } from "react";
import { Flame, Loader2, Sparkles, Star } from "lucide-react";
import GithubIcon from "./GithubIcon";
import { roastGithubRepo, ApiError, type RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface RepoFormProps {
  tone: string;
  onResult: (roast: RoastResponse) => void;
}

const POPULAR_REPOS = [
  "pallets/flask",
  "fastapi/fastapi",
  "shadcn-ui/ui",
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
    "Connecting to GitHub REST API...",
    "Traversing file tree & commit patterns...",
    "Inspecting README & architectural debt...",
    "Generating brutal verdict & blueprint...",
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
          : "Failed to roast repository. Check the URL and try again."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      {/* Quick Suggestions */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider">Popular Repos to Roast:</span>
          <span>Click to fill</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {POPULAR_REPOS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setRepo(sample);
                setError(null);
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-gray-300 transition hover:border-flame-orange hover:bg-surface-raised hover:text-white"
            >
              <GithubIcon className="h-3 w-3 text-flame-orange" />
              <span>{sample}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <div>
        <label htmlFor="repo" className="mb-1 block text-xs font-semibold text-gray-300">
          GitHub Repository (owner/repo or full URL)
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <GithubIcon className="h-4 w-4" />
            </div>
            <input
              id="repo"
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g. octocat/Hello-World or https://github.com/..."
              disabled={loading}
              className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !repo.trim()}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flame-red to-flame-orange px-6 py-2.5 text-sm font-bold text-black shadow-flame-glow-sm transition hover:scale-105 hover:shadow-flame-glow disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Roasting...</span>
              </>
            ) : (
              <>
                <Flame className="h-4 w-4" />
                <span>Roast Repo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-flame-orange/30 bg-flame-orange/5 p-3 text-xs font-mono text-flame-orange">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{PHASES[phaseIndex]}</span>
        </div>
      )}
    </form>
  );
}
