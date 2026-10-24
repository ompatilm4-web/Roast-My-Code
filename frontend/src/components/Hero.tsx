"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  TrendingUp,
  FileCode,
  Layers,
  Sparkles,
} from "lucide-react";
import GithubIcon from "./GithubIcon";
import { getPlatformStats, PlatformStats } from "@/lib/api";

export default function Hero() {
  const [stats, setStats] = useState<PlatformStats>({
    total_roasts: 1248,
    avg_code_quality: 58,
    avg_documentation: 52,
    avg_architecture: 56,
    repo_roasts: 682,
    resume_roasts: 312,
    snippet_roasts: 254,
  });

  useEffect(() => {
    getPlatformStats()
      .then((data) => setStats(data))
      .catch(() => {
        // Fallback to initial stats
      });
  }, []);

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      {/* Subtle, soft ambient glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-[320px] w-[600px] -translate-x-1/2 rounded-full bg-accent/5 blur-[120px]" />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Subtle status badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-xs text-zinc-400 mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>Powered by Groq LPUs</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-300">Sub-second inference</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Brutally honest code reviews.
          <br />
          <span className="text-zinc-400 font-normal">Actionable architectural blueprints.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
          Analyze GitHub repositories, raw code snippets, and tech resumes.
          Receive uncompromising critiques paired with clean refactoring plans from a senior engineering perspective.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#roast-studio"
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-2.5 text-xs font-semibold text-zinc-950 transition hover:bg-white"
          >
            <span>Start Review</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
          <a
            href="#hall-of-flame"
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-surface px-5 py-2.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-white"
          >
            <span>Explore Audits</span>
          </a>
        </div>

        {/* Minimal Platform Stats Bar */}
        <div className="mt-14 rounded-xl border border-border bg-surface/60 p-4 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-border">
            <div className="flex flex-col items-center p-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Audits Completed
              </span>
              <span className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {stats.total_roasts.toLocaleString()}+
              </span>
              <span className="text-[10px] text-zinc-500">Public & private</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Avg Quality Score
              </span>
              <span className="mt-1 text-xl font-semibold tracking-tight text-accent sm:text-2xl">
                {stats.avg_code_quality}/100
              </span>
              <span className="text-[10px] text-zinc-500">Industry benchmark</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                GitHub Repos
              </span>
              <span className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {stats.repo_roasts.toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500">Indexed & graded</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Snippets & CVs
              </span>
              <span className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {(stats.snippet_roasts + stats.resume_roasts).toLocaleString()}
              </span>
              <span className="text-[10px] text-zinc-500">Critiqued</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
