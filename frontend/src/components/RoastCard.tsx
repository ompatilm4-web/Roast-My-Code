"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Flame,
  Copy,
  Check,
  Share2,
  Code,
  FileText,
  Sparkles,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import GithubIcon from "./GithubIcon";
import ScoreGauge from "./ScoreGauge";
import type { RoastResponse } from "@/lib/api";

interface RoastCardProps {
  roast: RoastResponse;
  onReset?: () => void;
}

export default function RoastCard({ roast, onReset }: RoastCardProps) {
  const [copiedRoast, setCopiedRoast] = useState(false);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [showCode, setShowCode] = useState(false);

  const isResume = roast.target_type === "resume";
  const isSnippet = roast.target_type === "snippet";
  const isRepo = roast.target_type === "repo";

  function triggerConfetti() {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#ef4444", "#eab308", "#10b981", "#38bdf8"],
    });
  }

  function handleCopyRoast() {
    navigator.clipboard.writeText(`🔥 RoastMyCode on ${roast.target_url_or_name}:\n"${roast.roast}"`);
    setCopiedRoast(true);
    triggerConfetti();
    setTimeout(() => setCopiedRoast(false), 2000);
  }

  function handleCopyMarkdown() {
    const md = `### 🔥 RoastMyCode Audit: ${roast.target_url_or_name}

> "${roast.roast}"

**Scores:**
- **${isResume ? "Impact & Specificity" : "Code Quality"}**: ${roast.code_quality_score}/100
- **${isResume ? "Clarity & Formatting" : "Documentation"}**: ${roast.documentation_score}/100
- **${isResume ? "Structure & Relevance" : "Architecture"}**: ${roast.architecture_score}/100

#### 🛠️ Actionable Senior Blueprint:
${roast.constructive_blueprint.map((b, i) => `${i + 1}. ${b}`).join("\n")}

*Audited by RoastMyCode — AI Code Auditor*`;

    navigator.clipboard.writeText(md);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  }

  function toggleCheck(index: number) {
    setCheckedItems((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  return (
    <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-border-glow bg-surface-raised p-6 shadow-2xl backdrop-blur-xl sm:p-8 animate-in fade-in zoom-in-95 duration-300">
      {/* Flame glow behind */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-flame-orange/20 blur-3xl" />

      {/* Header bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-flame-orange/20 text-flame-orange border border-flame-orange/30">
            {isRepo && <GithubIcon className="h-5 w-5" />}
            {isSnippet && <Code className="h-5 w-5" />}
            {isResume && <FileText className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {isRepo ? "GitHub Repo Audit" : isSnippet ? "Code Snippet Roast" : "Resume CV Breakdown"}
              </span>
              {roast.language && (
                <span className="rounded-md bg-cyber-purple/20 px-2 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-500/30">
                  {roast.language}
                </span>
              )}
            </div>
            <h2 className="text-xl font-black text-white sm:text-2xl truncate max-w-md">
              {roast.target_url_or_name}
            </h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRoast}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-flame-orange hover:text-white"
            title="Copy roast quote"
          >
            {copiedRoast ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <Copy className="h-3.5 w-3.5 text-flame-orange" />}
            <span>{copiedRoast ? "Copied Quote!" : "Copy Roast"}</span>
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-gray-200 transition hover:border-cyber-cyan hover:text-white"
            title="Copy Markdown report"
          >
            {copiedMarkdown ? <Check className="h-3.5 w-3.5 text-cyber-emerald" /> : <Share2 className="h-3.5 w-3.5 text-cyber-cyan" />}
            <span>{copiedMarkdown ? "Copied Markdown!" : "Export MD"}</span>
          </button>
          <button
            onClick={triggerConfetti}
            className="rounded-lg border border-border bg-surface p-1.5 text-gray-300 transition hover:text-yellow-400"
            title="Celebrate"
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Sarcastic Roast Quote Card */}
      <div className="relative mb-8 rounded-2xl border border-flame-red/30 bg-gradient-to-r from-flame-red/10 via-flame-orange/10 to-transparent p-5 shadow-flame-glow-sm sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-flame-orange">
          <Flame className="h-4 w-4 animate-flame-flicker" />
          <span>The Verdict</span>
        </div>
        <blockquote className="text-base sm:text-lg italic leading-relaxed text-gray-100">
          &ldquo;{roast.roast}&rdquo;
        </blockquote>
      </div>

      {/* Code Snippet accordion (if present) */}
      {roast.code_snippet && (
        <div className="mb-8 rounded-xl border border-border bg-background/80 overflow-hidden">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-400 transition hover:text-white hover:bg-surface"
          >
            <span className="flex items-center gap-2">
              <Code className="h-4 w-4 text-cyber-cyan" />
              <span>Inspected Code Snippet ({roast.code_snippet.split("\n").length} lines)</span>
            </span>
            {showCode ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showCode && (
            <pre className="max-h-60 overflow-y-auto p-4 text-xs font-mono-code text-gray-300 border-t border-border/60 bg-black/40">
              <code>{roast.code_snippet}</code>
            </pre>
          )}
        </div>
      )}

      {/* 3 Circular Score Gauges */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ScoreGauge
          label={isResume ? "Impact & Metrics" : "Code Quality"}
          score={roast.code_quality_score}
          subtitle={isResume ? "Quantified achievements" : "Idiomatic syntax & cleanliness"}
        />
        <ScoreGauge
          label={isResume ? "Clarity & Format" : "Documentation"}
          score={roast.documentation_score}
          subtitle={isResume ? "Formatting & conciseness" : "README, comments & specs"}
        />
        <ScoreGauge
          label={isResume ? "Structure & Relevance" : "Architecture"}
          score={roast.architecture_score}
          subtitle={isResume ? "Career narrative & ATS" : "Modularity & scalability"}
        />
      </div>

      {/* The Constructive Blueprint Checklist */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-cyber-emerald/20 text-cyber-emerald">
              ✓
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              The Senior Architect Blueprint
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            {Object.values(checkedItems).filter(Boolean).length} / {roast.constructive_blueprint.length} refactored
          </span>
        </div>

        <ul className="space-y-2.5">
          {roast.constructive_blueprint.map((tip, i) => {
            const isDone = !!checkedItems[i];
            return (
              <li
                key={i}
                onClick={() => toggleCheck(i)}
                className={`group flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition ${
                  isDone
                    ? "border-cyber-emerald/30 bg-cyber-emerald/5 text-gray-400 line-through"
                    : "border-border/60 bg-surface-raised/50 text-gray-200 hover:border-accent/40 hover:bg-surface-raised"
                }`}
              >
                <div className="mt-0.5 text-accent group-hover:scale-110 transition">
                  {isDone ? (
                    <CheckSquare className="h-4 w-4 text-cyber-emerald" />
                  ) : (
                    <Square className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <span className="flex-1 leading-relaxed">{tip}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {onReset && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={onReset}
            className="text-xs font-semibold text-gray-400 transition hover:text-accent underline underline-offset-4"
          >
            Roast another repository, snippet or resume ↑
          </button>
        </div>
      )}
    </div>
  );
}
