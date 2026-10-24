"use client";

import React, { useEffect, useState } from "react";
import {
  Code,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import GithubIcon from "./GithubIcon";
import { getRecentRoasts, getRoast, RoastListItem, RoastResponse } from "@/lib/api";
import RoastCard from "./RoastCard";

export default function HallOfFlame() {
  const [roasts, setRoasts] = useState<RoastListItem[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [activeRoast, setActiveRoast] = useState<RoastResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchRoasts(filter);
  }, [filter]);

  async function fetchRoasts(type: string) {
    setLoading(true);
    try {
      const data = await getRecentRoasts(12, type);
      setRoasts(data);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  async function handleInspect(id: string) {
    setLoadingDetails(true);
    try {
      const data = await getRoast(id);
      setActiveRoast(data);
    } catch {
      // Ignore
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <section id="hall-of-flame" className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 scroll-mt-16">
      <div className="mb-8 text-center">
        <h2 className="text-xl sm:text-3xl font-semibold tracking-tight text-white">
          Public Audits
        </h2>
        <p className="mt-1.5 text-xs text-zinc-400 max-w-lg mx-auto">
          Explore recent community evaluations. Click any card to inspect the full review and architectural blueprint.
        </p>

        {/* Filter buttons */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-1.5">
          {[
            { id: "all", label: "All Audits" },
            { id: "repo", label: "Repositories" },
            { id: "snippet", label: "Snippets" },
            { id: "resume", label: "Resumes" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                filter === f.id
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "border border-border bg-surface text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            <span>Loading recent audits...</span>
          </div>
        </div>
      ) : roasts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-zinc-500">
          <p className="text-xs font-medium">No audits found in this category yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roasts.map((r) => {
            const isRepo = r.target_type === "repo";
            const isSnippet = r.target_type === "snippet";
            const isResume = r.target_type === "resume";

            return (
              <div
                key={r.id}
                onClick={() => handleInspect(r.id)}
                className="group relative cursor-pointer flex flex-col justify-between rounded-xl border border-border bg-surface-raised/40 p-4 transition-all duration-200 hover:border-zinc-700 hover:bg-surface-raised"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded border border-border bg-surface text-zinc-400">
                        {isRepo && <GithubIcon className="h-3 w-3" />}
                        {isSnippet && <Code className="h-3 w-3" />}
                        {isResume && <FileText className="h-3 w-3" />}
                      </span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        {r.target_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 rounded bg-surface px-2 py-0.5 text-xs font-medium border border-border">
                      <span className="text-zinc-500 text-[10px]">Score</span>
                      <span
                        className={
                          r.code_quality_score < 45
                            ? "text-red-400"
                            : r.code_quality_score < 75
                            ? "text-amber-400"
                            : "text-emerald-400"
                        }
                      >
                        {r.code_quality_score}
                      </span>
                    </div>
                  </div>

                  {/* Target title */}
                  <h3 className="font-medium text-zinc-100 text-xs truncate mb-2 group-hover:text-white transition-colors">
                    {r.target_url_or_name}
                  </h3>

                  {/* Quote preview */}
                  <p className="text-xs text-zinc-400 italic line-clamp-3 leading-relaxed border-l border-zinc-700 pl-2">
                    &ldquo;{r.roast_preview}&rdquo;
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Click to view details</span>
                  <span className="text-zinc-400 font-medium group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {activeRoast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-h-[90vh] overflow-y-auto w-full max-w-2xl">
            <button
              onClick={() => setActiveRoast(null)}
              className="absolute top-4 right-4 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-zinc-400 hover:text-white transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
            <RoastCard roast={activeRoast} onReset={() => setActiveRoast(null)} />
          </div>
        </div>
      )}

      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-raised p-4 text-xs text-zinc-300">
            <Loader2 className="h-4 w-4 animate-spin text-accent" />
            <span>Loading audit details...</span>
          </div>
        </div>
      )}
    </section>
  );
}
