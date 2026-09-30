"use client";

import React, { useState, useRef } from "react";
import { Code, FileText, Flame, Sparkles, UserCheck } from "lucide-react";
import GithubIcon from "./GithubIcon";
import RepoForm from "./RepoForm";
import SnippetForm from "./SnippetForm";
import ResumeUpload from "./ResumeUpload";
import RoastCard from "./RoastCard";
import type { RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type Tab = "github" | "snippet" | "resume";

const TONES = [
  { id: "senior_dev", label: "🔥 Senior Tech Lead", desc: "Brutal, architectural, cynical" },
  { id: "gordon_ramsay", label: "🍳 Gordon Ramsay", desc: "Pure culinary-grade anger" },
  { id: "passive_aggressive", label: "🙃 Passive-Aggressive", desc: "'Per my previous review...'" },
  { id: "recruiter", label: "👔 Ruthless Recruiter", desc: "Resume & ATS shredder" },
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
    <section id="roast-studio" className="relative w-full max-w-4xl mx-auto px-4 py-12 scroll-mt-20">
      {/* Container Card */}
      <div className="rounded-3xl border border-border bg-surface-raised/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-flame-orange/30 bg-flame-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-flame-orange mb-3">
            <Flame className="h-3.5 w-3.5 animate-flame-flicker" />
            <span>Interactive Roast Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Choose Your <span className="gradient-text">Sacrifice</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Audit a full GitHub repo, paste a quick code snippet, or shred your resume PDF.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-2xl border border-border bg-surface p-1.5 shadow-inner">
            <button
              onClick={() => setTab("github")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                tab === "github"
                  ? "bg-gradient-to-r from-flame-red to-flame-orange text-black shadow-flame-glow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <GithubIcon className="h-4 w-4" />
              <span>GitHub Repo</span>
            </button>

            <button
              onClick={() => setTab("snippet")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                tab === "snippet"
                  ? "bg-gradient-to-r from-flame-red to-flame-orange text-black shadow-flame-glow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Code className="h-4 w-4" />
              <span>Code Snippet</span>
            </button>

            <button
              onClick={() => setTab("resume")}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
                tab === "resume"
                  ? "bg-gradient-to-r from-flame-red to-flame-orange text-black shadow-flame-glow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Resume PDF</span>
            </button>
          </div>
        </div>

        {/* Persona / Tone Selector */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
            <span className="font-semibold uppercase tracking-wider">Select Roast Personality:</span>
            <span>Choose how brutally you want to be treated</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TONES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={`rounded-xl border p-2.5 text-left transition ${
                  tone === t.id
                    ? "border-flame-orange bg-flame-orange/10 text-white shadow-flame-glow-sm"
                    : "border-border bg-surface text-gray-400 hover:border-border-glow hover:text-gray-200"
                }`}
              >
                <div className="text-xs font-bold truncate">{t.label}</div>
                <div className="text-[10px] text-gray-500 truncate mt-0.5">{t.desc}</div>
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
        <div className="mt-8 border-t border-border/60 pt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
          {user ? (
            <div className="flex items-center gap-1.5 text-cyber-emerald">
              <UserCheck className="h-4 w-4" />
              <span>
                Signed in as <strong>@{user.username}</strong> — roasts are saved to your personal history.
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Roasting in Guest Mode.</span>
              <button
                onClick={() => openAuthModal("register")}
                className="text-flame-orange font-bold hover:underline"
              >
                Create free account to save your history →
              </button>
            </div>
          )}
          <span className="font-mono text-[11px] text-gray-500">
            Latency &lt; 900ms via Groq LPU
          </span>
        </div>
      </div>

      {/* Roast Output Section */}
      {roast && (
        <div ref={resultRef} className="mt-12 flex justify-center scroll-mt-24">
          <RoastCard roast={roast} onReset={() => setRoast(null)} />
        </div>
      )}
    </section>
  );
}
