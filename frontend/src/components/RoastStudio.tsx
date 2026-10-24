"use client";

import React, { useState, useRef } from "react";
import { Code, FileText, UserCheck } from "lucide-react";
import GithubIcon from "./GithubIcon";
import RepoForm from "./RepoForm";
import SnippetForm from "./SnippetForm";
import ResumeUpload from "./ResumeUpload";
import RoastCard from "./RoastCard";
import type { RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Tab = "github" | "snippet" | "resume";

const TONES = [
  { id: "senior_dev", label: "Senior Tech Lead", desc: "Rigorous, architectural, direct" },
  { id: "gordon_ramsay", label: "Gordon Ramsay", desc: "Unforgiving culinary rage" },
  { id: "passive_aggressive", label: "Passive-Aggressive", desc: "'As per my previous review...'" },
  { id: "recruiter", label: "Tech Recruiter", desc: "ATS scanner & impact filter" },
];

export default function RoastStudio() {
  const { user, openAuthModal } = useAuth();
  const [tab, setTab] = useState<Tab>("github");
  const [tone, setTone] = useState("senior_dev");
  const [roast, setRoast] = useState<RoastResponse | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function handleResult(newRoast: RoastResponse) {
    setRoast(newRoast);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  return (
    <section id="roast-studio" className="relative w-full max-w-3xl mx-auto px-4 py-8 scroll-mt-16">
      {/* Studio Container Card */}
      <div className="rounded-2xl border border-border bg-surface-raised/60 p-5 sm:p-8 backdrop-blur-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
            Audit Studio
          </h2>
          <p className="mt-1 text-xs text-zinc-400">
            Submit a GitHub repository, raw snippet, or technical resume for comprehensive review.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-border bg-surface p-1">
            <button
              onClick={() => setTab("github")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                tab === "github"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <GithubIcon className="h-3.5 w-3.5" />
              <span>GitHub Repo</span>
            </button>

            <button
              onClick={() => setTab("snippet")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                tab === "snippet"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>Code Snippet</span>
            </button>

            <button
              onClick={() => setTab("resume")}
              className={`flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-medium transition ${
                tab === "resume"
                  ? "bg-zinc-800 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Resume PDF</span>
            </button>
          </div>
        </div>

        {/* Persona / Tone Selector */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
            <span className="font-medium uppercase tracking-wider text-zinc-500">Review Persona</span>
            <span>Tone of critique</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`rounded-lg border p-2 text-left transition ${
                  tone === t.id
                    ? "border-accent/60 bg-accent/10 text-white"
                    : "border-border bg-surface/80 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                }`}
              >
                <div className="text-xs font-medium truncate">{t.label}</div>
                <div className="text-[10px] text-zinc-500 truncate mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Forms Container */}
        <div className="flex flex-col items-center">
          {tab === "github" && <RepoForm tone={tone} onResult={handleResult} />}
          {tab === "snippet" && <SnippetForm tone={tone} onResult={handleResult} />}
          {tab === "resume" && <ResumeUpload tone={tone} onResult={handleResult} />}
        </div>

        {/* User status note */}
        <div className="mt-6 border-t border-border pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500">
          {user ? (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <UserCheck className="h-3.5 w-3.5" />
              <span>
                Signed in as <strong className="text-zinc-200">@{user.username}</strong>. Audits saved automatically.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <span>Guest mode.</span>
              <button
                onClick={() => openAuthModal("register")}
                className="text-zinc-300 underline underline-offset-2 hover:text-white"
              >
                Create account to save history
              </button>
            </div>
          )}
          <span className="font-mono text-zinc-500">
            Latency &lt; 900ms
          </span>
        </div>
      </div>

      {/* Roast Output Section */}
      {roast && (
        <div ref={resultRef} className="mt-8 flex justify-center scroll-mt-20">
          <RoastCard roast={roast} onReset={() => setRoast(null)} />
        </div>
      )}
    </section>
  );
}
