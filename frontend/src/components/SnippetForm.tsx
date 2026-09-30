"use client";

import React, { useState } from "react";
import { Code, Flame, Sparkles, Loader2, Play } from "lucide-react";
import { roastSnippet, ApiError, type RoastResponse } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface SnippetFormProps {
  tone: string;
  onResult: (roast: RoastResponse) => void;
}

const PRESETS = [
  {
    name: "eval() & 'any' Disaster",
    lang: "TypeScript",
    title: "auth_validator.ts",
    code: `// Extremely production ready security\nfunction checkAccess(user: any, token: any) {\n  var secret = "supersecret123";\n  if (user.role == "admin" || token.includes("boss")) {\n    return true;\n  }\n  return eval("token.isValid") == true;\n}`,
  },
  {
    name: "O(n³) Nested Loop Hell",
    lang: "Python",
    title: "matrix_optimizer.py",
    code: `def compute_similarity(matrix):\n    res = []\n    for i in range(len(matrix)):\n        for j in range(len(matrix)):\n            for k in range(len(matrix)):\n                if matrix[i][j] == matrix[j][k]:\n                    res.append(matrix[i][j] * 2)\n    return res`,
  },
  {
    name: "Callback Pyramid of Doom",
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
    "Compiling AST syntax tree...",
    "Scanning for 17 unhandled code crimes...",
    "Channeling Senior Architect disappointment...",
    "Drafting architectural blueprint...",
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
          : "Failed to roast snippet. Please check your network."
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      {/* Preset Pills */}
      <div>
        <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
          <span className="font-semibold uppercase tracking-wider">Quick Code Disasters:</span>
          <span>Click to test instantly</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(p)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-gray-300 transition hover:border-flame-orange hover:bg-surface-raised hover:text-white"
            >
              <Play className="h-3 w-3 text-flame-orange" />
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Snippet details bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-300">
            Snippet Name / Context (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. userAuthService.ts or binarySearch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-300">
            Language
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-gray-200 outline-none focus:border-accent"
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
      <div className="relative">
        <div className="flex items-center justify-between rounded-t-xl border border-b-0 border-border bg-surface-raised px-4 py-2 text-xs font-mono text-gray-400">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 font-semibold text-gray-300">
              {title || "snippet.txt"}
            </span>
          </div>
          <span>{code.split("\n").length} lines</span>
        </div>

        <textarea
          rows={10}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Paste your code snippet here...\nfunction calculateTotal(items) {\n  var total = 0;\n  for(var i=0; i<items.length; i++) {\n    total += eval(items[i].price);\n  }\n  return total;\n}`}
          disabled={loading}
          className="w-full rounded-b-xl border border-border bg-black/60 p-4 font-mono-code text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-accent"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Roasting phase banner */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-flame-orange/30 bg-flame-orange/5 p-3 text-xs font-mono text-flame-orange">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{PHASES[phaseIndex]}</span>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={loading || !code.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-flame-red via-flame-orange to-flame-gold py-3 text-base font-extrabold text-black shadow-flame-glow-sm transition hover:scale-[1.01] hover:shadow-flame-glow disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Roasting Snippet...</span>
          </>
        ) : (
          <>
            <Flame className="h-5 w-5" />
            <span>Roast This Snippet</span>
          </>
        )}
      </button>
    </form>
  );
}
