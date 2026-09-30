"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  History,
  GitBranch,
  Code,
  FileText,
  Trash2,
  Eye,
  Search,
  Flame,
  Calendar,
} from "lucide-react";
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
    if (!confirm("Are you sure you want to delete this roast record?")) return;
    try {
      await deleteRoast(roastId, token);
      setRoasts((prev) => prev.filter((r) => r.id !== roastId));
      if (selectedRoast?.id === roastId) {
        setSelectedRoast(null);
      }
    } catch {
      alert("Failed to delete roast.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col h-[85vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-border-glow bg-surface-raised shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/20 text-accent border border-accent/30">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Your Roast History</h3>
              <p className="text-xs text-gray-400">
                Audited repos, snippets, and resumes for @{user?.username} ({roasts.length} total)
              </p>
            </div>
          </div>
          <button
            onClick={closeHistory}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface border border-border text-gray-400 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-surface/50 px-6 py-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "repo", label: "Repos" },
              { id: "snippet", label: "Snippets" },
              { id: "resume", label: "Resumes" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                  filter === f.id
                    ? "bg-accent text-black font-bold"
                    : "text-gray-400 hover:text-white hover:bg-surface"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by repo or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface pl-8 pr-3 py-1.5 text-xs text-gray-200 outline-none focus:border-accent"
            />
          </div>
        </div>

        {/* Roasts List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-20 text-gray-400 font-mono text-xs">
              Loading your roasts...
            </div>
          ) : filteredRoasts.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <Flame className="h-10 w-10 mx-auto text-gray-600 mb-2" />
              <p className="font-semibold text-sm">No roasts match your filter.</p>
              <p className="text-xs text-gray-500 mt-1">Submit a roast in the Roast Studio above!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRoasts.map((r) => {
                const isRepo = r.target_type === "repo";
                const isSnippet = r.target_type === "snippet";
                const isResume = r.target_type === "resume";

                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRoast(r)}
                    className="group cursor-pointer rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/60 hover:bg-surface-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-raised text-accent">
                            {isRepo && <GitBranch className="h-3 w-3" />}
                            {isSnippet && <Code className="h-3 w-3" />}
                            {isResume && <FileText className="h-3 w-3" />}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {r.target_type}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-white">
                            {r.code_quality_score}/100
                          </span>
                          <button
                            onClick={(e) => handleDelete(r.id, e)}
                            className="rounded p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-sm text-white truncate mb-1 group-hover:text-accent transition">
                        {r.target_url_or_name}
                      </h4>
                      <p className="text-xs text-gray-400 line-clamp-2 italic leading-relaxed">
                        &ldquo;{r.roast}&rdquo;
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      </span>
                      <span className="text-accent font-semibold flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>Open Details</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Roast Modal View */}
        {selectedRoast && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto">
              <button
                onClick={() => setSelectedRoast(null)}
                className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-surface-card border border-border text-gray-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
              <RoastCard roast={selectedRoast} onReset={() => setSelectedRoast(null)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
