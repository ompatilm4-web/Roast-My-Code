"use client";

import React, { useState } from "react";
import { Loader2, Play } from "lucide-react";
import { roastSnippet, ApiError, type RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface SnippetFormProps {
  tone: string;
  onResult: (roast: RoastResponse) => void;
}

const PRESETS = [
  {
    name: "eval() Security Risk",
    lang: "TypeScript",
    title: "auth_validator.ts",
    code: `function checkAccess(user: any, token: any) {\n  var secret = "supersecret123";\n  if (user.role == "admin" || token.includes("boss")) {\n    return true;\n  }\n  return eval("token.isValid") == true;\n}`,
  },
  {
    name: "O(n³) Nested Loop",
    lang: "Python",
    title: "matrix_optimizer.py",
    code: `def compute_similarity(matrix):\n    res = []\n    for i in range(len(matrix)):\n        for j in range(len(matrix)):\n            for k in range(len(matrix)):\n                if matrix[i][j] == matrix[j][k]:\n                    res.append(matrix[i][j] * 2)\n    return res`,
  },
  {
    name: "Callback Pyramid",
    lang: "JavaScript",
    title: "fetch_user_orders.js",
    code: `getUser(id, function(user) {\n  getProfile(user, function(profile) {\n    getOrders(profile, function(orders) {\n      getInvoice(orders[0], function(invoice) {\n        sendEmail(invoice, function(res) {\n          console.log("Email sent maybe? " + res);\n        });\n      });\n    });\n  });\n});`,
  },
];

const LANGUAGES = [
  "auto",
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "C++",
  "Java",
  "SQL",
  "HTML/CSS",
];

export default function SnippetForm({ tone, onResult }: SnippetFormProps) {
  const { token, refreshUser } = useAuth();
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("auto");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);

  const PHASES = [
    "Parsing AST syntax...",
    "Scanning anti-patterns & complexity...",
    "Analyzing architectural debt...",
    "Drafting senior blueprint...",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setPhaseIndex(0);

    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 900);

    try {
      const result = await roastSnippet(
        code.trim(),
        language,
        title || undefined,
        tone,
        token
      );
      onResult(result);
      refreshUser();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to audit snippet. Please check your network."
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  }

  function loadPreset(preset: typeof PRESETS[0]) {
    setCode(preset.code);
    setLanguage(preset.lang);
    setTitle(preset.title);
    setError(null);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      {/* Preset Pills */}
      <div>
        <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="font-medium uppercase tracking-wider text-zinc-500">Quick Test Snippets</span>
          <span>Click to load</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(p)}
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-xs text-zinc-400 transition hover:border-zinc-700 hover:text-zinc-200"
            >
              <Play className="h-3 w-3 text-zinc-500" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Snippet details bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-300">
            Filename / Context (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. auth_service.ts"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-300">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-zinc-200 outline-none transition focus:border-zinc-500"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l} className="bg-surface-raised">
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Code Textarea */}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-300">
          Code Snippet
        </label>
        <textarea
          rows={7}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste raw code here..."
          disabled={loading}
          className="w-full rounded-lg border border-border bg-surface p-3 text-xs font-mono-code text-zinc-200 placeholder-zinc-500 outline-none transition focus:border-zinc-500"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/20 p-2.5 text-xs text-red-400">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-surface p-2.5 text-xs text-zinc-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
          <span>{PHASES[phaseIndex]}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-100 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Auditing Snippet...</span>
          </>
        ) : (
          <span>Audit Code Snippet</span>
        )}
      </button>
    </form>
  );
}
