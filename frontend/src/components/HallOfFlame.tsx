"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  Code,
  FileText,
  Filter,
  Eye,
  X,
  TrendingDown,
  Sparkles,
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
    <section id="hall-of-flame" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 scroll-mt-20">
      {/* Glow orb */}
      <div className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 rounded-full bg-flame-red/10 blur-[100px]" />

      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-flame-red/30 bg-flame-red/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-flame-red mb-3">
          <Flame className="h-3.5 w-3.5 animate-flame-flicker" />
          <span>Public Exhibition</span>
        </div>
        <h2 className="text-3xl font-black text-white sm:text-5xl">
          The Hall of <span className="gradient-text">Flame</span>
        </h2>
        <p className="mt-2 text-sm text-gray-400 max-w-2xl mx-auto">
          Real repositories, code disasters, and resumes shredded in our public furnace.
          Click any card to inspect the full senior blueprint and scores.
        </p>

        {/* Filter buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {[
            { id: "all", label: "All Roasts" },
            { id: "repo", label: "GitHub Repos" },
            { id: "snippet", label: "Code Snippets" },
            { id: "resume", label: "Resumes" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                filter === f.id
                  ? "bg-flame-orange text-black shadow-flame-glow-sm"
                  : "border border-border bg-surface text-gray-400 hover:text-white hover:border-border-glow"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Cards */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="flex items-center gap-2 text-sm font-mono text-gray-400">
            <Flame className="h-5 w-5 animate-spin text-flame-orange" />
            <span>Summoning recent victims...</span>
          </div>
        </div>
      ) : roasts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-gray-400">
          <Flame className="h-8 w-8 mx-auto text-gray-600 mb-2" />
          <p className="text-sm font-semibold">No roasts found in this category yet.</p>
          <p className="text-xs text-gray-500 mt-1">Be the first to submit a roast!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roasts.map((r) => {
            const isRepo = r.target_type === "repo";
            const isSnippet = r.target_type === "snippet";
            const isResume = r.target_type === "resume";

            return (
              <div
                key={r.id}
                onClick={() => handleInspect(r.id)}
                className="group relative cursor-pointer flex flex-col justify-between rounded-2xl border border-border bg-surface-raised/80 p-5 shadow-card-glow transition duration-200 hover:-translate-y-1 hover:border-flame-orange/60 hover:bg-surface-raised"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-surface border border-border text-flame-orange">
                        {isRepo && <GithubIcon className="h-3.5 w-3.5" />}
                        {isSnippet && <Code className="h-3.5 w-3.5" />}
                        {isResume && <FileText className="h-3.5 w-3.5" />}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {r.target_type}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-black border border-border">
                      <span className="text-gray-400 text-[10px]">Score:</span>
                      <span
                        className={
                          r.code_quality_score < 40
                            ? "text-red-400"
                            : r.code_quality_score < 70
                            ? "text-yellow-400"
                            : "text-emerald-400"
                        }
                      >
                        {r.code_quality_score}
                      </span>
                    </div>
                  </div>

                  {/* Target title */}
                  <h3 className="font-bold text-white text-base truncate mb-2 group-hover:text-flame-orange transition">
                    {r.target_url_or_name}
                  </h3>

                  {/* Sarcastic quote snippet */}
                  <p className="text-xs text-gray-300 italic line-clamp-3 leading-relaxed border-l-2 border-flame-red/60 pl-2.5 bg-black/20 py-1.5 rounded-r">
                    &ldquo;{r.roast_preview}&rdquo;
                  </p>
                </div>

                {/* Footer metadata */}
                <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span>
                    by {r.author_username ? `@${r.author_username}` : "Anonymous dev"}
                  </span>
                  <span className="flex items-center gap-1 text-accent font-semibold group-hover:underline">
                    <Eye className="h-3 w-3" />
                    <span>View Blueprint</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Inspect Modal */}
      {activeRoast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto">
            <button
              onClick={() => setActiveRoast(null)}
              className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-surface-card border border-border text-gray-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
            <RoastCard roast={activeRoast} onReset={() => setActiveRoast(null)} />
          </div>
        </div>
      )}
    </section>
  );
}
