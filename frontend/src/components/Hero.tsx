"use client";

import React, { useEffect, useState } from "react";
import {
  Flame,
  Zap,
  Code2,
  FileText,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
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
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
      {/* Background radial glowing aura */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-flame-orange/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 -right-20 -z-10 h-[300px] w-[400px] rounded-full bg-cyber-purple/10 blur-[100px]" />

      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
        {/* Fire pill badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-flame-orange/30 bg-surface-raised/80 px-4 py-1.5 text-xs font-semibold text-gray-200 shadow-flame-glow-sm backdrop-blur-md mb-6">
          <span className="flex h-2 w-2 rounded-full bg-flame-orange animate-ping" />
          <span className="text-flame-orange font-bold">New v2.0 Turbo:</span>
          <span>Direct Code Snippets & Groq LPU Inference</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Where <span className="text-gray-400 line-through decoration-flame-red/80 decoration-wavy">Garbage Code</span>
          <br className="hidden sm:inline" /> Gets Roasted Into{" "}
          <span className="gradient-text">Pure Gold.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-3xl text-base text-gray-300 sm:text-xl">
          Unforgiving, brutally witty critiques of your <strong>GitHub Repos</strong>,{" "}
          <strong>raw Code Snippets</strong>, and <strong>Tech Resumes</strong>.
          We don&apos;t just burn your bad habits — we deliver a concrete, senior-architect blueprint to salvage your work.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#roast-studio"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-flame-red via-flame-orange to-flame-gold px-6 py-3.5 text-base font-extrabold text-black shadow-flame-glow transition hover:scale-105"
          >
            <Flame className="h-5 w-5 text-black" />
            <span>Roast My Code Now</span>
            <ArrowRight className="h-4 w-4 text-black" />
          </a>
          <a
            href="#hall-of-flame"
            className="flex items-center gap-2 rounded-xl border border-border bg-surface-raised px-6 py-3.5 text-base font-semibold text-gray-200 transition hover:border-flame-red hover:bg-surface-card"
          >
            <span>Explore Hall of Flame</span>
          </a>
          <a
            href="#integrations"
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface/50 px-5 py-3.5 text-sm font-semibold text-gray-300 transition hover:text-cyber-cyan hover:border-cyber-cyan/50"
          >
            <Zap className="h-4 w-4 text-cyber-cyan" />
            <span>Integrations</span>
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyber-emerald" />
            Sub-second Groq Inference
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyber-emerald" />
            3-Point Architecture Analysis
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyber-emerald" />
            Actionable Senior Blueprints
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-cyber-emerald" />
            100% Free & No Credit Card
          </span>
        </div>

        {/* Live Platform Stats Ticker Card */}
        <div className="mt-12 rounded-2xl border border-border bg-surface/80 p-5 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:divide-x sm:divide-border/60">
            <div className="flex flex-col items-center p-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Flame className="h-4 w-4 text-flame-orange" />
                <span>Total Roasts</span>
              </div>
              <span className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {stats.total_roasts.toLocaleString()}+
              </span>
              <span className="text-[11px] text-gray-500">Repos, snippets & CVs</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <TrendingUp className="h-4 w-4 text-cyber-emerald" />
                <span>Avg Quality Score</span>
              </div>
              <span className="mt-1 text-2xl font-black text-cyber-emerald sm:text-3xl">
                {stats.avg_code_quality}/100
              </span>
              <span className="text-[11px] text-gray-500">Needs tough love</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <GithubIcon className="h-4 w-4 text-white" />
                <span>GitHub Repos</span>
              </div>
              <span className="mt-1 text-2xl font-black text-white sm:text-3xl">
                {stats.repo_roasts.toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500">Public repos parsed</span>
            </div>

            <div className="flex flex-col items-center p-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <Code2 className="h-4 w-4 text-cyber-cyan" />
                <span>Snippets & CVs</span>
              </div>
              <span className="mt-1 text-2xl font-black text-cyber-cyan sm:text-3xl">
                {(stats.snippet_roasts + stats.resume_roasts).toLocaleString()}
              </span>
              <span className="text-[11px] text-gray-500">Shredded & improved</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
