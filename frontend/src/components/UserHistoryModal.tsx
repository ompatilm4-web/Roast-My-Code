"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  History,
  Code,
  FileText,
  Trash2,
  Search,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import GithubIcon from "./GithubIcon";
import { useAuth } from "@/context/AuthContext";
import { getMyRoasts, deleteRoast, RoastResponse } from "@/lib/api";
import RoastCard from "./RoastCard";

export default function UserHistoryModal() {
  const { user, token, isHistoryOpen, closeHistory } = useAuth();
  const [roasts, setRoasts] = useState<RoastResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [selectedRoast, setSelectedRoast] = useState<RoastResponse | null>(null);

  useEffect(() => {
    if (isHistoryOpen && token) {
      loadHistory();
    }
  }, [isHistoryOpen, token]);

  async function loadHistory() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await getMyRoasts(token);
      setRoasts(data);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(roastId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this audit record?")) return;
    try {
      await deleteRoast(roastId, token);
      setRoasts((prev) => prev.filter((r) => r.id !== roastId));
      if (selectedRoast?.id === roastId) {
        setSelectedRoast(null);
      }
    } catch {
      alert("Failed to delete record.");
    }
  }

  if (!isHistoryOpen) return null;

  const filteredRoasts = roasts.filter((r) => {
    const matchesFilter = filter === "all" || r.target_type === filter;
    const matchesSearch =
      r.target_url_or_name.toLowerCase().includes(search.toLowerCase()) ||
      r.roast.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative flex flex-col h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-modal">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-zinc-400">
              <History className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Audit History</h3>
              <p className="text-[11px] text-zinc-500">
                @{user?.username} ({roasts.length} saved reviews)
              </p>
            </div>
          </div>
          <button
            onClick={closeHistory}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {selectedRoast ? (
          <div className="flex-1 overflow-y-auto p-5">
            <button
              onClick={() => setSelectedRoast(null)}
              className="mb-4 flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to history list</span>
            </button>
            <RoastCard roast={selectedRoast} onReset={() => setSelectedRoast(null)} />
          </div>
        ) : (
          <>
            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface/40 px-5 py-2.5">
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "All" },
                  { id: "repo", label: "Repos" },
                  { id: "snippet", label: "Snippets" },
                  { id: "resume", label: "Resumes" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                      filter === f.id
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Filter audits..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-lg border border-border bg-surface pl-8 pr-3 py-1 text-xs text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading ? (
                <div className="flex h-40 items-center justify-center text-xs text-zinc-500">
                  <Loader2 className="h-4 w-4 animate-spin text-accent mr-2" />
                  <span>Loading history...</span>
                </div>
              ) : filteredRoasts.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center text-center text-zinc-500">
                  <p className="text-xs">No records found matching your filter.</p>
                </div>
              ) : (
                filteredRoasts.map((r) => {
                  const isRepo = r.target_type === "repo";
                  const isSnippet = r.target_type === "snippet";
                  const isResume = r.target_type === "resume";

                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoast(r)}
                      className="group flex cursor-pointer items-center justify-between rounded-lg border border-border bg-surface/50 p-3 transition hover:border-zinc-700 hover:bg-surface"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded border border-border bg-surface-raised text-zinc-400">
                          {isRepo && <GithubIcon className="h-3.5 w-3.5" />}
                          {isSnippet && <Code className="h-3.5 w-3.5" />}
                          {isResume && <FileText className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-zinc-200 group-hover:text-white">
                            {r.target_url_or_name}
                          </p>
                          <p className="truncate text-[11px] text-zinc-500 italic max-w-md">
                            &ldquo;{r.roast}&rdquo;
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <span className="text-xs font-semibold text-zinc-300">
                          {r.code_quality_score}/100
                        </span>
                        <button
                          onClick={(e) => handleDelete(r.id, e)}
                          className="rounded p-1 text-zinc-500 hover:text-red-400 hover:bg-surface-raised transition"
                          title="Delete record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
