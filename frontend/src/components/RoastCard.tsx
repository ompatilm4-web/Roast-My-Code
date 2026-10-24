"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  Share2,
  Code,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  ArrowLeft,
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

  function handleCopyRoast() {
    navigator.clipboard.writeText(`Review of ${roast.target_url_or_name}:\n"${roast.roast}"`);
    setCopiedRoast(true);
    setTimeout(() => setCopiedRoast(false), 2000);
  }

  function handleCopyMarkdown() {
    const md = `### Audit: ${roast.target_url_or_name}

> "${roast.roast}"

**Scores:**
- **${isResume ? "Impact & Metrics" : "Code Quality"}**: ${roast.code_quality_score}/100
- **${isResume ? "Clarity & Format" : "Documentation"}**: ${roast.documentation_score}/100
- **${isResume ? "Structure & Relevance" : "Architecture"}**: ${roast.architecture_score}/100

#### Actionable Blueprint:
${roast.constructive_blueprint.map((b, i) => `${i + 1}. ${b}`).join("\n")}

*Audited by RoastMyCode*`;

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
    <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface-raised/80 p-5 sm:p-7 backdrop-blur-md animate-fade-in">
      {/* Header bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-zinc-300">
            {isRepo && <GithubIcon className="h-4 w-4" />}
            {isSnippet && <Code className="h-4 w-4" />}
            {isResume && <FileText className="h-4 w-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                {isRepo ? "GitHub Repository" : isSnippet ? "Code Snippet" : "Resume PDF"}
              </span>
              {roast.language && (
                <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 border border-white/5">
                  {roast.language}
                </span>
              )}
            </div>
            <h2 className="text-base font-semibold text-white truncate max-w-sm">
              {roast.target_url_or_name}
            </h2>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyRoast}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            title="Copy critique"
          >
            {copiedRoast ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-400" />}
            <span>{copiedRoast ? "Copied" : "Copy"}</span>
          </button>

          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
            title="Export Markdown"
          >
            {copiedMarkdown ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-zinc-400" />}
            <span>{copiedMarkdown ? "Copied MD" : "Export"}</span>
          </button>
        </div>
      </div>

      {/* Critique Quote */}
      <div className="mb-6 rounded-xl border border-border bg-surface/50 p-4">
        <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-accent">
          Verdict
        </div>
        <blockquote className="text-sm leading-relaxed text-zinc-200 italic">
          &ldquo;{roast.roast}&rdquo;
        </blockquote>
      </div>

      {/* Code Snippet accordion (if present) */}
      {roast.code_snippet && (
        <div className="mb-6 rounded-lg border border-border bg-surface overflow-hidden">
          <button
            onClick={() => setShowCode(!showCode)}
            className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            <span>Analyzed Code ({roast.code_snippet.split("\n").length} lines)</span>
            {showCode ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showCode && (
            <pre className="max-h-56 overflow-y-auto p-3 text-xs font-mono-code text-zinc-300 border-t border-border bg-black/40">
              <code>{roast.code_snippet}</code>
            </pre>
          )}
        </div>
      )}

      {/* 3 Circular Score Gauges */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <ScoreGauge
          label={isResume ? "Impact & Metrics" : "Code Quality"}
          score={roast.code_quality_score}
          subtitle={isResume ? "Quantifiable data" : "Clean & idiomatic"}
        />
        <ScoreGauge
          label={isResume ? "Clarity & Format" : "Documentation"}
          score={roast.documentation_score}
          subtitle={isResume ? "Visual hierarchy" : "README & specs"}
        />
        <ScoreGauge
          label={isResume ? "Structure" : "Architecture"}
          score={roast.architecture_score}
          subtitle={isResume ? "Career narrative" : "Modularity & scale"}
        />
      </div>

      {/* Constructive Blueprint Checklist */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Actionable Blueprint
          </h3>
          <span className="text-[11px] text-zinc-500">
            {Object.values(checkedItems).filter(Boolean).length} of {roast.constructive_blueprint.length} addressed
          </span>
        </div>

        <ul className="space-y-2">
          {roast.constructive_blueprint.map((tip, i) => {
            const isDone = !!checkedItems[i];
            return (
              <li
                key={i}
                onClick={() => toggleCheck(i)}
                className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-2.5 text-xs transition ${
                  isDone
                    ? "border-emerald-500/20 bg-emerald-500/5 text-zinc-500 line-through"
                    : "border-border/60 bg-surface-raised/40 text-zinc-300 hover:border-zinc-700 hover:text-white"
                }`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 text-zinc-600" />
                  )}
                </div>
                <span className="leading-relaxed">{tip}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {onReset && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-400 transition hover:text-zinc-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Audit another target</span>
          </button>
        </div>
      )}
    </div>
  );
}
